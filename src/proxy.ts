import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// 1. Enterprise-grade High-performance Local In-Memory Rate Limiter (Safety Fallback)
const localIpCounts = new Map<string, { count: number; resetTime: number }>()

function checkLocalRateLimit(ip: string, category: string, limit: number): { limited: boolean; current: number } {
  const now = Date.now()
  const windowMs = 60 * 1000 // 1 minute window
  const key = `${category}:${ip}`

  const record = localIpCounts.get(key)
  if (!record) {
    localIpCounts.set(key, { count: 1, resetTime: now + windowMs })
    return { limited: false, current: 1 }
  }

  if (now > record.resetTime) {
    record.count = 1
    record.resetTime = now + windowMs
    return { limited: false, current: 1 }
  }

  record.count += 1
  return { limited: record.count > limit, current: record.count }
}

// 2. Production Upstash Redis Rate Limiter with Local Resiliency Fallback
async function checkUpstashRateLimit(ip: string, category: string, limit: number): Promise<{ limited: boolean; current: number }> {
  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN

  if (!url || !token) {
    // Falls back gracefully to local rate limiter if Redis credentials are not configured yet
    return checkLocalRateLimit(ip, category, limit)
  }

  try {
    const key = `ratelimit:${category}:${ip}`
    
    // Call Upstash pipeline REST API for high-speed atomic transactions
    const response = await fetch(`${url}/pipeline`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify([
        ['INCR', key],
        ['EXPIRE', key, 60] // 60 seconds sliding window
      ])
    })

    const data = await response.json()
    if (Array.isArray(data) && data[0] && typeof data[0].result === 'number') {
      const current = data[0].result
      return { limited: current > limit, current }
    }
  } catch (err) {
    console.error('⚠️ [SECURITY AUDIT] Upstash Redis error, falling back to local memory guard:', err)
  }

  return checkLocalRateLimit(ip, category, limit)
}

// 3. Dynamic Category Config Mapping
function getRateLimitConfig(pathname: string): { category: string; limit: number } {
  if (pathname.includes('/login') || pathname.includes('/api/auth/login')) {
    return { category: 'login', limit: 5 } // 5 requests per minute
  }
  if (pathname.includes('/signup') || pathname.includes('/api/auth/signup')) {
    return { category: 'signup', limit: 5 } // 5 requests per minute
  }
  if (pathname.startsWith('/api/recommend') || pathname.startsWith('/api/translate')) {
    return { category: 'ai', limit: 10 } // 10 requests per minute
  }
  if (pathname.startsWith('/api/menu') || pathname.includes('/menu/new')) {
    return { category: 'menu_creation', limit: 20 } // 20 requests per minute
  }
  if (pathname.startsWith('/api/')) {
    return { category: 'general_api', limit: 100 } // 100 requests per minute
  }
  return { category: 'general', limit: 200 } // 200 general requests per minute
}

export async function proxy(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown-ip'
  const pathname = request.nextUrl.pathname

  // Generate high-entropy cryptographic nonce for the CSP rules
  const nonce = crypto.randomUUID 
    ? Buffer.from(crypto.randomUUID()).toString('base64') 
    : Buffer.from(Math.random().toString()).toString('base64')

  const isDev = process.env.NODE_ENV === 'development'
  // Strengthen Content Security Policy to completely limit styled/scripted injections while allowing Next.js client hydration
  const cspHeader = [
    `default-src 'self'`,
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic' ${isDev ? "'unsafe-eval'" : ''} https://checkout.razorpay.com`,
    `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com`,
    `img-src 'self' data: https: blob:`,
    `font-src 'self' https://fonts.gstatic.com`,
    `connect-src 'self' https://efgizrrfrfarnpifnema.supabase.co wss://efgizrrfrfarnpifnema.supabase.co https://api.openai.com https://checkout.razorpay.com https://api.razorpay.com`,
    `frame-src 'self' https://checkout.razorpay.com https://api.razorpay.com`,
    `object-src 'none'`,
    `base-uri 'self'`,
    `form-action 'self'`,
    `frame-ancestors 'none'`,
    `block-all-mixed-content`,
    `upgrade-insecure-requests`
  ].join('; ')

  // Set the nonce and CSP on the request headers so that Next.js SSR compiles with them
  request.headers.set('x-nonce', nonce)
  request.headers.set('Content-Security-Policy', cspHeader)

  const applySecurityHeaders = (res: NextResponse) => {
    const headers = res.headers
    headers.set('X-Frame-Options', 'DENY')
    headers.set('X-Content-Type-Options', 'nosniff')
    headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
    headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload')
    headers.set(
      'Permissions-Policy',
      'camera=(), microphone=(), geolocation=(), interest-cohort=()'
    )
    headers.set('Content-Security-Policy', cspHeader)
    return res
  }

  // 4. Rate Limiting Check on Edge Gateway
  const config = getRateLimitConfig(pathname)
  const rateLimitResult = await checkUpstashRateLimit(ip, config.category, config.limit)

  if (rateLimitResult.limited) {
    // SECURITY MONITORING: Log suspicious rate violations to server stdout/alerts
    console.warn(
      `🚨 [SUSPICIOUS ACTIVITY DETECTED] Rate limit violation at IP ${ip} trying to access "${pathname}" (Category: "${config.category}", Limit: ${config.limit}, Current Hits: ${rateLimitResult.current})`
    )

    return applySecurityHeaders(new NextResponse(
      JSON.stringify({ 
        error: 'Too many requests. Enterprise-grade rate limiting has throttled this connection to safeguard the platform.',
        code: 'RATE_LIMIT_EXCEEDED',
        category: config.category,
        limit: config.limit,
        resetInSeconds: 60
      }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': '60',
        },
      }
    ))
  }

  let supabaseResponse = NextResponse.next({
    request,
  })

  // 5. Secure Supabase SSR Session handling
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // 6. Route Authorization Guards (Guards /dashboard, /admin, /settings, /restaurant)
  const isProtectedRoute = 
    pathname.startsWith('/dashboard') || 
    pathname.startsWith('/admin') || 
    pathname.startsWith('/settings') || 
    pathname.startsWith('/restaurant-setup')

  if (!user && isProtectedRoute) {
    // SECURITY MONITORING: Log unauthorized access attempt
    console.warn(`🔒 [UNAUTHORIZED ACCESS BLOCKED] Guest from IP ${ip} tried to access protected route "${pathname}"`)
    
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return applySecurityHeaders(NextResponse.redirect(url))
  }

  return applySecurityHeaders(supabaseResponse)
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

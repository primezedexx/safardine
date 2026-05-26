import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

// Initialize Upstash Redis only if the environment variables are available
const redis = (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN)
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
  : null;

// Auth routes limit: 5 requests per minute
const authRatelimit = redis 
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, '1 m'),
      analytics: true,
    })
  : null;

// General API routes limit: 100 requests per minute
const apiRatelimit = redis 
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(100, '1 m'),
      analytics: true,
    })
  : null;

export async function middleware(request: NextRequest) {
  // If Upstash isn't configured, bypass rate limiting
  if (!redis || !authRatelimit || !apiRatelimit) {
    return NextResponse.next();
  }

  // Determine if the route is an API route
  if (request.nextUrl.pathname.startsWith('/api')) {
    // Get the user's IP address
    const ip = request.headers.get('x-forwarded-for') ?? '127.0.0.1';

    // Special limit for auth routes
    if (request.nextUrl.pathname.startsWith('/api/auth')) {
      const { success, limit, reset, remaining } = await authRatelimit.limit(`auth_${ip}`);
      
      if (!success) {
        return NextResponse.json(
          { error: 'Too Many Requests' },
          { 
            status: 429,
            headers: {
              'X-RateLimit-Limit': limit.toString(),
              'X-RateLimit-Remaining': remaining.toString(),
              'X-RateLimit-Reset': reset.toString()
            }
          }
        );
      }
      return NextResponse.next();
    }
    
    // General limit for other API routes
    const { success, limit, reset, remaining } = await apiRatelimit.limit(`api_${ip}`);
      
    if (!success) {
      return NextResponse.json(
        { error: 'Too Many Requests' },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Limit': limit.toString(),
            'X-RateLimit-Remaining': remaining.toString(),
            'X-RateLimit-Reset': reset.toString()
          }
        }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/api/:path*',
}

import type { NextConfig } from "next"

const securityHeaders = [
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  { key: 'X-XSS-Protection', value: '1; mode=block' },
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://checkout.razorpay.com https://challenges.cloudflare.com https://cdn.onesignal.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "img-src 'self' data: https:",
      "connect-src 'self' https://*.supabase.co https://api.upstash.io wss://*.supabase.co https://checkout.razorpay.com https://api.razorpay.com https://onesignal.com https://cdn.onesignal.com https://formsubmit.co https://challenges.cloudflare.com",
      "font-src 'self' data: https://fonts.gstatic.com",
      "frame-ancestors 'none'",
      "frame-src 'self' https://checkout.razorpay.com https://challenges.cloudflare.com",
      "base-uri 'self'",
      "form-action 'self'",
    ].join('; ')
  }
]

const nextConfig: NextConfig = {
  poweredByHeader: false,
  productionBrowserSourceMaps: false,
  compress: true,
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  experimental: {
    serverActions: { bodySizeLimit: "6mb" },
    optimizePackageImports: ['lucide-react', 'recharts', 'date-fns'],
    cssChunking: 'strict',
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 86400,
    deviceSizes: [390, 414, 768, 1024, 1280],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
    remotePatterns: [{ protocol: "https", hostname: "images.unsplash.com" }],
  },
  async headers() {
    return [{ source: '/(.*)', headers: securityHeaders }]
  }
}
export default nextConfig

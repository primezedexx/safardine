import type { NextConfig } from "next"

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
}
export default nextConfig

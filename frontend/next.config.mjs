import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const backendOrigin = (process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8081').replace(/\/$/, '');
const backendApiBase = backendOrigin.endsWith('/api') ? backendOrigin : `${backendOrigin}/api`;

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: "standalone",
  turbopack: {
    root: __dirname,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8081',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'i.imgur.com',
      },
      {
        // Cloudflare R2 public bucket (stageway-assets)
        protocol: 'https',
        hostname: '*.r2.dev',
      },
      {
        // Cloudflare R2 custom domain (set when R2 is configured)
        protocol: 'https',
        hostname: 'assets.stageway.app',
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/auth/:path*",
        headers: [
          {
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin-allow-popups"
          }
        ]
      }
    ];
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${backendApiBase}/:path*`,
      },
    ];
  }
};

export default nextConfig;

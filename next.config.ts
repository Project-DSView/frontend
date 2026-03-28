import type { NextConfig } from 'next';

const minioProxyTarget =
  process.env.NEXT_PUBLIC_MINIO_PROXY_TARGET ||
  process.env.MINIO_PROXY_TARGET ||
  (process.env.NODE_ENV === 'production' ? 'http://minio:9000' : 'http://localhost:9000');

const nextConfig: NextConfig = {
  /* config options here */

  // Allow GitHub Codespaces origins in dev mode (fixes RSC CORS errors)
  allowedDevOrigins: ['*.app.github.dev'],

  turbopack: {},

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '9000',
        pathname: '/dsview/**',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'example.com',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      },
    ],
  },

  // Proxy configuration for MinIO images
  async rewrites() {
    return [
      {
        source: '/api/minio/:path*',
        destination: `${minioProxyTarget}/:path*`,
      },
    ];
  },

  // Security headers for non-Vercel deployments (e.g., standalone server behind reverse proxy)
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Content-Security-Policy',
            value:
              "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://*.vercel.app https://dsview-backend-fastapi.onrender.com https://*.app.github.dev; frame-src 'self' blob:; frame-ancestors 'none';",
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=()',
          },
        ],
      },
    ];
  },

  // Bundle optimization
  experimental: {
    optimizePackageImports: [
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-toggle',
      '@radix-ui/react-toggle-group',
      'lucide-react',
      'framer-motion',
    ],
  },

  // Webpack optimization
  webpack: (config, { isServer }) => {
    // Optimize bundle splitting
    if (!isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
          },
          ui: {
            test: /[\\/]node_modules[\\/]@radix-ui[\\/]/,
            name: 'ui',
            chunks: 'all',
          },
          codemirror: {
            test: /[\\/]node_modules[\\/]@uiw[\\/]/,
            name: 'codemirror',
            chunks: 'all',
          },
        },
      };
    }

    return config;
  },
  output: 'standalone',
};

export default nextConfig;

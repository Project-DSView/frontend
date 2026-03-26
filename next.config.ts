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

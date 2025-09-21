import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    domains: ['lh3.googleusercontent.com'],
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
    // Tree shaking for heavy libraries
    config.resolve.alias = {
      ...config.resolve.alias,
      html2canvas: 'html2canvas/dist/html2canvas.min.js',
    };

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
};

export default nextConfig;

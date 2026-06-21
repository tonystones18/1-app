/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Allow MUI emotion styles
  compiler: {
    emotion: true,
  },
  // Proxy API calls to NestJS gateway in development
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000'}/api/:path*`,
      },
    ];
  },
  experimental: {
    optimizePackageImports: ['@mui/material', '@mui/icons-material', '@mui/x-data-grid'],
  },
};

export default nextConfig;

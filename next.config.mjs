/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    if (process.env.NEXT_PUBLIC_ENABLE_NEXT_REWRITE === 'true') {
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
      return [
        {
          source: '/api/:path*',
          destination: `${backendUrl}/api/:path*`,
        },
      ];
    }
    return [];
  },
};

export default nextConfig;

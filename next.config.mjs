/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'ddragon.leagueoflegends.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'raw.communitydragon.org',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'fearless-raccoon-603.convex.cloud',
        port: '',
        pathname: '/api/storage/**',
      },
    ],
  },
}

export default nextConfig

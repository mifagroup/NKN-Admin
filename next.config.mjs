/** @type {import('next').NextConfig} */
const nextConfig = {
  // typescript: {
  //   ignoreBuildErrors: true
  // },
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: '192.168.1.100',
        port: '8000'
      },
      {
        protocol: 'http',
        hostname: '192.168.1.40',
        port: '8000'
      },
      {
        protocol: 'http',
        hostname: '192.168.1.55',
        port: '8000'
      },
      {
        protocol: 'https',
        hostname: 'dev.weton.biz'
      },
      {
        protocol: 'http',
        hostname: 'api.mifadev.ir'
      }
    ]
  }
}

export default nextConfig

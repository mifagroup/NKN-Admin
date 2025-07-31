/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true
  },
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        port: '8000'
      },
      {
        protocol: 'http',
        hostname: 'api.mifadev.ir'
      }
    ]
  }
}

export default nextConfig

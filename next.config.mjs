/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true
  },
  eslint: {
    ignoreDuringBuilds: true
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
  },
  transpilePackages: ['@mui/material', '@mui/system', '@mui/icons-material', '@mui/lab'],
  experimental: {
    optimizePackageImports: ['@mui/material', '@mui/icons-material', '@mui/lab']
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      }
    }
    return config
  }
}

export default nextConfig

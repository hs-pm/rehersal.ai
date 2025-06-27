/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['@groq/groq-sdk'],
  },
  images: {
    domains: ['localhost'],
  },
}

module.exports = nextConfig 
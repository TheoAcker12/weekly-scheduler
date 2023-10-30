/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: '/home',
        destination: '/',
        permanent: false
      }
    ]
  },
  reactStrictMode: true,
}

module.exports = nextConfig

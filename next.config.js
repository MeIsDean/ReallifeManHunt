/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  // This is needed for GitHub Pages
  basePath: process.env.NODE_ENV === 'production' ? '/ReallifeManHunt' : '',
  // Ensure trailing slashes for GitHub Pages
  trailingSlash: true,
  // Disable server-side features since we're doing static export
  reactStrictMode: true,
  swcMinify: true,
}

module.exports = nextConfig 
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  // This is needed for GitHub Pages
  basePath: process.env.NODE_ENV === 'production' ? '/ReallifeManHunt' : '',
}

module.exports = nextConfig 
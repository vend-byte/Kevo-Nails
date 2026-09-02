/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
    // Cloudinary already optimizes/transforms images on its own CDN.
    // Letting Next.js ALSO proxy-fetch and re-process them through
    // /_next/image is redundant and was causing "upstream image response
    // timed out" errors. Skipping Next's optimizer here means <Image>
    // renders Cloudinary's URL directly — faster and more reliable.
    unoptimized: true,
  },
};

module.exports = nextConfig;

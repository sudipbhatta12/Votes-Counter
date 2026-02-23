import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "assets-generalelection2082.ekantipur.com",
      },
      {
        protocol: "http",
        hostname: "jcss-generalelection2082.ekantipur.com",
      },
    ],
    unoptimized: true, // For PWA offline support
  },
};

export default nextConfig;

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: { ignoreBuildErrors: true },
  serverExternalPackages: ['alasql'],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "i.pravatar.cc",
      },
    ],
  },
};

export default nextConfig;

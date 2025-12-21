import type { NextConfig } from "next";

const nextConfig: NextConfig & { swcMinify?: boolean } = {
  // eslint: {
  //   ignoreDuringBuilds: true,
  // },

  reactStrictMode: false,
  swcMinify: false,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "api.zunailbar.mn",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "",
        pathname: "/**",
      },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "20mb",
    },
  },
};

export default nextConfig;

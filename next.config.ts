import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/",
        destination: "/dashboard",
        permanent: true, // Set to false for temporary redirects
      },
    ];
  },
};

export default nextConfig;

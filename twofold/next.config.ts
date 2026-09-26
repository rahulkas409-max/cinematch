import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Stops Next from picking the parent CineMatch lockfile as the workspace root.
  turbopack: { root: __dirname },
};

export default nextConfig;

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [{ protocol: "https", hostname: "image.tmdb.org", pathname: "/t/p/**" }],
  },
  // Vibha's birthday page is a static site in public/vibha; send /vibha to its index.html
  // so the relative images/ and music/ paths resolve.
  async redirects() {
    return [
      { source: "/vibha", destination: "/vibha/index.html", permanent: false },
      { source: "/vibha/", destination: "/vibha/index.html", permanent: false },
    ];
  },
};

export default nextConfig;

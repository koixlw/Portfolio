import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // node:sqlite is a Node builtin — keep it out of the bundler.
  serverExternalPackages: [],
  experimental: {
    // Keep the SQLite handle a singleton across HMR reloads in dev.
    serverActions: {
      bodySizeLimit: "12mb",
    },
  },
  images: {
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
};

export default nextConfig;

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: "export",
  // GitHub Pages project path.
  basePath: "/openwash",
  trailingSlash: true,
  images: { unoptimized: true },
  turbopack: {},
};

export default nextConfig;


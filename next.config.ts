import type { NextConfig } from "next";

const isElectron = process.env.BUILD_TARGET === "electron";

const nextConfig: NextConfig = {
  images: { unoptimized: true },
  ...(isElectron
    ? {
        output: "export",
        distDir: "out",
      }
    : {}),
};

export default nextConfig;

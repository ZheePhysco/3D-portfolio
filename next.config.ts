import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Dimensi asli foto: portrait 941x1672, frames 3840x2160
    unoptimized: true,
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384, 470, 941],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
  },
};

export default nextConfig;

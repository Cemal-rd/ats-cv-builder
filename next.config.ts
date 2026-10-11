import type { NextConfig } from "next";

/**
 * GitHub Pages siteyi /<depo-adı> alt yolunda sunar. Yol, CI'da
 * actions/configure-pages çıktısından NEXT_BASE_PATH olarak gelir;
 * yerelde boş kalır.
 */
const basePath = process.env.NEXT_BASE_PATH ?? "";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Uygulama tamamen istemci tarafında çalışır: statik HTML/JS olarak dışa aktarılır.
  output: "export",
  basePath,
  trailingSlash: true,
  images: { unoptimized: true },
};

export default nextConfig;

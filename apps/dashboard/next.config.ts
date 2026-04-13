import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["newman", "postman-runtime", "postman-sandbox", "terser"],
};

export default nextConfig;

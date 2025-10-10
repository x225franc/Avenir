import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  turbo: {
    root: path.resolve(__dirname, '../../../')  // Chemin absolu vers la racine Avenir/
  }
};

export default nextConfig;

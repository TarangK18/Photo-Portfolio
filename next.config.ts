import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Tailwind v4 via its Turbopack loader (replaces the PostCSS setup).
  turbopack: {
    rules: {
      "*.css": { loaders: ["@tailwindcss/turbopack"], as: "*.css" },
    },
  },
};

export default nextConfig;

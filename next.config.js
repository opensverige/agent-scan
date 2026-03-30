const path = require("path");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  /**
   * Om det finns flera package-lock.json (t.ex. i hemkatalogen) kan Next välja fel root
   * och chunk-filer (./611.js osv) hittas inte — rensa .next efter ändring.
   * @see https://nextjs.org/docs/app/api-reference/config/next-config-js/output#caveats
   */
  outputFileTracingRoot: path.join(__dirname),

  /**
   * Lokal dev: använd `npm run dev` (Turbopack) för färre webpack/HMR-strul.
   * `next build` använder fortfarande webpack — `npm run build` ska alltid gå igenom.
   */
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      // Stabilare namngivna chunk-id i webpack dev (vissa HMR-buggar med "numeric")
      config.optimization = {
        ...config.optimization,
        moduleIds: "named",
        chunkIds: "named",
      };
    }
    return config;
  },
};

module.exports = nextConfig;

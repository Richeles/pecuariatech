/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: ["127.0.0.1"],

  // 🔁 Proxy para o Motor π (Python) no Render
  async rewrites() {
    return [
      {
        source: "/api/importar/arquivo",
        destination: "https://pecuariatech-motor-pi.onrender.com/api/importar/arquivo",
      },
    ];
  },
};

module.exports = nextConfig;

// --- Sentry (mantido exatamente como estava) ---
const { withSentryConfig } = require("@sentry/nextjs");

module.exports = withSentryConfig(module.exports, {
  org: "pecuariatech",
  project: "pecuariatech-nextjs",
  silent: !process.env.CI,
  widenClientFileUpload: true,
  tunnelRoute: "/monitoring",
  webpack: {
    automaticVercelMonitors: true,
    treeshake: {
      removeDebugLogging: true,
    },
  },
});
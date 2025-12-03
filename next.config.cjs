const nextConfig = {
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
  output: "standalone",
  distDir: ".next",
};
module.exports = nextConfig;

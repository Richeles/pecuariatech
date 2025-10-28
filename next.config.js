import next from 'next';

/**
 * 🌾 PecuariaTech Next.js Config (versão limpa e moderna)
 * - ESLint ignorado durante build
 * - Suporte a server actions
 * - React Strict Mode habilitado
 */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverActions: true
  },
  eslint: {
    ignoreDuringBuilds: true
  }
};

export default nextConfig;

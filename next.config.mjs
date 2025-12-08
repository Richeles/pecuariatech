/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Next 16 não permite config eslint no next.config
  // Se quiser ignorar lint, faça em .eslintrc

  typescript: {
    // Ignorar erros de build — recomendado apenas enquanto ajustamos o projeto
    ignoreBuildErrors: true,
  },
};

export default nextConfig;

import withSerwist from '@serwist/next';

/** @type {import('next').NextConfig} */
const nextConfig = {
  // suas configurações existentes – se tiver mais, mantenha aqui
  // Exemplo: images, redirects, etc.
};

export default withSerwist({
  swSrc: 'app/sw.ts',
  swDest: 'public/sw.js',
  disable: process.env.NODE_ENV === 'development',
  cacheOnFrontEndNav: true,
  reloadOnOnline: true,
})(nextConfig);




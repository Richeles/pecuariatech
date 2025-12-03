/** UTF-8 fix */
const nextConfig = {
  reactStrictMode: true,
  headers: async () => [
    {
      source: '/(.*)',
      headers: [
        { key: 'Content-Type', value: 'text/html; charset=utf-8' },
      ],
    },
  ],
};
module.exports = nextConfig;

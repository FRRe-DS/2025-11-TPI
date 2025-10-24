import { NextConfig } from 'next';

const nextConfig: NextConfig = {
  webpack(config) {
    // Configurar el loader de SVG
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack'],
    });

    return config;
  },
  // Otras configuraciones de Next.js si las necesitas
};

export default nextConfig;

/** @type {import('next').NextConfig} */
const nextConfig = {
  // ... (cualquier otra configuración que ya tengas)

  // Añade esto:
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: ["@svgr/webpack"],
    });

    return config;
  },
};

module.exports = nextConfig;

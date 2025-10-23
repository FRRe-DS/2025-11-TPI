import type { NextConfig } from "next";
import { config } from 'dotenv';

// Load environment variables
config({ path: '.env.local' });

const nextConfig: NextConfig = {
  /* config options here */
  serverExternalPackages: ['pg']
};

export default nextConfig;

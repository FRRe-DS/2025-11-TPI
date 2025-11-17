import type { NextConfig } from "next";
import { config } from 'dotenv';
import path from 'path';

// Load environment variables
config({ path: '.env.local' });

const nextConfig: NextConfig = {
  /* config options here */
  serverExternalPackages: ['pg'],
  outputFileTracingRoot: path.join(__dirname, '../../')
};

export default nextConfig;

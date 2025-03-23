/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  output: 'standalone',
  experimental: {
    // Using new property name as per warning
  },
  serverExternalPackages: ['sharp', 'onnxruntime-node'],
};

module.exports = nextConfig; 
import type { NextConfig } from "next";

// Parse hostname from URL
const getHostname = (url: string): string => {
  try {
    return new URL(url).hostname;
  } catch (e) {
    console.error("Invalid URL format in environment variable:", url);
    return "";
  }
};

// Get image server hostname from environment
const imageServerUrl = process.env.NEXT_PUBLIC_IMAGE_SERVER_URL || 'http://127.0.0.1:8080/';
const imageServerHostname = getHostname(imageServerUrl);
const imageServerPort = process.env.NEXT_PUBLIC_IMAGE_SERVER_URL 
  ? new URL(process.env.NEXT_PUBLIC_IMAGE_SERVER_URL).port 
  : '8080';

const nextConfig: NextConfig = {
  images: {
    domains: [imageServerHostname],
    remotePatterns: [
      {
        protocol: 'http',
        hostname: imageServerHostname,
        port: imageServerPort,
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
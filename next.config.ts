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


// S3 bucket for DCAPv2 images
const s3BucketUrl = process.env.NEXT_PUBLIC_S3_BUCKET_URL || 'https://dcap-viewer-assets.s3.eu-central-1.amazonaws.com';
const s3BucketDomain = getHostname(s3BucketUrl);

const nextConfig: NextConfig = {
  images: {
    domains: [s3BucketDomain],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: s3BucketDomain,
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;

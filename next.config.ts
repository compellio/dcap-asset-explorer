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
const placeholderDomain = getHostname('https://placehold.co/400x300/EAEAEA/777777?text=No+Image');

const nextConfig: NextConfig = {
  images: {
    dangerouslyAllowSVG: true,
    domains: [s3BucketDomain, placeholderDomain],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: s3BucketDomain,
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: placeholderDomain,
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;

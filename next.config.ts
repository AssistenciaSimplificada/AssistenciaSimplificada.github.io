import type { NextConfig } from 'next';

const githubPages = process.env.GITHUB_PAGES === 'true';
const githubBasePath = process.env.GITHUB_PAGES_BASE_PATH || '';

const nextConfig: NextConfig = {
  output: githubPages ? 'export' : undefined,
  basePath: githubPages && githubBasePath ? githubBasePath : undefined,
  assetPrefix: githubPages && githubBasePath ? githubBasePath : undefined,
  trailingSlash: false,
  images: { unoptimized: githubPages },
  env: { NEXT_PUBLIC_BASE_PATH: githubPages ? githubBasePath : '' },
};

export default nextConfig;

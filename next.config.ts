import type { NextConfig } from 'next';

const githubPages = process.env.GITHUB_PAGES === 'true';
const githubBasePath = '/orcamentos-simplificados-site';

const nextConfig: NextConfig = {
  output: githubPages ? 'export' : undefined,
  basePath: githubPages ? githubBasePath : undefined,
  assetPrefix: githubPages ? githubBasePath : undefined,
  trailingSlash: githubPages,
  images: { unoptimized: githubPages },
  env: { NEXT_PUBLIC_BASE_PATH: githubPages ? githubBasePath : '' },
};

export default nextConfig;

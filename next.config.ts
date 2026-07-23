import type { NextConfig } from "next";

const isGitHubPages = process.env.DEPLOY_TARGET === "github-pages";
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const nextConfig: NextConfig = {
  ...(isGitHubPages
    ? {
        output: "export" as const,
        basePath,
        images: {
          unoptimized: true,
        },
        typescript: {
          tsconfigPath: "tsconfig.pages.json",
        },
      }
    : {}),
};

export default nextConfig;

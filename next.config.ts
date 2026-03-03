import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { hostname: "*.convex.cloud" },
      { hostname: "img.clerk.com" },
    ],
  },
};

export default withNextIntl(nextConfig);

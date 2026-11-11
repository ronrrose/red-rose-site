// @ts-check
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // The Spanish, French and Portuguese paths served the English page under a
  // foreign lang attribute. They now go permanently (308) to the English URL;
  // the query string is kept, so tracking parameters survive.
  async redirects() {
    return [
      { source: "/:lang(es|fr|pt)", destination: "/", permanent: true },
      { source: "/:lang(es|fr|pt)/:path*", destination: "/:path*", permanent: true },
    ];
  },
};

export default withNextIntl(nextConfig);

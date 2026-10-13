/** @type {import('next').NextConfig} */
const nextConfig = {
  distDir: process.env.NODE_ENV === "development" ? ".next-dev" : ".next",
  poweredByHeader: false,
  skipTrailingSlashRedirect: true,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
      { protocol: "http", hostname: "**" },
    ],
  },
  async rewrites() {
    return process.env.DJANGO_API_URL
      ? [
          { source: "/site-media/:path*", destination: `${process.env.DJANGO_API_URL}/api/site-media/:path*` },
          { source: "/api/workspace/:path+", destination: `${process.env.DJANGO_API_URL}/api/workspace/:path+/` },
          ...["admin"].flatMap((prefix) => [
            { source: `/${prefix}`, destination: `${process.env.DJANGO_API_URL}/${prefix}/` },
            { source: `/${prefix}/`, destination: `${process.env.DJANGO_API_URL}/${prefix}/` },
            { source: `/${prefix}/:path+`, destination: `${process.env.DJANGO_API_URL}/${prefix}/:path+/` },
          ]),
          { source: "/static/:path*", destination: `${process.env.DJANGO_API_URL}/static/:path*` },
          {
            source: "/media/:path*",
            destination: `${process.env.DJANGO_API_URL}/media/:path*`,
          },
        ]
      : [];
  },
};
export default nextConfig;

/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  skipTrailingSlashRedirect: true,
  async rewrites() {
    return process.env.DJANGO_API_URL
      ? [
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
  async headers() {
    return [
      {
        source: "/assets/optimized/:file(.*\\.webp)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
};
export default nextConfig;

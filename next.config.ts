import type { NextConfig } from "next";

// Supabase Storage serves uploaded photos from the project's own domain — next/image
// needs it allow-listed, so pull the hostname from the same env var the app already uses.
const supabaseHostname = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
  : undefined;

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },
  experimental: {
    // Property submissions carry photos and now walkthrough clips through a
    // server action. The 1 MB default rejects a single phone video outright,
    // and the failure surfaces as an opaque action error rather than anything
    // the admin could act on.
    serverActions: { bodySizeLimit: "64mb" },
  },
  async redirects() {
    return [
      // Journeys let a buyer self-select a category, which pre-empts the match
      // quiz. The routes are gone; anything still pointing at them lands on
      // explore.
      // statusCode 301 rather than `permanent: true`, which emits 308. Both are
      // permanent; the spec and its test call for 301 specifically.
      { source: "/journeys", destination: "/explore", statusCode: 301 },
      { source: "/journeys/:path*", destination: "/explore", statusCode: 301 },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      ...(supabaseHostname
        ? [{ protocol: "https" as const, hostname: supabaseHostname }]
        : []),
    ],
  },
};

export default nextConfig;

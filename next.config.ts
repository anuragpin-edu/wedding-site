import type { NextConfig } from "next";

// Sensible security headers applied to every response. Kept conservative so
// nothing breaks (no strict CSP, which is hard to get right with Next's inline
// runtime); these cover the common, low-risk wins.
const securityHeaders = [
  { key: "X-Frame-Options", value: "SAMEORIGIN" }, // anti-clickjacking
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  },
  {
    // HTTPS-only once deployed (Vercel serves HTTPS). Harmless on localhost.
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
];

const nextConfig: NextConfig = {
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;

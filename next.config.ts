import type { NextConfig } from "next";

/**
 * Enterprise Security Headers tailored for Celebration & Event Planner:
 * - Allows Unsplash for avatars and event imagery
 * - Allows Google Gemini / GenAI API endpoints
 * - Prevents clickjacking (X-Frame-Options: DENY) & MIME sniffing
 * - Strict Transport Security (HSTS)
 */
const securityHeaders = [
  {
    key: "X-DNS-Prefetch-Control",
    value: "on",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    key: "X-Frame-Options",
    value: "DENY",
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    key: "X-XSS-Protection",
    value: "1; mode=block",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
  },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "img-src 'self' data: blob: https://images.unsplash.com https://lh3.googleusercontent.com",
      "font-src 'self' data: https://fonts.gstatic.com",
      "connect-src 'self' https://generativelanguage.googleapis.com",
      "worker-src 'self' blob:",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
    ].join("; "),
  },
];

const noCacheHeaders = [
  {
    key: "Cache-Control",
    value: "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
  },
  {
    key: "Pragma",
    value: "no-cache",
  },
  {
    key: "Expires",
    value: "0",
  },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  compress: true,

  // External server packages for better-sqlite3 and Genkit AI
  serverExternalPackages: [
    "better-sqlite3",
    "genkit",
    "@genkit-ai/core",
    "@genkit-ai/google-genai",
    "@opentelemetry/sdk-node",
  ],

  // Image optimization domains for avatars and celebration assets
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        pathname: "/**",
      },
    ],
  },

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
      {
        source: "/login",
        headers: noCacheHeaders,
      },
      {
        source: "/api/auth/(.*)",
        headers: noCacheHeaders,
      },
      {
        source: "/api/ai/(.*)",
        headers: noCacheHeaders,
      },
    ];
  },
};

export default nextConfig;

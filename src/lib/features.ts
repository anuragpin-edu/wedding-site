// Simple per-environment feature flags via env vars. Server-only (no
// NEXT_PUBLIC_), read by the nav and the public registry page.
//
// A feature is ON unless its var is explicitly set to "false". So set
// REGISTRY_ENABLED=false in the Vercel *Production* environment to hide the
// gift registry from the public, while it stays visible on localhost/preview.

export function registryEnabled(): boolean {
  return process.env.REGISTRY_ENABLED !== "false";
}

// Cloudflare Turnstile server-side verification. Gracefully optional: if
// TURNSTILE_SECRET_KEY isn't configured, verification is skipped so the site
// works without Turnstile set up yet. Once the key is added, tokens are
// required and verified.

export function turnstileEnabled(): boolean {
  return !!process.env.TURNSTILE_SECRET_KEY;
}

export async function verifyTurnstile(
  token: string | undefined | null,
  ip?: string
): Promise<boolean> {
  if (!turnstileEnabled()) return true; // not configured -> allow

  if (!token) return false;

  try {
    const form = new URLSearchParams();
    form.append("secret", process.env.TURNSTILE_SECRET_KEY!);
    form.append("response", token);
    if (ip) form.append("remoteip", ip);

    const res = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      { method: "POST", body: form }
    );
    const data = (await res.json()) as { success: boolean };
    return data.success === true;
  } catch {
    return false;
  }
}

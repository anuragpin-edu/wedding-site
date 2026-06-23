"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

const input =
  "w-full rounded-lg border border-gold/30 bg-white px-3 py-2.5 text-foreground outline-none focus:border-maroon";

export default function ForgotForm() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [err, setErr] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr("");
    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/admin/reset`,
    });
    setBusy(false);
    if (error) return setErr(error.message);
    setSent(true);
  }

  if (sent) {
    return (
      <div className="rounded-2xl border border-sage/40 bg-sage/10 p-6 text-center text-sm text-foreground/80">
        If an account exists for that email, a reset link is on its way. Check
        your inbox and follow the link to set a new password.
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-3 rounded-2xl border border-gold/25 bg-white/70 p-6">
      <input
        className={input}
        type="email"
        placeholder="Your admin email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      {err && <p className="text-sm text-maroon">{err}</p>}
      <button
        type="submit"
        disabled={busy}
        className="w-full rounded-full bg-maroon px-4 py-2.5 font-medium text-white transition-colors hover:bg-maroon-dark disabled:opacity-60"
      >
        {busy ? "Sending…" : "Send reset link"}
      </button>
      <p className="text-center text-sm">
        <a href="/admin/login" className="text-maroon/80 hover:text-maroon hover:underline">
          Back to sign in
        </a>
      </p>
    </form>
  );
}

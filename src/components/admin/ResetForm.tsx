"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const input =
  "w-full rounded-lg border border-gold/30 bg-white px-3 py-2.5 text-foreground outline-none focus:border-maroon";

export default function ResetForm() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [done, setDone] = useState(false);

  // The recovery link lands here with a `code` (PKCE). Exchange it for a
  // session so we're allowed to set a new password.
  useEffect(() => {
    const supabase = createClient();
    const code = new URLSearchParams(window.location.search).get("code");
    if (!code) {
      // Supabase may also establish the session automatically from the URL.
      supabase.auth.getSession().then(({ data }) => {
        if (data.session) setReady(true);
        else setErr("This reset link is invalid or has expired. Request a new one.");
      });
      return;
    }
    supabase.auth
      .exchangeCodeForSession(code)
      .then(({ error }) => {
        if (error) setErr("This reset link is invalid or has expired. Request a new one.");
        else setReady(true);
      });
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 8) {
      setErr("Use at least 8 characters.");
      return;
    }
    setBusy(true);
    setErr("");
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (error) return setErr(error.message);
    setDone(true);
    setTimeout(() => {
      router.replace("/admin");
      router.refresh();
    }, 1200);
  }

  if (done) {
    return (
      <div className="rounded-2xl border border-sage/40 bg-sage/10 p-6 text-center text-sm text-foreground/80">
        Password updated — taking you to the dashboard…
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-3 rounded-2xl border border-gold/25 bg-white/70 p-6">
      <input
        className={input}
        type="password"
        placeholder="New password"
        autoComplete="new-password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        disabled={!ready}
        required
      />
      {err && <p className="text-sm text-maroon">{err}</p>}
      <button
        type="submit"
        disabled={busy || !ready}
        className="w-full rounded-full bg-maroon px-4 py-2.5 font-medium text-white transition-colors hover:bg-maroon-dark disabled:opacity-60"
      >
        {busy ? "Saving…" : "Set new password"}
      </button>
      <p className="text-center text-sm">
        <a href="/admin/login" className="text-maroon/80 hover:text-maroon hover:underline">
          Back to sign in
        </a>
      </p>
    </form>
  );
}

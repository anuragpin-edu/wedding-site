"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/admin";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message);
      setBusy(false);
      return;
    }
    router.replace(next);
    router.refresh();
  }

  const input =
    "w-full rounded-lg border border-gold/30 bg-white px-3 py-2.5 text-foreground outline-none focus:border-maroon";

  return (
    <form onSubmit={submit} className="space-y-3 rounded-2xl border border-gold/25 bg-white/70 p-6">
      <input
        className={input}
        type="email"
        placeholder="Email"
        autoComplete="username"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <input
        className={input}
        type="password"
        placeholder="Password"
        autoComplete="current-password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      {error && <p className="text-sm text-maroon">{error}</p>}
      <button
        type="submit"
        disabled={busy}
        className="w-full rounded-full bg-maroon px-4 py-2.5 font-medium text-white transition-colors hover:bg-maroon-dark disabled:opacity-60"
      >
        {busy ? "Signing in…" : "Sign in"}
      </button>
      <p className="text-center text-sm">
        <a href="/admin/forgot" className="text-maroon/80 hover:text-maroon hover:underline">
          Forgot password?
        </a>
      </p>
    </form>
  );
}

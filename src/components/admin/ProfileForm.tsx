"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const input =
  "w-full rounded-lg border border-gold/30 bg-white px-3 py-2 text-sm outline-none focus:border-maroon";

export default function ProfileForm({ currentName }: { currentName: string }) {
  const router = useRouter();
  const [name, setName] = useState(currentName);
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  async function saveName(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg("");
    setErr("");
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({
      data: { full_name: name.trim() },
    });
    setBusy(false);
    if (error) return setErr(error.message);
    setMsg("Name updated.");
    router.refresh();
  }

  async function savePassword(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 8) {
      setErr("Use at least 8 characters.");
      return;
    }
    setBusy(true);
    setMsg("");
    setErr("");
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (error) return setErr(error.message);
    setPassword("");
    setMsg("Password changed.");
  }

  return (
    <div className="space-y-5">
      <form onSubmit={saveName} className="space-y-3 rounded-2xl border border-gold/25 bg-white/60 p-5">
        <label className="block text-xs uppercase tracking-wide text-foreground/55">
          Display name
        </label>
        <input className={input} value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
        <button disabled={busy} className="rounded-full bg-maroon px-5 py-2 text-sm font-medium text-white hover:bg-maroon-dark disabled:opacity-60">
          Save name
        </button>
      </form>

      <form onSubmit={savePassword} className="space-y-3 rounded-2xl border border-gold/25 bg-white/60 p-5">
        <label className="block text-xs uppercase tracking-wide text-foreground/55">
          Change password
        </label>
        <input className={input} type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="New password" autoComplete="new-password" />
        <button disabled={busy} className="rounded-full bg-maroon px-5 py-2 text-sm font-medium text-white hover:bg-maroon-dark disabled:opacity-60">
          Update password
        </button>
      </form>

      {msg && <p className="text-sm text-sage">{msg}</p>}
      {err && <p className="text-sm text-maroon">{err}</p>}
    </div>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const input =
  "w-full rounded-lg border border-gold/30 bg-white px-3 py-2.5 text-sm outline-none focus:border-maroon";
const btn =
  "rounded-full bg-maroon px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-maroon-dark disabled:opacity-60";

// One settings row: label + description on the left, control on the right.
function Row({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-4 p-6 sm:grid-cols-3">
      <div className="sm:col-span-1">
        <h2 className="text-sm font-medium text-foreground">{title}</h2>
        <p className="mt-1 text-xs text-foreground/55">{description}</p>
      </div>
      <div className="space-y-3 sm:col-span-2">{children}</div>
    </div>
  );
}

export default function ProfileForm({ currentName }: { currentName: string }) {
  const router = useRouter();
  const [name, setName] = useState(currentName);
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState<"name" | "password" | null>(null);
  const [msg, setMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  async function saveName(e: React.FormEvent) {
    e.preventDefault();
    setBusy("name");
    setMsg(null);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ data: { full_name: name.trim() } });
    setBusy(null);
    if (error) return setMsg({ kind: "err", text: error.message });
    setMsg({ kind: "ok", text: "Name updated." });
    router.refresh();
  }

  async function savePassword(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 8) {
      setMsg({ kind: "err", text: "Use at least 8 characters." });
      return;
    }
    setBusy("password");
    setMsg(null);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });
    setBusy(null);
    if (error) return setMsg({ kind: "err", text: error.message });
    setPassword("");
    setMsg({ kind: "ok", text: "Password changed." });
  }

  return (
    <div className="space-y-4">
      <div className="divide-y divide-gold/15 overflow-hidden rounded-2xl border border-gold/25 bg-white/70 shadow-sm">
        <Row title="Display name" description="Shown in the admin header.">
          <form onSubmit={saveName} className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <input
              className={input}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
            />
            <button disabled={busy === "name"} className={btn + " shrink-0"}>
              {busy === "name" ? "Saving…" : "Save"}
            </button>
          </form>
        </Row>

        <Row title="Password" description="At least 8 characters.">
          <form onSubmit={savePassword} className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <input
              className={input}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="New password"
              autoComplete="new-password"
            />
            <button disabled={busy === "password"} className={btn + " shrink-0"}>
              {busy === "password" ? "Saving…" : "Update"}
            </button>
          </form>
        </Row>
      </div>

      {msg && (
        <p className={"text-sm " + (msg.kind === "ok" ? "text-sage" : "text-maroon")}>
          {msg.text}
        </p>
      )}
    </div>
  );
}

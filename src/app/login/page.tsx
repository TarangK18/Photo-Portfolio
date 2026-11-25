"use client";

import Link from "next/link";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function Login() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [msg, setMsg] = useState("");

  async function send(e: React.FormEvent) {
    e.preventDefault();
    setState("sending");
    const next = new URLSearchParams(window.location.search).get("next") ?? "/";
    const { error } = await createClient().auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: false, // So Far accounts only
        emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
      },
    });
    if (error) { setState("error"); setMsg(error.message); } else setState("sent");
  }

  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <form onSubmit={send} className="flex w-full max-w-sm flex-col gap-4">
        <Link href="/" className="font-display text-xl font-bold">tarang kamble</Link>
        <h1 className="font-display text-3xl font-bold">Sign in with So Far</h1>
        <p className="text-sm leading-relaxed text-muted">
          Optional. Use the email of your So Far account and we&apos;ll send you a sign-in link. Likes then follow you across devices.
        </p>
        <label className="flex flex-col gap-1.5 text-sm">
          Email
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email"
            className="min-h-11 rounded-xl border border-line bg-[#1a1a1d] px-3 text-paper" />
        </label>
        <button disabled={state === "sending"} className="min-h-12 rounded-full bg-paper font-semibold text-ink disabled:opacity-60">
          {state === "sending" ? "Sending…" : "Email me a link"}
        </button>
        {state === "sent" && <p role="status" className="text-sm text-[#9fd49f]">Check your inbox for the link.</p>}
        {state === "error" && <p role="alert" className="text-sm text-heart">{msg || "Something went wrong."} No So Far account? Create one in So Far first.</p>}
      </form>
    </main>
  );
}

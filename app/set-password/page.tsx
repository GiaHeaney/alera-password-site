"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Supabase env vars are missing");
}
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function SetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const hash = window.location.hash.slice(1);
      const params = new URLSearchParams(hash);
      const accessToken = params.get("access_token");
      const refreshToken = params.get("refresh_token");

      if (!accessToken || !refreshToken) {
        if (!cancelled) {
          setError("This link is invalid or has expired. Please request a new invite.");
        }
        return;
      }

      try {
        await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });
      } catch {
        if (!cancelled) {
          setError("Session expired. Please request a new invite.");
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      setError("Please enter a password.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    setStatus("loading");
    setError(null);

    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setError(error.message);
      setStatus("error");
      return;
    }

    setStatus("success");
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#060606",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          width: "100%",
          maxWidth: 420,
          background: "#111",
          borderRadius: 24,
          padding: 28,
          boxShadow: "0 20px 60px rgba(0, 0, 0, 0.5)",
        }}
      >
        <h1 style={{ color: "#fff", marginBottom: 18 }}>Set your Alera password</h1>
        <p style={{ color: "#bbb", marginBottom: 24 }}>
          Create a secure password to access the Alera app. Once saved, download the app and sign in.
        </p>

        <label style={{ color: "#eee", fontSize: 14, marginBottom: 8, display: "block" }}>
          New password
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="********"
          style={{
            width: "100%",
            padding: 14,
            borderRadius: 14,
            border: "1px solid #333",
            background: "#0c0c0c",
            color: "#fff",
            marginBottom: 16,
          }}
        />

        <label style={{ color: "#eee", fontSize: 14, marginBottom: 8, display: "block" }}>
          Confirm new password
        </label>
        <input
          type="password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          placeholder="********"
          style={{
            width: "100%",
            padding: 14,
            borderRadius: 14,
            border: "1px solid #333",
            background: "#0c0c0c",
            color: "#fff",
            marginBottom: 16,
          }}
        />

        <button
          type="submit"
          style={{
            width: "100%",
            padding: 14,
            borderRadius: 14,
            border: "none",
            background: "#f0f0f0",
            color: "#000",
            fontWeight: 600,
            cursor: "pointer",
            opacity: status === "loading" ? 0.7 : 1,
          }}
          disabled={status === "loading"}
        >
          {status === "loading" ? "Saving…" : "Save password"}
        </button>

        {status === "success" && (
          <div style={{ marginTop: 18, color: "#7CFFB2" }}>
            Password saved! Download the Alera app from the App Store or Google Play and sign in with your new password.
          </div>
        )}

        {error && (
          <div style={{ marginTop: 18, color: "#ff6b6b" }}>
            {error}
          </div>
        )}
      </form>
    </main>
  );
}

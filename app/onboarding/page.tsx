"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useActiveAccount } from "thirdweb/react";
import { getUserEmail } from "thirdweb/wallets/in-app";
import { client } from "@/lib/thirdweb";

export default function OnboardingPage() {
  const router = useRouter();
  const account = useActiveAccount();
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadEmail() {
      if (account) {
        try {
          const fetchedEmail = await getUserEmail({ client });
          if (fetchedEmail) setEmail(fetchedEmail);
        } catch (e) {
          // Ignore, probably no email available
        }
      }
    }
    loadEmail();
  }, [account]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, displayName }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update profile");
      }

      // Hard navigation to reload context
      window.location.href = "/chat";
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4">
      <div className="glass-panel p-8 rounded-2xl border-red-700/20 shadow-[0_0_30px_rgba(204,0,0,0.1)] backdrop-blur-xl bg-black/60 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold tracking-widest text-white mb-2 font-vox">COMPLETE PROFILE</h1>
          <p className="text-gray-400 text-sm tracking-wider">
            YOUR AUTHENTICATION METHOD REQUIRES AN EMAIL ADDRESS
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-mono tracking-wider text-gray-400" htmlFor="email">
              EMAIL IDENTIFIER *
            </label>
            <input
              className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-red-600/50 focus:ring-1 focus:ring-red-600/50 transition-all font-mono"
              name="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="agent@basalthq.com"
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-mono tracking-wider text-gray-400" htmlFor="displayName">
              DISPLAY NAME (OPTIONAL)
            </label>
            <input
              className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-red-600/50 focus:ring-1 focus:ring-red-600/50 transition-all font-mono"
              type="text"
              name="displayName"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Basalt Agent"
            />
          </div>

          {error && (
            <p className="mt-2 p-3 bg-red-900/10 border border-red-700/20 rounded-lg text-red-400 text-sm text-center">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="mt-4 w-full py-3 rounded-lg bg-[#cc0000] text-white font-bold tracking-wider hover:opacity-90 hover:shadow-[0_0_20px_rgba(204,0,0,0.4)] transition-all duration-300 disabled:opacity-50"
          >
            {isLoading ? "SAVING..." : "COMPLETE ONBOARDING"}
          </button>
        </form>
      </div>
    </div>
  );
}

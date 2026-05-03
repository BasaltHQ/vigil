"use client";

import { client } from "@/lib/thirdweb";
import { ConnectEmbed, darkTheme, useProfiles, useActiveAccount } from "thirdweb/react";
import { inAppWallet, createWallet } from "thirdweb/wallets";
import { base } from "thirdweb/chains";
import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage(props: {
  searchParams: Promise<{ error?: string }>
}) {
  const searchParams = use(props.searchParams);
  const account = useActiveAccount();
  const { data: profiles } = useProfiles({ client });
  const router = useRouter();
  const [isBackendLoggedIn, setIsBackendLoggedIn] = useState(false);
  const [isGenesis, setIsGenesis] = useState(false);

  useEffect(() => {
    fetch("/api/auth/check-genesis")
      .then(res => res.json())
      .then(data => {
        if (data.isGenesis) {
          setIsGenesis(true);
        }
      })
      .catch(() => {});
  }, []);

  // Automatic onboarding after backend login succeeds
  useEffect(() => {
    if (!isBackendLoggedIn || !account) return;

    // Try to auto-onboard with profile data (social logins)
    const tryOnboard = async () => {
      let hasEmail = false;
      if (profiles && profiles.length > 0) {
        const emailProfile = profiles.find((p: any) => p.details?.email && p.details?.name) || profiles.find((p: any) => p.details?.email);
        if (emailProfile && emailProfile.details) {
          hasEmail = true;
          const details = emailProfile.details as any;
          try {
            await fetch("/api/auth/onboarding", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                email: details.email,
                displayName: details.name || details.givenName || details.email
              })
            });
          } catch {}
        }
      }

      // Check if user is already fully onboarded
      try {
        const res = await fetch("/api/profile");
        if (res.ok) {
          const data = await res.json();
          // If profile exists and is not pending, skip onboarding
          if (data && data.status !== "pending" && data.email && data.email !== "unknown") {
             router.push("/chat");
             return;
          }
        }
      } catch (e) {}
      
      if (hasEmail) {
        router.push("/chat");
      } else {
        router.push("/onboarding");
      }
    };

    // For external wallets, profiles may never load — use a short timeout
    // For social logins, profiles should be available almost immediately
    if (profiles !== undefined) {
      tryOnboard();
    } else {
      // Give profiles 1.5s to load, then redirect appropriately
      const timer = setTimeout(() => {
        tryOnboard();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [isBackendLoggedIn, account, profiles, router]);

  useEffect(() => {
    // DOM Modification to forcefully remove Thirdweb branding
    const removeBranding = () => {
      // Find the anchor tag linking to thirdweb connect
      const brandingLinks = document.querySelectorAll('a[href*="thirdweb.com/connect"]');
      brandingLinks.forEach((link) => {
        // The parent div of the anchor tag has the padding, so we hide the parent
        if (link.parentElement && link.parentElement.style.display !== 'none') {
          link.parentElement.style.display = 'none';
        }
      });
      
      // Fallback for any span that says "Powered by" next to an SVG
      const spans = document.querySelectorAll('span');
      spans.forEach((span) => {
        if (span.textContent === "Powered by" && span.nextElementSibling?.tagName.toLowerCase() === "svg") {
          const container = span.closest('div[style*="padding-top"]');
          if (container && (container as HTMLElement).style.display !== 'none') {
            (container as HTMLElement).style.display = 'none';
          }
        }
      });
    };

    const observer = new MutationObserver(() => {
      removeBranding();
    });

    observer.observe(document.body, { childList: true, subtree: true });
    
    setTimeout(removeBranding, 50);
    setTimeout(removeBranding, 500);

    return () => observer.disconnect();
  }, []);

  const wallets = [
    inAppWallet({
      auth: {
        options: [
          "google",
          "discord",
          "telegram",
          "farcaster",
          "email",
          "x",
          "passkey",
          "phone",
          "twitch",
          "steam",
          "github",
          "line",
          "epic",
          "tiktok",
          "facebook",
          "coinbase",
          "apple",
        ],
      },
      executionMode: {
        mode: "EIP4337",
        smartAccount: {
          chain: base,
          sponsorGas: true,
        },
      },
    }),
    createWallet("io.metamask"),
    createWallet("com.coinbase.wallet"),
    createWallet("me.rainbow"),
    createWallet("io.rabby"),
    createWallet("io.zerion.wallet"),
  ];

  return (
    <div className="glass-panel p-8 rounded-2xl border-red-700/20 shadow-[0_0_30px_rgba(204,0,0,0.1)] backdrop-blur-xl bg-black/60 w-full max-w-md">
      <div className="text-center mb-8">
        <img src="/Vigil.png" alt="Vigil Shield" className="w-16 h-16 mx-auto mb-4 drop-shadow-[0_0_20px_rgba(204,0,0,0.4)]" />
        <h1 className="text-3xl tracking-widest text-white mb-2 font-vox">
          <span className="font-light">BASALT</span><span className="font-bold">VIGIL</span>
        </h1>
        <p className="text-gray-400 text-sm tracking-wider">
          INITIALIZE CONSTELLATION CONNECTION
        </p>
      </div>

      <div className="flex flex-col items-center justify-center py-4">
        <ConnectEmbed
          client={client}
          wallets={wallets}
          chain={base}
          auth={{
            isLoggedIn: async (address) => {
              const res = await fetch("/api/auth/is-logged-in");
              return await res.json();
            },
            doLogin: async (params) => {
              await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(params),
              });
              // Clear any stale conversation state from a previous user session
              localStorage.removeItem('currentConversationId');
              setIsBackendLoggedIn(true);
            },
            getLoginPayload: async ({ address }) => {
              const res = await fetch(`/api/auth/payload?address=${address}&chainId=${base.id}`);
              return await res.json();
            },
            doLogout: async () => {
              await fetch("/api/auth/logout", { method: "POST" });
              window.location.href = "/login";
            },
          }}
          appMetadata={{
            name: "Basalt Vigil",
            url: "https://basalthq.com",
            logoUrl: "http://localhost:3000/_next/image?url=%2FVigil.png&w=2048&q=75",
          }}
          privacyPolicyUrl="https://basalthq.com/privacy"
          termsOfServiceUrl="https://basalthq.com/terms"
          showThirdwebBranding={false}
          modalSize="compact"
          theme={darkTheme({
            colors: {
              accentText: "hsl(354, 76%, 41%)",
              accentButtonBg: "hsl(354, 76%, 41%)",
              primaryButtonBg: "hsl(354, 76%, 41%)",
              primaryButtonText: "hsl(0, 0%, 100%)",
            },
          })}
        />
      </div>

      {searchParams?.error && (
        <p className="mt-4 p-3 bg-red-900/10 border border-red-700/20 rounded-lg text-red-400 text-sm text-center">
          {searchParams.error}
        </p>
      )}

      {isGenesis && (
        <div className="mt-6 p-3 border border-red-700/20 rounded-lg bg-red-950/10">
          <p className="text-[10px] text-red-500/80 font-mono tracking-wider text-center uppercase">
            ⚠ First account registered will be granted full administrator privileges. This action is irreversible.
          </p>
        </div>
      )}
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { TerminalSquare, FileText, Users, Wrench, Shield, Settings } from "lucide-react";
import { useActiveAccount, useActiveWallet, useDisconnect } from "thirdweb/react";
import { client } from "@/lib/thirdweb";
import { inAppWallet } from "thirdweb/wallets";

export default function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  const [currentTime, setCurrentTime] = useState<string>("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [displayName, setDisplayName] = useState<string>("");
  
  const account = useActiveAccount();
  const wallet = useActiveWallet();
  const { disconnect } = useDisconnect();

  useEffect(() => {
    setCurrentTime(new Date().toLocaleTimeString());
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);

    // Check if user is admin and get profile
    const fetchProfile = async () => {
      try {
        const res = await fetch("/api/profile");
        if (res.ok) {
          const data = await res.json();
          // If the profile endpoint returns unauthorized or an error, data.role will be undefined.
          if (data.error) {
             setIsAdmin(false);
             setDisplayName("");
          } else {
             setIsAdmin(data.role === "admin");
             setDisplayName(data.displayName || account?.address?.slice(0, 8) + "..." || "User");
          }
        } else {
          setIsAdmin(false);
          setDisplayName("");
        }
      } catch {
        setIsAdmin(false);
        setDisplayName("");
      }
    };
    fetchProfile();

    return () => clearInterval(timer);
  }, [account]);

  const handleSignOut = async () => {
    try {
      if (wallet) {
        disconnect(wallet);
      }
    } catch (e) {
      console.error("Failed to disconnect wallet:", e);
    }
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/login";
  };

  const navItems = [
    { name: "CONSOLE", href: "/chat", icon: TerminalSquare },
    { name: "DOCUMENTS", href: "/documents", icon: FileText },
    { name: "AGENTS", href: "/agents", icon: Users },
    { name: "TOOLS", href: "/tools", icon: Wrench },
    { name: "SETTINGS", href: "/settings", icon: Settings },
  ];

  return (
    <nav className="glass-panel border-b border-glass-border z-50">
      <div className="px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-3">
              <img src="/Vigil.png" alt="Vigil Shield" className="w-8 h-8 object-contain drop-shadow-[0_0_8px_rgba(204,0,0,0.4)]" />
              <h1 className="text-lg tracking-wider font-vox">
                <span className="text-gray-200">
                  <span className="font-light">BASALT</span><span className="font-bold">VIGIL</span>
                </span>
              </h1>
            </div>

            <div className="flex items-center gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`px-4 py-2 rounded-lg transition-all duration-200 flex items-center gap-2 ${pathname === item.href
                    ? "glass-panel bg-white/10 text-white border-white/20 shadow-[0_0_15px_rgba(255,255,255,0.1)]"
                    : "hover:bg-white/10 text-gray-300 hover:text-white border border-transparent"
                    }`}
                >
                  <span className={`transition-opacity ${pathname === item.href ? "opacity-100" : "opacity-70"}`}>
                    <item.icon size={18} />
                  </span>
                  <span className={`microtext text-xs tracking-wider font-bold ${pathname === item.href ? "text-white" : "text-gray-400 group-hover:text-white"}`}>{item.name}</span>
                </Link>
              ))}

              {isAdmin && (
                <Link
                  href="/admin"
                  className={`px-4 py-2 rounded-lg transition-all duration-200 flex items-center gap-2 ${pathname === "/admin"
                    ? "glass-panel bg-red-900/20 text-red-400 border-red-700/30 shadow-[0_0_15px_rgba(204,0,0,0.15)]"
                    : "hover:bg-red-900/10 text-red-500/70 hover:text-red-400 border border-transparent"
                    }`}
                >
                  <Shield size={18} />
                  <span className="microtext text-xs tracking-wider font-bold">ADMIN</span>
                </Link>
              )}
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="status-dot status-online" />
              <span className="microtext-label">SYSTEM ONLINE</span>
            </div>

            <div className="glass-divider h-6" />

            <div className="microtext-label">
              {currentTime || <span className="invisible">00:00:00</span>}
            </div>

            <div className="glass-divider h-6" />

            <div className="flex flex-col items-end">
              <span className="text-xs font-bold tracking-wider text-gray-200">
                {displayName}
              </span>
              <button
                onClick={handleSignOut}
                className="text-[10px] text-red-500 hover:text-red-400 uppercase tracking-wider font-bold transition-colors"
              >
                SIGN OUT
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
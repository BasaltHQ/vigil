"use client";

import Image from "next/image";
import Link from "next/link";
import { Shield, ArrowRight, Github, Twitter, Linkedin } from "lucide-react";

const useBrandTheme = () => ({ currentTheme: { color: "#b71928", label: "Varuna", name: "Varuna", description: "Vigil AI", id: "varuna", tailwindColor: "red-500" } });

export function Footer() {
  const { currentTheme } = useBrandTheme();

  return (
    <footer className="bg-[#020202] border-t border-white/5 pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Brand Column */}
          <div className="lg:col-span-1">
            <Link href="/" className="inline-flex items-center gap-3 mb-6">
              <div className="relative w-8 h-8">
                <Image
                  src="/Vigil.png"
                  alt="Vigil Logo"
                  fill
                  className="object-contain"
                />
              </div>
              <span className="text-xl tracking-widest text-gray-200 font-vox">
                <span className="font-light">BASALT</span><span className="font-bold">VIGIL</span>
              </span>
            </Link>
            <p className="text-muted-foreground/70 text-sm mb-6 max-w-xs leading-relaxed">
              Exquisite Agentic Intelligence for high-end corporate law. Unrelenting discovery, collaborative drafting, and absolute security.
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-muted-foreground hover:text-white transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-white transition-colors">
                <Linkedin className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-white transition-colors">
                <Github className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Explore */}
          <div>
            <h3 className="font-semibold text-white mb-6 tracking-wider text-sm">EXPLORE</h3>
            <ul className="space-y-4">
              <li>
                <Link href="/chat" className="text-muted-foreground/80 hover:text-white transition-colors text-sm">
                  Agentic Swarm Platform
                </Link>
              </li>
              <li>
                <Link href="/documents" className="text-muted-foreground/80 hover:text-white transition-colors text-sm">
                  Document Automation
                </Link>
              </li>
              <li>
                <Link href="/agents" className="text-muted-foreground/80 hover:text-white transition-colors text-sm">
                  Corporate Governance
                </Link>
              </li>
              <li>
                <Link href="/admin" className="text-muted-foreground/80 hover:text-white transition-colors text-sm">
                  Partner Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="font-semibold text-white mb-6 tracking-wider text-sm">RESOURCES</h3>
            <ul className="space-y-4">
              <li>
                <a href="#" className="text-muted-foreground/80 hover:text-white transition-colors text-sm">
                  Documentation
                </a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground/80 hover:text-white transition-colors text-sm">
                  Security Whitepaper
                </a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground/80 hover:text-white transition-colors text-sm">
                  API Reference
                </a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground/80 hover:text-white transition-colors text-sm">
                  System Status
                </a>
              </li>
            </ul>
          </div>

          {/* Action Column */}
          <div>
            <h3 className="font-semibold text-white mb-6 tracking-wider text-sm">INITIALIZE</h3>
            <p className="text-muted-foreground/80 text-sm mb-6">
              Ready to deploy your legal constellation?
            </p>
            <Link
              href="/chat"
              className="group inline-flex items-center justify-between w-full p-4 rounded-xl border transition-all duration-300"
              style={{
                borderColor: `${currentTheme.color}30`,
                backgroundColor: `${currentTheme.color}05`
              }}
            >
              <div className="flex items-center gap-3">
                <Shield className="h-5 w-5" style={{ color: currentTheme.color }} />
                <span className="font-semibold text-white">Start Case</span>
              </div>
              <ArrowRight 
                className="h-4 w-4 transform group-hover:translate-x-1 transition-transform" 
                style={{ color: currentTheme.color }}
              />
            </Link>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-muted-foreground/60 text-xs">
            © {new Date().getFullYear()} Vigil Platform by BasaltHQ. All rights reserved.
          </p>
          <div className="flex gap-6 text-xs font-mono">
            <a href="#" className="text-muted-foreground/60 hover:text-white transition-colors">
              PRIVACY_POLICY
            </a>
            <a href="#" className="text-muted-foreground/60 hover:text-white transition-colors">
              TERMS_OF_SERVICE
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

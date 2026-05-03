"use client";

import Image from "next/image";
import Link from "next/link";
import { Shield, ArrowRight, Github, Twitter, Linkedin } from "lucide-react";

const themeColor = "#b71928";

export function Footer() {
  return (
    <footer className="bg-[#020202] border-t border-white/5 pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-10 mb-16">

          {/* Brand Column */}
          <div className="col-span-2 md:col-span-3 lg:col-span-2">
            <Link href="/" className="inline-flex items-center gap-3 mb-6">
              <div className="relative w-8 h-8">
                <Image src="/Vigil.png" alt="Vigil Logo" fill className="object-contain" />
              </div>
              <span className="text-xl tracking-widest text-gray-200 font-vox">
                <span className="font-light">BASALT</span><span className="font-bold">VIGIL</span>
              </span>
            </Link>
            <p className="text-gray-500 text-sm mb-6 max-w-xs leading-relaxed">
              Exquisite Agentic Intelligence for high-end corporate law. Unrelenting discovery, collaborative drafting, and absolute security.
            </p>
            <div className="flex gap-4">
              <a href="https://x.com/BasaltHQ" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-white transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="https://linkedin.com/company/basalthq" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-white transition-colors">
                <Linkedin className="h-5 w-5" />
              </a>
              <a href="https://github.com/BasaltHQ" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-white transition-colors">
                <Github className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Platform */}
          <div>
            <h3 className="font-semibold text-white mb-6 tracking-wider text-xs font-mono">PLATFORM</h3>
            <ul className="space-y-3">
              <li><Link href="/chat" className="text-gray-500 hover:text-white transition-colors text-sm">Console</Link></li>
              <li><Link href="/pricing" className="text-gray-500 hover:text-white transition-colors text-sm">Pricing</Link></li>
              <li><Link href="/industries" className="text-gray-500 hover:text-white transition-colors text-sm">Industries</Link></li>
              <li><Link href="/comparisons" className="text-gray-500 hover:text-white transition-colors text-sm">Comparisons</Link></li>
              <li><Link href="/locations" className="text-gray-500 hover:text-white transition-colors text-sm">Locations</Link></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="font-semibold text-white mb-6 tracking-wider text-xs font-mono">RESOURCES</h3>
            <ul className="space-y-3">
              <li><Link href="/blog" className="text-gray-500 hover:text-white transition-colors text-sm">Blog</Link></li>
              <li><Link href="/codex" className="text-gray-500 hover:text-white transition-colors text-sm">Codex</Link></li>
              <li><Link href="/about" className="text-gray-500 hover:text-white transition-colors text-sm">About</Link></li>
              <li><Link href="/contact" className="text-gray-500 hover:text-white transition-colors text-sm">Contact</Link></li>
            </ul>
          </div>

          {/* Initialize */}
          <div>
            <h3 className="font-semibold text-white mb-6 tracking-wider text-xs font-mono">INITIALIZE</h3>
            <p className="text-gray-600 text-sm mb-4">
              Deploy your agentic constellation.
            </p>
            <Link
              href="/chat"
              className="group inline-flex items-center gap-2 px-4 py-3 rounded-xl border transition-all duration-300 w-full justify-between"
              style={{ borderColor: `${themeColor}30`, backgroundColor: `${themeColor}05` }}
            >
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4" style={{ color: themeColor }} />
                <span className="font-semibold text-white text-sm">Start Case</span>
              </div>
              <ArrowRight className="h-4 w-4 transform group-hover:translate-x-1 transition-transform" style={{ color: themeColor }} />
            </Link>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-600 text-xs">
            © {new Date().getFullYear()} Vigil Platform by BasaltHQ. All rights reserved.
          </p>
          <div className="flex gap-6 text-xs font-mono">
            <Link href="/blog" className="text-gray-600 hover:text-white transition-colors">BLOG</Link>
            <Link href="/codex" className="text-gray-600 hover:text-white transition-colors">CODEX</Link>
            <Link href="/industries" className="text-gray-600 hover:text-white transition-colors">INDUSTRIES</Link>
            <Link href="/locations" className="text-gray-600 hover:text-white transition-colors">LOCATIONS</Link>
            <Link href="/sitemap.xml" className="text-gray-600 hover:text-white transition-colors">SITEMAP</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

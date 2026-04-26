"use client";

import {
  ArrowRight,
  Shield,
  Star,
  Terminal,
  ChevronRight,
  Code
} from "lucide-react";
const useBrandTheme = () => ({ currentTheme: { color: "#b71928", label: "Varuna", name: "Varuna", description: "Vigil AI", id: "varuna", tailwindColor: "red-500" } });

export function CTASection() {
  const { currentTheme } = useBrandTheme();

  return (
    <section id="contact" className="relative py-32 bg-[#050505] overflow-hidden">
      {/* Background Tech Elements */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.03]" />
      <div
        className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-transparent to-transparent opacity-10"
        style={{ backgroundImage: `linear-gradient(to left, ${currentTheme.color}20, transparent)` }}
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div
          className="relative rounded-3xl overflow-hidden bg-black/40 border backdrop-blur-sm transition-colors duration-500"
          style={{ borderColor: `${currentTheme.color}30` }}
        >
          <div
            className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-current to-transparent opacity-50"
            style={{ color: currentTheme.color }}
          />

          <div className="p-8 md:p-20 text-center">
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8 font-mono text-sm border animate-pulse transition-colors duration-500"
              style={{
                backgroundColor: `${currentTheme.color}10`,
                borderColor: `${currentTheme.color}30`,
                color: currentTheme.color
              }}
            >
              <Terminal className="h-4 w-4" />
              <span>SYSTEM_READY_FOR_DEPLOYMENT</span>
            </div>

            <h2 className="text-4xl md:text-6xl font-bold tracking-tight text-white mb-6">
              Deploy Your <span className="transition-colors duration-500" style={{ color: currentTheme.color }}>Legal Constellation</span>
            </h2>

            <p className="text-xl text-muted-foreground/80 max-w-2xl mx-auto mb-12">
              Stop relying on analog drafting and isolated discovery. Deploy the Vigil Constellation and elevate your firm to agentic supremacy.
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <a
                href="/chat"
                target="_blank"
                rel="noopener noreferrer"
                className="group relative inline-flex items-center justify-center px-8 py-4 text-white font-bold text-lg rounded-xl overflow-hidden hover:scale-105 transition-all duration-300"
                style={{
                  backgroundColor: currentTheme.color,
                  boxShadow: `0 0 20px ${currentTheme.color}40`
                }}
              >
                <span className="relative flex items-center gap-3">
                  Start Case
                  <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </a>

              <a
                href="/chat"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center px-8 py-4 bg-black/20 border font-semibold text-lg rounded-xl hover:bg-white/5 transition-colors"
                style={{
                  borderColor: `${currentTheme.color}30`,
                  color: currentTheme.color
                }}
              >
                Talk to a Partner
              </a>
            </div>

            <div
              className="mt-12 pt-12 border-t flex flex-wrap justify-center gap-4 text-xs font-mono font-bold transition-colors duration-500"
              style={{ borderColor: `${currentTheme.color}20` }}
            >
              <div
                className="flex items-center gap-2 px-3 py-1.5 rounded-md border"
                style={{ backgroundColor: `${currentTheme.color}10`, borderColor: `${currentTheme.color}30`, color: currentTheme.color }}
              >
                <Shield className="h-4 w-4" />
                <span>ENCRYPTED_CORE</span>
              </div>
              <div
                className="flex items-center gap-2 px-3 py-1.5 rounded-md border"
                style={{ backgroundColor: `${currentTheme.color}10`, borderColor: `${currentTheme.color}30`, color: currentTheme.color }}
              >
                <Code className="h-4 w-4" />
                <span>API_ACCESS_GRANTED</span>
              </div>
              <div
                className="flex items-center gap-2 px-3 py-1.5 rounded-md border"
                style={{ backgroundColor: `${currentTheme.color}10`, borderColor: `${currentTheme.color}30`, color: currentTheme.color }}
              >
                <Star className="h-4 w-4" />
                <span>ENTERPRISE_SLA</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

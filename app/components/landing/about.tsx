"use client";

import { Check, Layers, Sliders, Sparkles, TrendingUp, Target, Shield, Zap, Users, Brain } from "lucide-react";
const useBrandTheme = () => ({ currentTheme: { color: "#b71928", label: "Varuna", name: "Varuna", description: "Vigil AI", id: "varuna", tailwindColor: "red-500" } });

export function AboutSection() {
  const { currentTheme } = useBrandTheme();

  return (
    <section id="vision" className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24 bg-[#050505]">
      <div
        className="glass-pane rounded-3xl ring-1 p-8 md:p-12 backdrop-blur-md"
        style={{
          backgroundColor: `${currentTheme.color}0D`, // 5% opacity
          borderColor: `${currentTheme.color}33`, // 20% opacity
          boxShadow: `0 0 40px ${currentTheme.color}1A` // 10% opacity
        }}
      >
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white mb-2">The Unfair Advantage</h2>
        <div
          className="text-[11px] uppercase tracking-wider opacity-80 font-mono mb-8 flex items-center gap-2"
          style={{ color: currentTheme.color }}
        >
          <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: currentTheme.color }} />
          MISSION_STATUS: ACTIVE
        </div>

        <div className="prose prose-invert max-w-none space-y-6 text-lg leading-relaxed text-slate-300">
          <p>
            <span className="text-white font-semibold">Precedent is power.</span> For too long, Magic Circle and AmLaw 100 firms have monopolized the world's most advanced legal ontologies—digital twins that allow them to model, predict, and control litigation with god-like efficiency.
          </p>
          <p>
            <span className="text-white font-semibold">We built the weapon for your firm.</span> Vigil is not just software. It is a bespoke, AI-driven Legal Constellation designed specifically for elite corporate counsel. We have taken the same comprehensive architecture used by top-tier legal strategists and compressed it into an accessible, autonomous operating system.
          </p>
          <p>
            By digitizing your legal strategy into <span className="font-mono text-sm" style={{ color: currentTheme.color }}>Precedents</span>, <span className="font-mono text-sm" style={{ color: currentTheme.color }}>Actions</span>, and <span className="font-mono text-sm text-slate-200">Decisions</span>, we give you absolute analytical supremacy. Whether you are managing complex M&A diligence or orchestrating high-stakes litigation, the Vigil Constellation levels the battlefield.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div
            className="group rounded-xl p-6 border transition-all hover:-translate-y-1"
            style={{
              backgroundColor: `${currentTheme.color}0D`,
              borderColor: `${currentTheme.color}33`
            }}
          >
            <div className="mb-4 inline-flex p-2 rounded-lg" style={{ backgroundColor: `${currentTheme.color}1A`, color: currentTheme.color }}>
              <Target className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">Impenetrable</h3>
            <p className="text-sm text-slate-400">Built to withstand aggressive litigation through superior intelligence.</p>
          </div>

          <div
            className="group rounded-xl p-6 border transition-all hover:-translate-y-1"
            style={{
              backgroundColor: `${currentTheme.color}0D`,
              borderColor: `${currentTheme.color}33`
            }}
          >
            <div className="mb-4 inline-flex p-2 rounded-lg" style={{ backgroundColor: `${currentTheme.color}1A`, color: currentTheme.color }}>
              <Brain className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">Agentic Supremacy</h3>
            <p className="text-sm text-slate-400">Autonomous legal agents that out-draft and out-execute opposing counsel.</p>
          </div>

          <div
            className="group rounded-xl p-6 border transition-all hover:-translate-y-1"
            style={{
              backgroundColor: `${currentTheme.color}0D`,
              borderColor: `${currentTheme.color}33`
            }}
          >
            <div className="mb-4 inline-flex p-2 rounded-lg" style={{ backgroundColor: `${currentTheme.color}1A`, color: currentTheme.color }}>
              <Shield className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">Air-Gapped</h3>
            <p className="text-sm text-slate-400">Absolute ownership of your case files, client communications, and strategy.</p>
          </div>

          <div
            className="group rounded-xl p-6 border transition-all hover:-translate-y-1"
            style={{
              backgroundColor: `${currentTheme.color}0D`,
              borderColor: `${currentTheme.color}33`
            }}
          >
            <div className="mb-4 inline-flex p-2 rounded-lg" style={{ backgroundColor: `${currentTheme.color}1A`, color: currentTheme.color }}>
              <Users className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">The Vanguard</h3>
            <p className="text-sm text-slate-400">Join the elite network of modern firms building the future of corporate law.</p>
          </div>
        </div>
      </div>
    </section>
  );
}

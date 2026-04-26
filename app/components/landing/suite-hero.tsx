"use client";

import * as React from "react";
import Image from "next/image";
import { ArrowRight, Target, FileText, Scale, Search, Shield } from "lucide-react";
const useBrandTheme = () => ({ currentTheme: { color: "#b71928", label: "Varuna", name: "Varuna", description: "Vigil AI", id: "varuna", tailwindColor: "red-600" } });

// --- Escher-style Isometric Cube Tessellation ---
const ISO_ANGLE = Math.PI / 6;
const COS30 = Math.cos(ISO_ANGLE);
const SIN30 = Math.sin(ISO_ANGLE);

export function SuiteHero() {
  const { currentTheme } = useBrandTheme();
  const themeRef = React.useRef(currentTheme);
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const [isReducedMotion, setIsReducedMotion] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);

  const getRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16)
    } : { r: 183, g: 25, b: 40 };
  };

  React.useEffect(() => { themeRef.current = currentTheme; }, [currentTheme]);
  React.useEffect(() => { setMounted(true); }, []);

  const products = [
    { name: "Document Automation", icon: FileText, url: "/documents", tagline: "Collaborative Sectional Drafting", description: "LaTeX-grade PDF generation with meticulous agentic precision.", locked: false },
    { name: "Corporate Governance", icon: Scale, url: "/agents", tagline: "Unanimous Consensus Protocols", description: "Manage equity, resolutions, and board structures autonomously." },
    { name: "M&A Diligence", icon: Search, url: "/chat", tagline: "Hyper-fast Legal Discovery", description: "Intelligent extraction of liabilities, precedents, and entities.", locked: true },
    { name: "Secure Communication", icon: Shield, url: "/chat", tagline: "Air-Gapped Client Portals", description: "Confidential attorney-client communication with Zero-Knowledge proofs." }
  ];

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handleChange = () => setIsReducedMotion(mq.matches);
    handleChange();
    mq.addEventListener?.("change", handleChange);
    return () => mq.removeEventListener?.("change", handleChange);
  }, []);

  React.useEffect(() => {
    if (!mounted) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = canvas.clientWidth;
    let height = canvas.clientHeight;
    const resize = () => {
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    let time = 0;
    const cubeSize = 40;
    const colW = cubeSize * COS30 * 2;
    const rowH = cubeSize * (1 + SIN30);

    // Draw simple isometric cube
    const drawCube = (
      cx: number, cy: number, s: number, alpha: number,
      rgb: { r: number; g: number; b: number }
    ) => {
      const dx = s * COS30;
      const dy = s * SIN30;

      // Left face
      ctx.beginPath();
      ctx.moveTo(cx - dx, cy - dy);
      ctx.lineTo(cx, cy);
      ctx.lineTo(cx, cy + s);
      ctx.lineTo(cx - dx, cy + s - dy);
      ctx.closePath();
      ctx.fillStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha * 0.08})`;
      ctx.fill();
      ctx.strokeStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha * 0.8})`;
      ctx.lineWidth = 0.8;
      ctx.stroke();

      // Right face
      ctx.beginPath();
      ctx.moveTo(cx + dx, cy - dy);
      ctx.lineTo(cx, cy);
      ctx.lineTo(cx, cy + s);
      ctx.lineTo(cx + dx, cy + s - dy);
      ctx.closePath();
      ctx.fillStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha * 0.04})`;
      ctx.fill();
      ctx.strokeStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha * 0.6})`;
      ctx.stroke();

      // Top face
      ctx.beginPath();
      ctx.moveTo(cx, cy - s);
      ctx.lineTo(cx + dx, cy - dy);
      ctx.lineTo(cx, cy);
      ctx.lineTo(cx - dx, cy - dy);
      ctx.closePath();
      ctx.fillStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha * 0.15})`;
      ctx.fill();
      ctx.strokeStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
      ctx.lineWidth = 0.8;
      ctx.stroke();
    };



    const step = () => {
      if (!isReducedMotion) time += 0.008;
      const rgb = getRgb(themeRef.current.color);
      ctx.clearRect(0, 0, width, height);

      const maxDist = Math.sqrt(width * width + height * height) * 0.5;
      const wavePos = (time % 1) * maxDist * 1.8;
      const waveWidth = maxDist * 0.35;

      const cols = Math.ceil(width / colW) + 2;
      const rows = Math.ceil(height / rowH) + 2;
      const gridPositions: { cx: number; cy: number }[] = [];

      for (let row = -1; row < rows; row++) {
        for (let col = -1; col < cols; col++) {
          const stagger = row % 2 === 0 ? 0 : colW / 2;
          const cx = col * colW + stagger;
          const cy = row * rowH;
          gridPositions.push({ cx, cy });

          const ddx = cx - width / 2;
          const ddy = cy - height / 2;
          const dist = Math.sqrt(ddx * ddx + ddy * ddy);

          let alpha = 0.12;
          const distFromWave = Math.abs(dist - wavePos);
          if (distFromWave < waveWidth) {
            alpha += (1 - distFromWave / waveWidth) * 0.35;
          }

          drawCube(cx, cy, cubeSize, alpha, rgb);
        }
      }



      raf = requestAnimationFrame(step);
    };

    let raf = requestAnimationFrame(step);
    const ro = new ResizeObserver(() => resize());
    ro.observe(canvas);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, [mounted, isReducedMotion]);

  return (
    <section className="relative isolate overflow-hidden min-h-[100svh] pt-20 md:pt-24 bg-[#050505]">
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full block" />
        {/* Subtle Grid Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:40px_40px] opacity-[0.1] pointer-events-none" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Main headline */}
        <div className="text-center mb-8">
          {/* Rotating Shield */}
          <div className="relative w-40 h-40 md:w-56 md:h-56 mx-auto mb-6 transition-transform duration-500 hover:scale-105">
            <Image
              src="/Vigil.png"
              alt="Vigil Shield"
              fill
              className="object-contain"
              priority
            />
            <div
              className="shield-gleam-container"
              style={{
                maskImage: `url('/Vigil.png')`,
                WebkitMaskImage: `url('/Vigil.png')`
              }}
            />
          </div>

          <div className="inline-flex items-center rounded-full bg-primary/10 border border-primary/20 px-4 py-2 shadow-sm mb-6 animate-pulse">
            <Target className="h-4 w-4 mr-2 text-primary" />
            <span className="text-sm font-bold text-primary">Exquisite Agentic Intelligence</span>
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl tracking-tight leading-tight mb-6">
            <span className="text-white font-normal">The Future is</span>
            <br />
            <span className="relative inline-block font-black bg-gradient-to-r from-white via-primary to-white bg-clip-text text-transparent pb-2 transition-all duration-500">
              Agentic Law
            </span>
          </h1>

          <p className="text-lg md:text-xl lg:text-2xl text-muted-foreground/80 max-w-4xl mx-auto mb-8 leading-relaxed">
            Bespoke. Brilliant. Unrelenting. Initialize your elite <span className="text-primary font-bold transition-colors duration-500">Legal Constellation</span> with an exquisite swarm of sophisticated agents tailored for high-end corporate law.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a
              href="/chat"
              className="group inline-flex items-center justify-center rounded-lg bg-primary px-8 py-4 text-base md:text-lg font-bold text-black shadow-[0_0_20px_rgba(0,0,0,0.2)] hover:opacity-90 hover:shadow-[0_0_30px_rgba(255,255,255,0.2)] transition-all duration-300 hover:scale-105"
              style={{ boxShadow: `0 0 20px ${currentTheme.color}40`, backgroundColor: currentTheme.color }}
            >
              Start Case
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </a>
            <a
              href="#vision"
              className="inline-flex items-center justify-center rounded-lg border border-primary/30 bg-primary/5 px-8 py-4 text-base md:text-lg font-semibold text-primary hover:bg-primary/10 transition-all duration-300"
            >
              Our Mission
            </a>
          </div>
        </div>

        {/* Product Grid */}
        <div id="products" className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 md:gap-8 mt-16 md:mt-32">
          {products.map((product, index) => (
            <a
              key={product.name}
              href={product.url}
              target={product.locked ? undefined : "_blank"}
              rel="noopener noreferrer"
              className={`group relative rounded-2xl border bg-black/40 backdrop-blur-sm p-6 md:p-8 transition-all duration-300 overflow-hidden
                ${product.locked
                  ? "border-white/10 opacity-70 cursor-not-allowed grayscale-[0.8] hover:grayscale-0 hover:opacity-100 hover:border-primary/30"
                  : "border-white/10 hover:border-primary/50 hover:-translate-y-1"
                }
              `}
              onClick={(e) => product.locked && e.preventDefault()}
            >
              {/* Theme accent line on hover (only for unlocked) */}
              {!product.locked && (
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              )}

              <div className="relative h-16 md:h-20 mb-6 flex items-center">
                <div className={`p-4 rounded-xl border bg-black/50 transition-colors duration-300 ${product.locked ? 'opacity-80 border-white/10' : 'border-primary/30 group-hover:bg-primary/10'}`}>
                  <product.icon className={`w-10 h-10 ${product.locked ? 'text-muted-foreground' : 'text-primary'}`} />
                </div>
              </div>
              <div className="flex items-center gap-2 mb-3">
                <h3 className={`text-xl md:text-2xl font-bold transition-colors duration-300
                  ${product.locked ? "text-muted-foreground group-hover:text-primary" : "text-white group-hover:text-primary"}`
                }>
                  {product.tagline}
                </h3>
                {!product.locked && (
                  <ArrowRight className="h-5 w-5 text-primary opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                )}
              </div>
              <p className="text-muted-foreground/80 text-sm md:text-base leading-relaxed">
                {product.description}
              </p>

              <div className={`mt-6 inline-flex items-center text-sm font-bold tracking-wider transition-colors duration-300
                ${product.locked ? "text-muted-foreground" : "text-primary"}`
              }>
                {product.locked ? (
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                    SYSTEM_LOCKED
                  </span>
                ) : (
                  <>
                    ACCESS_MODULE
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </>
                )}
              </div>
            </a>
          ))}
        </div>

      </div>
    </section>
  );
}

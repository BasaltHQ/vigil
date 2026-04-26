"use client";

import { useState, useEffect } from "react";
import { ArrowRight, Brain, Network, Zap, Pause, Play, ChevronRight, ChevronLeft } from "lucide-react";
const useBrandTheme = () => ({ currentTheme: { color: "#b71928", label: "Varuna", name: "Varuna", description: "Vigil AI", id: "varuna", tailwindColor: "red-500" } });

const slides = [
    {
        id: 1,
        icon: Brain,
        title: "The Syntax of Power",
        headline: "Exacting Legal Architecture",
        text: "In standard practice, a 'Contract' is just paper. In a Vigil Constellation, clauses are living entities. Naming something accurately—defining its parameters, liabilities, and escape hatches—is the first step to absolute control.",
        visual: "static-vs-dynamic"
    },
    {
        id: 2,
        icon: Network,
        title: "The Living Firm",
        headline: "Your Counsel in Real-Time",
        text: "Precedents shift and regulations mutate. Your firm must adapt at the speed of the market. Our agentic architecture allows new legal strategies to form instantly, shifting from defense to offense seamlessly.",
        visual: "bio-network"
    },
    {
        id: 3,
        icon: Zap,
        title: "Absolute Precision",
        headline: "Ambiguity is Liability",
        text: "When evidence is siloed, cases are lost. By unifying your legal strategy into a single Constellation, intelligence travels instantly from discovery to trial execution. This is the ultimate cognitive advantage.",
        visual: "speed-trigger"
    }
];

export function NeuromimeticSlideshow() {
    const { currentTheme } = useBrandTheme();
    const [current, setCurrent] = useState(0);
    const [isPlaying, setIsPlaying] = useState(true);
    const [progress, setProgress] = useState(0);

    // Auto-advance logic
    useEffect(() => {
        let interval: NodeJS.Timeout;
        let progressInterval: NodeJS.Timeout;

        if (isPlaying) {
            progressInterval = setInterval(() => {
                setProgress(prev => {
                    if (prev >= 100) return 0;
                    return prev + 1;
                });
            }, 50); // Updates every 50ms for smooth bar

            interval = setInterval(() => {
                setCurrent(prev => (prev + 1) % slides.length);
                setProgress(0);
            }, 5000); // 5 seconds per slide
        }

        return () => {
            clearInterval(interval);
            clearInterval(progressInterval);
        };
    }, [isPlaying, current]);

    // Reset progress when manually changing slide
    const changeSlide = (index: number) => {
        setCurrent(index);
        setProgress(0);
    };

    const LinkIcon = slides[current].icon;

    return (
        <section className="py-24 bg-[#050505] relative overflow-hidden border-b border-white/5">

            {/* Background Ambience */}
            <div
                className="absolute inset-0 pointer-events-none transition-colors duration-1000"
                style={{ background: `radial-gradient(circle at 50% 50%, ${currentTheme.color}10, transparent 70%)` }}
            />

            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">

                {/* Header */}
                <div className="text-center mb-16">
                    <h2
                        className="text-sm font-bold tracking-[0.2em] mb-4 uppercase transition-colors duration-500"
                        style={{ color: currentTheme.color }}
                    >
                        Corporate Philosophy
                    </h2>
                    <h3 className="text-3xl md:text-5xl font-extrabold text-white">
                        Why the <span className="transition-colors duration-500" style={{ color: currentTheme.color }}>Legal Constellation</span> Matters
                    </h3>
                </div>

                {/* Main Slide Container */}
                <div
                    className="relative bg-black/40 border border-white/10 backdrop-blur-md rounded-3xl overflow-hidden min-h-0 md:min-h-[400px] flex flex-col md:flex-row group transition-all duration-500"
                    style={{ borderColor: `${currentTheme.color}30` }}
                    onMouseEnter={() => setIsPlaying(false)}
                    onMouseLeave={() => setIsPlaying(true)}
                >

                    {/* Progress Bar (Global Top) */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-white/10">
                        <div
                            className="h-full transition-all duration-75 ease-linear"
                            style={{ width: `${progress}%`, backgroundColor: currentTheme.color }}
                        />
                    </div>

                    {/* Left: Text Content */}
                    <div className="flex-1 p-6 md:p-12 flex flex-col justify-center relative z-20 min-h-[320px] md:min-h-0">
                        {slides.map((slide, idx) => (
                            <div
                                key={slide.id}
                                className={`transition-all duration-500 md:absolute md:inset-0 md:p-12 flex flex-col justify-center ${idx === current ? 'opacity-100 relative' : 'opacity-0 absolute inset-0 pointer-events-none'}`}
                            >
                                <div className="flex items-center gap-3 md:gap-4 mb-4 md:mb-6 flex-wrap">
                                    <div
                                        className="p-2 md:p-3 rounded-lg bg-black/50 border transition-colors duration-500"
                                        style={{ borderColor: `${currentTheme.color}40` }}
                                    >
                                        <slide.icon className="w-12 h-12 transition-colors duration-500" style={{ color: currentTheme.color }} />
                                    </div>
                                    <span className="text-muted-foreground/60 font-mono text-xs md:text-sm tracking-widest uppercase">
                                        Protocol 0{slide.id} // {slide.title}
                                    </span>
                                </div>

                                <h4 className="text-2xl md:text-4xl font-bold text-white mb-4 md:mb-6 leading-tight">
                                    {slide.headline}
                                </h4>

                                <p className="text-base md:text-lg text-muted-foreground/80 leading-relaxed mb-6 md:mb-8">
                                    {slide.text}
                                </p>

                                <div className="flex items-center gap-4">
                                    <a
                                        href="/manifesto"
                                        className="font-bold text-sm tracking-wide flex items-center gap-2 hover:translate-x-1 transition-all duration-300"
                                        style={{ color: currentTheme.color }}
                                    >
                                        READ MANIFESTO <ArrowRight className="w-4 h-4" />
                                    </a>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Right: Abstract Visualization Panel */}
                    <div className="flex-1 bg-black/20 border-t md:border-t-0 md:border-l border-white/10 relative overflow-hidden flex items-center justify-center min-h-[250px] md:min-h-[300px]">
                        {/* Grid Overlay */}
                        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:20px_20px] opacity-20" />

                        {/* Dynamic Visuals based on Slide */}
                        {current === 0 && (
                            <div
                                className="relative w-64 h-64 border rounded-lg flex items-center justify-center animate-pulse-glow transition-colors duration-500"
                                style={{ borderColor: `${currentTheme.color}50`, boxShadow: `0 0 30px ${currentTheme.color}10` }}
                            >
                                <div className="absolute top-0 -left-12 bg-black/80 text-white/70 font-mono text-xs p-2 border border-white/10 rounded">
                                    "Liability_Clause": null
                                </div>
                                <div
                                    className="absolute bottom-12 -right-8 bg-black/80 font-mono text-xs p-2 border rounded"
                                    style={{ borderColor: `${currentTheme.color}50`, color: currentTheme.color }}
                                >
                                    ERROR: Ambiguity
                                </div>
                                <div className="text-white font-bold tracking-widest opacity-50">STATIC_PDF</div>
                            </div>
                        )}

                        {current === 1 && (
                            <div className="relative w-full h-full flex items-center justify-center">
                                <div className="relative w-48 h-48">
                                    <div
                                        className="absolute inset-0 border-2 rounded-full animate-ping opacity-20"
                                        style={{ borderColor: currentTheme.color }}
                                    />
                                    <div
                                        className="absolute inset-4 border rounded-full animate-spin duration-[10s]"
                                        style={{ borderColor: `${currentTheme.color}50` }}
                                    />
                                    <Network
                                        className="absolute inset-0 m-auto w-16 h-16 text-white animate-pulse"
                                        style={{ color: currentTheme.color }}
                                    />
                                </div>
                            </div>
                        )}

                        {current === 2 && (
                            <div className="relative w-full p-12">
                                <div className="flex justify-between items-center mb-4">
                                    <div className="w-3 h-3 bg-white rounded-full shadow-[0_0_10px_white]" />
                                    <div className="h-0.5 flex-1 bg-white/20 mx-4 relative overflow-hidden">
                                        <div
                                            className="absolute inset-y-0 left-0 w-12 blur-md animate-slide-right"
                                            style={{ backgroundColor: currentTheme.color }}
                                        />
                                    </div>
                                    <div
                                        className="w-3 h-3 rounded-full"
                                        style={{ backgroundColor: currentTheme.color, boxShadow: `0 0 10px ${currentTheme.color}` }}
                                    />
                                </div>
                                <div className="font-mono text-xs text-center text-muted-foreground/50 mt-2">
                                    EXECUTION: 0.00ms // PRECEDENT_FOUND
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Controls */}
                    <div className="relative md:absolute bottom-0 md:bottom-6 right-0 md:right-6 z-30 flex items-center justify-center md:justify-end gap-3 py-4 md:py-0">
                        <button
                            onClick={() => changeSlide((current - 1 + slides.length) % slides.length)}
                            className="p-2 rounded-full bg-black/40 text-white hover:bg-white/10 transition-colors border border-white/10"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>

                        <button
                            onClick={() => setIsPlaying(!isPlaying)}
                            className="p-2 rounded-full bg-black/40 text-white hover:bg-white/10 transition-colors border border-white/10"
                        >
                            {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                        </button>

                        <button
                            onClick={() => changeSlide((current + 1) % slides.length)}
                            className="p-2 rounded-full bg-black/40 text-white hover:bg-white/10 transition-colors border border-white/10"
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>

                </div>

                {/* Slide Indicators */}
                <div className="flex justify-center mt-8 gap-3">
                    {slides.map((_, idx) => (
                        <button
                            key={idx}
                            onClick={() => changeSlide(idx)}
                            className={`h-1 rounded-full transition-all duration-300 ${idx === current ? 'w-12' : 'w-4 bg-white/10 hover:bg-white/20'}`}
                            style={{ backgroundColor: idx === current ? currentTheme.color : undefined }}
                        />
                    ))}
                </div>

            </div>
        </section>
    );
}

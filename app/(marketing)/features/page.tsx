import { ProductShowcase } from "@/app/components/landing/product-showcase";
import { SwarmConstellation } from "@/app/components/landing/swarm-constellation";
import { Footer } from "@/app/components/landing/footer";
import { Metadata } from "next";
import Image from "next/image";
import { Scale, Network, Zap, ShieldAlert, BookOpen, Fingerprint } from "lucide-react";

export const metadata: Metadata = {
    title: "Features & Capabilities | BasaltVigil Agentic Law Infrastructure",
    description: "Explore the core features of the BasaltVigil legal intelligence platform, from autonomous redlining to multi-agent deliberation.",
};

export default function FeaturesPage() {
    return (
        <div className="min-h-screen bg-black text-white font-sans selection:bg-[#b71928] selection:text-white">
            {/* Ambient Lighting */}
            <div className="fixed top-0 left-0 w-full h-full pointer-events-none overflow-hidden z-0">
                <div className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] bg-[#b71928] rounded-full blur-[250px] opacity-[0.05]" />
                <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] bg-white rounded-full blur-[200px] opacity-[0.02]" />
            </div>

            <div className="relative z-10 pt-32 pb-24 max-w-7xl mx-auto px-6">
                <div className="text-center mb-24 animate-fadeInUp">
                    <span className="text-xs font-mono tracking-[0.3em] text-[#b71928] mb-4 block uppercase">The Arsenal</span>
                    <h1 className="text-5xl md:text-8xl font-bold mt-4 mb-8 leading-tight tracking-tight font-vox">
                        AGENTIC CAPABILITIES
                    </h1>
                    <p className="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto font-light leading-relaxed">
                        Vigil is not just software. It is a constellation of specialized, highly-quantized legal agents designed to execute complex firm-level strategies.
                    </p>
                </div>
            </div>

            {/* Core Capability: Swarm Pipeline */}
            <section className="relative z-10 py-24 border-y border-white/5 bg-[#050505]/50">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <div className="order-2 lg:order-1 relative h-[500px] rounded-2xl overflow-hidden border border-white/10 glass-panel shadow-[0_0_50px_rgba(183,25,40,0.1)] group">
                            <div className="absolute inset-0 bg-[#b71928]/5 z-10 pointer-events-none transition-opacity duration-500 group-hover:opacity-0" />
                            <Image
                                src="/vigil_swarm_pipeline.png"
                                alt="Vigil Swarm Pipeline Architecture"
                                fill
                                className="object-cover transition-transform duration-1000 group-hover:scale-105"
                            />
                        </div>
                        <div className="order-1 lg:order-2">
                            <Network className="w-10 h-10 text-[#b71928] mb-6" />
                            <h2 className="text-4xl font-bold font-vox mb-6 tracking-wide">Multi-Agent Deliberation</h2>
                            <p className="text-lg text-gray-400 mb-8 leading-relaxed font-light">
                                Unlike traditional LLMs that provide a single, hallucination-prone response, Vigil operates on a Swarm Architecture. When you submit a case, it is routed to a specialized Lead Orchestrator (e.g., Corporate, Criminal, IP). 
                                <br/><br/>
                                This orchestrator then dynamically spawns sub-agents to argue opposing sides, verify case law citations against your dedicated Vector Database, and build consensus before presenting you with an impenetrable strategy.
                            </p>
                            <div className="flex flex-col gap-4">
                                <div className="flex items-center gap-4 p-4 rounded-xl border border-white/5 bg-white/[0.02]">
                                    <div className="w-2 h-2 rounded-full bg-[#b71928] animate-pulse" />
                                    <span className="font-mono text-sm tracking-widest text-gray-300">FORCED HANDOFF INTERCEPTION</span>
                                </div>
                                <div className="flex items-center gap-4 p-4 rounded-xl border border-white/5 bg-white/[0.02]">
                                    <div className="w-2 h-2 rounded-full bg-white" />
                                    <span className="font-mono text-sm tracking-widest text-gray-300">DYNAMIC PHENOMENOLOGY INFERENCE</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Core Capability: Autonomous Redlining */}
            <section className="relative z-10 py-32">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <div>
                            <Scale className="w-10 h-10 text-[#b71928] mb-6" />
                            <h2 className="text-4xl font-bold font-vox mb-6 tracking-wide">Autonomous Redlining & Risk Analysis</h2>
                            <p className="text-lg text-gray-400 mb-8 leading-relaxed font-light">
                                Stop wasting hundreds of billable hours scanning 200-page M&A data room contracts. Vigil ingests immense document bundles via our custom OCR and Semantic Parsing engine.
                                <br/><br/>
                                It instantly cross-references clauses against your firm's custom playbook, generating glowing crimson strikethroughs, drafting alternate defensive language, and appending precise margin notes identifying hidden indemnification traps.
                            </p>
                            <div className="grid grid-cols-2 gap-4 mt-8">
                                <div className="p-5 rounded-xl border border-white/5 bg-[#050505]">
                                    <ShieldAlert className="w-5 h-5 text-gray-400 mb-3" />
                                    <div className="text-2xl font-bold text-white mb-1 font-mono">&lt; 400ms</div>
                                    <div className="text-xs font-mono text-gray-500">INDEMNIFICATION TRAP DETECTION</div>
                                </div>
                                <div className="p-5 rounded-xl border border-[#b71928]/30 bg-[#b71928]/5 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-16 h-16 bg-[#b71928] blur-[20px] opacity-20" />
                                    <Fingerprint className="w-5 h-5 text-[#b71928] mb-3" />
                                    <div className="text-2xl font-bold text-white mb-1 font-mono">100%</div>
                                    <div className="text-xs font-mono text-[#b71928]">PLAYBOOK ALIGNMENT ENFORCEMENT</div>
                                </div>
                            </div>
                        </div>
                        <div className="relative h-[500px] rounded-2xl overflow-hidden border border-white/10 glass-panel shadow-[0_0_50px_rgba(183,25,40,0.1)] group">
                            <div className="absolute inset-0 bg-[#b71928]/5 z-10 pointer-events-none transition-opacity duration-500 group-hover:opacity-0" />
                            <Image
                                src="/vigil_auto_redlining.png"
                                alt="Vigil Autonomous Redlining Interface"
                                fill
                                className="object-cover transition-transform duration-1000 group-hover:scale-105"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Existing Components */}
            <div className="relative z-10 border-t border-white/5">
                <SwarmConstellation />
            </div>
            
            <div className="relative z-10 bg-[#020202]">
                <ProductShowcase />
            </div>

            <Footer />
        </div>
    )
}

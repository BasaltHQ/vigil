'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Check } from 'lucide-react';

function Feature({ text }: { text: string }) {
    return (
        <div className="flex items-start gap-3">
            <Check className="w-4 h-4 text-[#b71928] shrink-0 mt-0.5" />
            <span className="text-sm text-gray-300">{text}</span>
        </div>
    );
}

function TokenMeter({ used, limit }: { used: number; limit: number }) {
    const pct = Math.min((used / limit) * 100, 100);
    const formatted = (n: number) => {
        if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(0)}M`;
        if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
        return n.toString();
    };
    return (
        <div className="mt-6 pt-4 border-t border-white/5">
            <div className="flex justify-between text-[10px] font-mono text-gray-500 mb-2 tracking-wider">
                <span>TOKEN USAGE</span>
                <span>{formatted(used)} / {formatted(limit)}</span>
            </div>
            <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-[#b71928] to-red-400 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
            </div>
        </div>
    );
}

export function PricingClient() {
    const [isAnnual, setIsAnnual] = useState(true);

    return (
        <div className="mb-16">
            <div className="flex justify-center mb-16">
                <div className="bg-[#050505] p-1.5 rounded-full border border-white/10 inline-flex relative shadow-inner">
                    <div 
                        className="absolute top-1.5 bottom-1.5 bg-white rounded-full transition-all duration-500 ease-out"
                        style={{ 
                            transform: `translateX(${isAnnual ? '120px' : '0px'})`,
                            width: isAnnual ? '170px' : '120px' 
                        }}
                    />
                    <button
                        onClick={() => setIsAnnual(false)}
                        className={`relative z-10 w-[120px] py-2.5 rounded-full text-sm font-bold tracking-wider transition-colors duration-300 ${!isAnnual ? 'text-black' : 'text-gray-400 hover:text-white'}`}
                    >
                        MONTHLY
                    </button>
                    <button
                        onClick={() => setIsAnnual(true)}
                        className={`relative z-10 w-[170px] py-2.5 rounded-full text-sm font-bold tracking-wider transition-colors duration-300 flex items-center justify-center gap-2 ${isAnnual ? 'text-black' : 'text-gray-400 hover:text-white'}`}
                    >
                        ANNUAL
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold transition-colors duration-300 ${isAnnual ? 'bg-black text-[#b71928]' : 'bg-[#b71928]/20 text-[#b71928]'}`}>
                            SAVE 20%
                        </span>
                    </button>
                </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto items-stretch">
                {/* Starter Tier */}
                <div className="glass-panel p-8 rounded-2xl border border-white/5 bg-[#050505] hover:border-white/20 transition-all flex flex-col">
                    <div className="mb-8 mt-2">
                        <h2 className="text-2xl font-bold font-vox mb-2">Starter</h2>
                        <p className="text-gray-400 text-sm h-10">For individual lawyers exploring agentic workflows.</p>
                        <div className="h-[90px] mt-6 flex flex-col justify-start">
                            <div className="flex items-baseline gap-1">
                                <span className="text-5xl font-bold">Free</span>
                            </div>
                            <div className="text-xs mt-2 invisible">Placeholder</div>
                        </div>
                    </div>
                    <Link href="/login" className="w-full block text-center py-3 rounded-lg border border-white/20 hover:bg-white hover:text-black transition-colors mb-8 font-bold text-sm tracking-wider">
                        GET STARTED
                    </Link>
                    <div className="space-y-4 flex-grow">
                        <div className="text-xs font-mono tracking-widest text-gray-500 mb-4 uppercase min-h-[32px] flex items-center">Includes</div>
                        <Feature text="100,000 tokens / month" />
                        <Feature text="10 Document Ingestions / mo" />
                        <Feature text="Basic Legal RAG" />
                        <Feature text="Single-Agent Inference" />
                        <Feature text="Standard Playbooks" />
                    </div>
                    <div className="mt-auto">
                        <TokenMeter used={0} limit={100000} />
                    </div>
                </div>

                {/* Pro Tier */}
                <div className="glass-panel p-8 rounded-2xl border border-[#b71928]/50 bg-gradient-to-b from-[#b71928]/10 to-[#050505] relative flex flex-col hover:-translate-y-2 transition-all duration-300">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 px-4 py-1 bg-[#b71928] text-white text-[10px] font-bold font-mono tracking-widest rounded-full">
                        MOST POPULAR
                    </div>
                    <div className="mb-8 mt-2">
                        <h2 className="text-2xl font-bold font-vox mb-2 text-white">Pro</h2>
                        <p className="text-gray-400 text-sm h-10">For boutique firms requiring autonomous redlining.</p>
                        <div className="h-[90px] mt-6 flex flex-col justify-start">
                            <div className="flex items-baseline gap-1">
                                <span className="text-xl text-gray-500">$</span>
                                <span className="text-5xl font-bold text-white">{isAnnual ? "24" : "29"}</span>
                                <span className="text-xl text-gray-500">{isAnnual ? "" : ".99"}</span>
                                <span className="text-gray-500 ml-1">/mo</span>
                            </div>
                            <div className={`text-xs text-gray-500 mt-2 transition-opacity ${isAnnual ? 'opacity-100' : 'opacity-0'}`}>
                                Billed $288 annually
                            </div>
                        </div>
                    </div>
                    <Link href="/login" className="w-full block text-center py-3 rounded-lg bg-[#b71928] text-white hover:bg-red-600 transition-colors mb-8 font-bold text-sm tracking-wider shadow-[0_0_20px_rgba(183,25,40,0.3)]">
                        UPGRADE TO PRO
                    </Link>
                    <div className="space-y-4 flex-grow">
                        <div className="text-xs font-mono tracking-widest text-[#b71928] mb-4 uppercase min-h-[32px] flex items-center">Everything in Starter, plus</div>
                        <Feature text="2,000,000 tokens / month" />
                        <Feature text="Unlimited Ingestions" />
                        <Feature text="Autonomous Redlining" />
                        <Feature text="Custom Firm Playbooks" />
                        <Feature text="M&A Swarm Execution" />
                    </div>
                    <div className="mt-auto">
                        <TokenMeter used={0} limit={2000000} />
                    </div>
                </div>

                {/* Firm Tier */}
                <div className="glass-panel p-8 rounded-2xl border border-white/5 bg-[#050505] hover:border-white/20 transition-all flex flex-col">
                    <div className="mb-8 mt-2">
                        <h2 className="text-2xl font-bold font-vox mb-2">Firm</h2>
                        <p className="text-gray-400 text-sm h-10">For mid-size firms with multi-jurisdictional needs.</p>
                        <div className="h-[90px] mt-6 flex flex-col justify-start">
                            <div className="flex items-baseline gap-1">
                                <span className="text-xl text-gray-500">$</span>
                                <span className="text-5xl font-bold">{isAnnual ? "119" : "149"}</span>
                                <span className="text-gray-500 ml-1">/mo</span>
                            </div>
                            <div className={`text-xs text-gray-500 mt-2 transition-opacity ${isAnnual ? 'opacity-100' : 'opacity-0'}`}>
                                Billed $1,428 annually
                            </div>
                        </div>
                    </div>
                    <Link href="/login" className="w-full block text-center py-3 rounded-lg border border-white/20 hover:bg-white hover:text-black transition-colors mb-8 font-bold text-sm tracking-wider">
                        UPGRADE TO FIRM
                    </Link>
                    <div className="space-y-4 flex-grow">
                        <div className="text-xs font-mono tracking-widest text-gray-500 mb-4 uppercase min-h-[32px] flex items-center">Everything in Pro, plus</div>
                        <Feature text="10,000,000 tokens / month" />
                        <Feature text="Entity Management Agent" />
                        <Feature text="API Access & Webhooks" />
                        <Feature text="Multi-Jurisdictional Mapping" />
                        <Feature text="Dedicated Vector Index" />
                        <Feature text="Team Workspace (10 Seats)" />
                    </div>
                    <div className="mt-auto">
                        <TokenMeter used={0} limit={10000000} />
                    </div>
                </div>

                {/* Enterprise Tier */}
                <div className="glass-panel p-8 rounded-2xl border border-white/5 bg-[#050505] hover:border-white/20 transition-all flex flex-col">
                    <div className="mb-8 mt-2">
                        <h2 className="text-2xl font-bold font-vox mb-2">Enterprise</h2>
                        <p className="text-gray-400 text-sm h-10">For global corporations requiring zero-trust privacy.</p>
                        <div className="h-[90px] mt-6 flex flex-col justify-start">
                            <div className="flex items-baseline gap-1">
                                <span className="text-xl text-gray-500">$</span>
                                <span className="text-5xl font-bold">{isAnnual ? "239" : "299"}</span>
                                <span className="text-gray-500 ml-1">/mo</span>
                            </div>
                            <div className={`text-xs text-gray-500 mt-2 transition-opacity ${isAnnual ? 'opacity-100' : 'opacity-0'}`}>
                                Billed $2,868 annually
                            </div>
                        </div>
                    </div>
                    <Link href="/login" className="w-full block text-center py-3 rounded-lg border border-white/20 hover:bg-white hover:text-black transition-colors mb-8 font-bold text-sm tracking-wider">
                        CONTACT SALES
                    </Link>
                    <div className="space-y-4 flex-grow">
                        <div className="text-xs font-mono tracking-widest text-gray-500 mb-4 uppercase min-h-[32px] flex items-center">Everything in Firm, plus</div>
                        <Feature text="50,000,000 tokens / month" />
                        <Feature text="Air-Gapped Deployment" />
                        <Feature text="Zero-Knowledge Privilege" />
                        <Feature text="Context Masking Pipeline" />
                        <Feature text="SOC2 / HIPAA Compliance" />
                        <Feature text="Unlimited Seats" />
                    </div>
                    <div className="mt-auto">
                        <TokenMeter used={0} limit={50000000} />
                    </div>
                </div>
            </div>
        </div>
    );
}

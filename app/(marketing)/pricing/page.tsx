import Link from 'next/link';
import { Metadata } from 'next';
import { Check, Shield, Zap, Globe, Layers, Plus } from 'lucide-react';
import { Footer } from '@/app/components/landing/footer';
import { PricingClient } from './pricing-client';

export const metadata: Metadata = {
    title: 'Pricing | BasaltVigil Agentic Law Infrastructure',
    description: 'Select the optimal agentic infrastructure tier for your firm or corporate legal department.',
};

export default function PricingPage() {
    return (
        <div className="min-h-screen bg-black text-white selection:bg-[#b71928] selection:text-white font-sans relative overflow-hidden">
            {/* Ambient Background */}
            <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-[#b71928] rounded-full blur-[200px] opacity-[0.03] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-white rounded-full blur-[150px] opacity-[0.02] pointer-events-none" />

            <main className="pt-40 pb-24 max-w-7xl mx-auto px-6 relative z-10">
                <div className="text-center mb-20">
                    <span className="text-xs font-mono tracking-[0.3em] text-[#b71928] mb-4 block uppercase">Subscription Tiers</span>
                    <h1 className="text-5xl md:text-8xl font-bold mt-4 mb-8 leading-tight tracking-tight font-vox">
                        AGENTIC PRICING
                    </h1>
                    <p className="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto font-light leading-relaxed">
                        Scale your firm's intelligence. From solo practitioners to multinational corporate legal departments.
                    </p>
                </div>

                <PricingClient />

                {/* Token Topup */}
                <div className="max-w-3xl mx-auto mb-32">
                    <div className="rounded-2xl border border-[#b71928]/20 bg-gradient-to-r from-[#b71928]/[0.06] to-transparent p-8 flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-5">
                            <div className="w-14 h-14 rounded-xl bg-[#b71928]/10 border border-[#b71928]/30 flex items-center justify-center">
                                <Plus className="w-7 h-7 text-[#b71928]" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold font-vox mb-1">Token Topup</h3>
                                <p className="text-sm text-gray-400">Need more tokens? Add <span className="text-white font-bold">1,000,000 tokens</span> instantly to any tier.</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="text-right">
                                <div className="text-3xl font-bold">$9<span className="text-lg text-gray-400">.99</span></div>
                                <div className="text-[10px] font-mono text-gray-500 tracking-widest">PER TOPUP</div>
                            </div>
                            <Link href="/login" className="px-6 py-3 bg-[#b71928] text-white font-bold rounded-lg hover:bg-red-600 transition-colors text-sm tracking-wider whitespace-nowrap">
                                BUY TOKENS
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Token Limits Table */}
                <div className="max-w-5xl mx-auto mb-32">
                    <h2 className="text-3xl font-bold font-vox text-center mb-12">Strict Token Allocation</h2>
                    <div className="rounded-2xl border border-white/[0.08] overflow-hidden bg-[#050505]">
                        <div className="grid grid-cols-5 bg-white/[0.03] border-b border-white/[0.06] p-5 font-mono text-[10px] tracking-widest text-gray-500">
                            <div>METRIC</div>
                            <div className="text-center">STARTER</div>
                            <div className="text-center text-[#b71928]">PRO</div>
                            <div className="text-center">FIRM</div>
                            <div className="text-center">ENTERPRISE</div>
                        </div>
                        <TokenRow label="Monthly Token Limit" values={["100K", "2M", "10M", "50M"]} />
                        <TokenRow label="Max Context Window" values={["32K", "64K", "128K", "256K"]} />
                        <TokenRow label="Concurrent Agents" values={["1", "5", "25", "Unlimited"]} />
                        <TokenRow label="Document Ingestions" values={["10/mo", "Unlimited", "Unlimited", "Unlimited"]} />
                        <TokenRow label="Vector Storage" values={["50MB", "2GB", "20GB", "Unlimited"]} />
                        <TokenRow label="API Rate Limit" values={["—", "60/min", "300/min", "Unlimited"]} />
                        <TokenRow label="Token Topup Eligible" values={["✓", "✓", "✓", "✓"]} />
                    </div>
                </div>

                {/* Infrastructure Details */}
                <div className="border-t border-white/10 pt-24 max-w-5xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-bold font-vox mb-6">Built for the Fortune 500</h2>
                        <p className="text-gray-400 text-lg">Every tier of Vigil runs on the same enterprise-grade infrastructure deployed at BasaltHQ.</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="p-8 rounded-2xl bg-white/[0.02] border border-white/5">
                            <Shield className="w-8 h-8 text-[#b71928] mb-6" />
                            <h3 className="text-xl font-bold mb-3">Impenetrable Privacy</h3>
                            <p className="text-gray-400 leading-relaxed text-sm">
                                Your data is never used to train our base models. Vectors are encrypted client-side and remain in your dedicated tenant space.
                            </p>
                        </div>
                        <div className="p-8 rounded-2xl bg-white/[0.02] border border-white/5">
                            <Zap className="w-8 h-8 text-[#b71928] mb-6" />
                            <h3 className="text-xl font-bold mb-3">Sub-Second Inference</h3>
                            <p className="text-gray-400 leading-relaxed text-sm">
                                We utilize highly quantized LLMs for semantic routing, ensuring that 90% of requests are resolved in under 400 milliseconds.
                            </p>
                        </div>
                        <div className="p-8 rounded-2xl bg-white/[0.02] border border-white/5">
                            <Globe className="w-8 h-8 text-[#b71928] mb-6" />
                            <h3 className="text-xl font-bold mb-3">Global Edge Network</h3>
                            <p className="text-gray-400 leading-relaxed text-sm">
                                Swarms are deployed across 60+ global edge nodes, ensuring strict adherence to data sovereignty laws like GDPR and PIPL.
                            </p>
                        </div>
                        <div className="p-8 rounded-2xl bg-white/[0.02] border border-white/5">
                            <Layers className="w-8 h-8 text-[#b71928] mb-6" />
                            <h3 className="text-xl font-bold mb-3">Immutable Audit Trails</h3>
                            <p className="text-gray-400 leading-relaxed text-sm">
                                Every action taken by a Vigil agent is cryptographically logged with its exact reasoning chain, ready for immediate compliance auditing.
                            </p>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}



function TokenRow({ label, values }: { label: string; values: string[] }) {
    return (
        <div className="grid grid-cols-5 border-b border-white/[0.04] p-5 items-center hover:bg-white/[0.02] transition-colors">
            <div className="text-sm text-gray-300 font-medium">{label}</div>
            {values.map((v, i) => (
                <div key={i} className={`text-center text-sm font-mono ${i === 1 ? 'text-[#b71928] font-bold' : 'text-gray-400'}`}>{v}</div>
            ))}
        </div>
    );
}

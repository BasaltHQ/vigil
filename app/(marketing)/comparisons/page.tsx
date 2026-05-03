import Link from 'next/link';
import { getAllComparisons } from '@/lib/data/comparisons';
import { Metadata } from 'next';
import { ArrowRight } from 'lucide-react';
import { Footer } from '@/app/components/landing/footer';

export const metadata: Metadata = {
    title: 'Comparisons | BasaltVigil vs The Competition',
    description: 'See how BasaltVigil stacks up against legacy legal tech and simple conversational AI.',
};

export default function ComparisonsIndex() {
    const comparisons = getAllComparisons();

    return (
        <div className="min-h-screen bg-black text-white selection:bg-[#b71928] selection:text-white font-sans relative overflow-hidden">
            {/* Grid Background */}
            <div className="absolute inset-0 z-0 opacity-10"
                style={{
                    backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
                    backgroundSize: '100px 100px',
                    maskImage: 'linear-gradient(to bottom, black 40%, transparent 100%)'
                }}
            />

            <main className="pt-32 pb-24 max-w-7xl mx-auto px-6 relative z-10">
                <div className="text-center mb-24">
                    <span className="text-xs font-mono tracking-[0.3em] text-[#b71928] mb-4 block">COMPETITIVE ANALYSIS</span>
                    <h1 className="text-5xl md:text-8xl font-bold mt-4 mb-8 leading-tight tracking-tight font-vox">
                        VIGIL VS.
                    </h1>
                    <p className="text-xl md:text-2xl text-gray-400 max-w-2xl mx-auto font-light leading-relaxed">
                        We don't build chat interfaces. We build executing swarms. See how Vigil compares to the rest of the market.
                    </p>
                </div>

                <div className="grid lg:grid-cols-2 gap-8">
                    {comparisons.map((comparison) => (
                        <Link
                            key={comparison.slug}
                            href={`/comparisons/${comparison.slug}`}
                            className="group block rounded-2xl border border-white/10 bg-[#050505] overflow-hidden hover:border-[#b71928]/50 transition-all duration-500 relative"
                        >
                            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-30 transition-opacity duration-500">
                                <span className="font-vox text-6xl font-bold text-[#b71928]">VS</span>
                            </div>

                            <div className="p-8 h-full flex flex-col relative z-10">
                                <h2 className="text-3xl font-bold mb-4 font-vox">
                                    Vigil vs. <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-500">{comparison.competitorName}</span>
                                </h2>
                                <p className="text-gray-400 mb-8 leading-relaxed max-w-md">
                                    {comparison.description}
                                </p>
                                
                                <div className="mt-auto flex items-center gap-2 text-[#b71928] font-mono text-sm tracking-wider font-bold">
                                    VIEW FULL ANALYSIS
                                    <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </main>
            <Footer />
        </div>
    );
}

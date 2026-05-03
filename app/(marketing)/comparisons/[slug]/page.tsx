import { getComparisonBySlug, getAllComparisons } from '@/lib/data/comparisons';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, Check, X } from 'lucide-react';
import { Footer } from '@/app/components/landing/footer';

export async function generateStaticParams() {
    return getAllComparisons().map((comp) => ({
        slug: comp.slug,
    }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params;
    const comp = getComparisonBySlug(slug);
    if (!comp) return { title: 'Comparison Not Found' };
    return {
        title: \`BasaltVigil vs \${comp.competitorName} | Agentic Law Comparison\`,
        description: comp.description,
    };
}

export default async function ComparisonPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const comp = getComparisonBySlug(slug);

    if (!comp) {
        notFound();
    }

    return (
        <>
        <article className="min-h-screen bg-black text-white selection:bg-[#b71928] selection:text-white font-sans relative overflow-hidden">
            
            <div className="pt-40 pb-20 max-w-7xl mx-auto px-6 relative z-10 text-center">
                <Link href="/comparisons" className="inline-flex items-center gap-2 text-gray-400 hover:text-[#b71928] transition-colors mb-12 text-sm font-mono tracking-wider">
                    <ArrowLeft className="w-4 h-4" />
                    BACK TO COMPARISONS
                </Link>

                <h1 className="text-5xl md:text-7xl font-bold mb-8 leading-tight tracking-tight font-vox">
                    Vigil vs. <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-300 to-gray-600">{comp.competitorName}</span>
                </h1>

                <p className="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto font-light leading-relaxed mb-16">
                    {comp.description}
                </p>
                
                <div className="max-w-4xl mx-auto text-left bg-white/[0.02] border border-white/10 rounded-2xl p-8 md:p-12 mb-24">
                    <h3 className="text-[#b71928] font-mono tracking-widest text-sm mb-4 uppercase">The Vigil Advantage</h3>
                    <p className="text-xl leading-relaxed text-gray-200">
                        {comp.vigilAdvantage}
                    </p>
                </div>

                <div className="max-w-5xl mx-auto">
                    <h2 className="text-3xl font-vox font-bold mb-12">Feature Breakdown</h2>
                    
                    <div className="bg-[#050505] rounded-2xl border border-white/10 overflow-hidden">
                        <div className="grid grid-cols-12 bg-white/5 border-b border-white/10 p-6 font-mono text-xs tracking-widest text-gray-400">
                            <div className="col-span-6">CAPABILITY</div>
                            <div className="col-span-3 text-center text-[#b71928] font-bold">BASALTVIGIL</div>
                            <div className="col-span-3 text-center uppercase">{comp.competitorName}</div>
                        </div>

                        <div className="divide-y divide-white/5">
                            {comp.features.map((feature, i) => (
                                <div key={i} className="grid grid-cols-12 p-6 items-center hover:bg-white/[0.02] transition-colors">
                                    <div className="col-span-6 font-bold text-lg">{feature.name}</div>
                                    <div className="col-span-3 flex justify-center">
                                        {feature.vigilHas ? <Check className="w-6 h-6 text-[#b71928]" /> : <X className="w-6 h-6 text-gray-600" />}
                                    </div>
                                    <div className="col-span-3 flex justify-center">
                                        {feature.competitorHas ? <Check className="w-6 h-6 text-gray-400" /> : <X className="w-6 h-6 text-gray-600" />}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="mt-32 pb-16">
                    <h2 className="text-3xl font-vox font-bold mb-8">Ready to upgrade your infrastructure?</h2>
                    <Link href="/chat" className="inline-flex px-8 py-4 bg-[#b71928] text-black font-bold rounded-lg hover:bg-white transition-colors duration-300">
                        INITIALIZE SWARM
                    </Link>
                </div>
            </div>
        </article>
        <Footer />
        </>
    );
}

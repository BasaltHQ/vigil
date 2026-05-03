import Link from 'next/link';
import { getAllCodexTerms } from '@/lib/data/codex';
import { Metadata } from 'next';
import { Footer } from '@/app/components/landing/footer';

export const metadata: Metadata = {
    title: 'Codex | BasaltVigil — Legal AI Terminology',
    description: 'The authoritative glossary of agentic law, swarm intelligence, and automated corporate governance.',
};

export default function CodexIndex() {
    const terms = getAllCodexTerms();

    // Group by category
    const categories = Array.from(new Set(terms.map(t => t.category))).sort();

    return (
        <div className="min-h-screen bg-black text-white selection:bg-[#b71928] selection:text-white font-sans relative overflow-hidden">
            {/* Ambient Background */}
            <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-[#b71928] rounded-full blur-[200px] opacity-[0.03] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-white rounded-full blur-[150px] opacity-[0.02] pointer-events-none" />

            <main className="pt-32 pb-24 max-w-7xl mx-auto px-6 relative z-10">
                <div className="mb-20">
                    <span className="text-xs font-mono tracking-[0.3em] text-[#b71928] mb-4 block">VIGIL.GLOSSARY</span>
                    <h1 className="text-5xl md:text-8xl font-bold mt-4 mb-8 leading-tight tracking-tight font-vox">
                        THE CODEX
                    </h1>
                    <p className="text-xl md:text-2xl text-gray-400 max-w-2xl font-light leading-relaxed">
                        The definitive index of terminology for the next era of Agentic Law.
                    </p>
                </div>

                <div className="space-y-24">
                    {categories.map(category => {
                        const categoryTerms = terms.filter(t => t.category === category).sort((a, b) => a.term.localeCompare(b.term));
                        
                        return (
                            <section key={category} className="border-t border-white/10 pt-12">
                                <h2 className="text-2xl font-mono tracking-widest text-[#b71928] mb-8">{category.toUpperCase()}</h2>
                                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {categoryTerms.map(term => (
                                        <Link 
                                            key={term.slug} 
                                            href={`/codex/${term.slug}`}
                                            className="group block p-6 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] hover:border-[#b71928]/30 transition-all duration-300"
                                        >
                                            <h3 className="text-xl font-bold mb-3 group-hover:text-[#b71928] transition-colors">{term.term}</h3>
                                            <p className="text-sm text-gray-400 line-clamp-3 leading-relaxed">
                                                {term.definition}
                                            </p>
                                        </Link>
                                    ))}
                                </div>
                            </section>
                        );
                    })}
                </div>
            </main>
            <Footer />
        </div>
    );
}

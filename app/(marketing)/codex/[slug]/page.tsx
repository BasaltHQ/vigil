import { getCodexTermBySlug, getAllCodexTerms } from '@/lib/data/codex';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Footer } from '@/app/components/landing/footer';

export async function generateStaticParams() {
    return getAllCodexTerms().map((term) => ({
        slug: term.slug,
    }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params;
    const term = getCodexTermBySlug(slug);
    if (!term) return { title: 'Term Not Found' };
    return {
        title: `${term.term} | BasaltVigil Codex`,
        description: term.definition,
    };
}

export default async function CodexTermPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const term = getCodexTermBySlug(slug);

    if (!term) {
        notFound();
    }

    const allTerms = getAllCodexTerms();
    const relatedTerms = term.relatedSlugs
        .map(relatedSlug => allTerms.find(t => t.slug === relatedSlug))
        .filter((t): t is NonNullable<typeof t> => t !== undefined);

    return (
        <>
        <article className="min-h-screen bg-black text-white selection:bg-[#b71928] selection:text-white pt-32 pb-24 font-sans relative overflow-hidden">
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#b71928] rounded-full blur-[150px] opacity-[0.05] pointer-events-none" />
            
            <div className="max-w-3xl mx-auto px-6 relative z-10">
                <Link href="/codex" className="inline-flex items-center gap-2 text-gray-400 hover:text-[#b71928] transition-colors mb-12 text-sm font-mono tracking-wider">
                    <ArrowLeft className="w-4 h-4" />
                    BACK TO CODEX
                </Link>

                <header className="mb-12">
                    <span className="px-3 py-1 bg-white/5 border border-white/10 text-[#b71928] text-[10px] font-mono tracking-widest rounded-full uppercase mb-6 inline-block">
                        {term.category}
                    </span>

                    <h1 className="text-4xl md:text-6xl font-bold mb-8 leading-tight tracking-tight font-vox">
                        {term.term}
                    </h1>

                    <div className="text-xl md:text-2xl text-gray-300 font-light leading-relaxed border-l-4 border-[#b71928] pl-6 py-2 bg-white/[0.02] rounded-r-lg">
                        {term.definition}
                    </div>
                </header>

                <div className="prose prose-invert prose-red max-w-none mb-16">
                    <p className="text-lg leading-loose text-gray-400">
                        {term.longDescription}
                    </p>
                </div>

                {relatedTerms.length > 0 && (
                    <section className="border-t border-white/10 pt-12">
                        <h3 className="text-sm font-mono tracking-widest text-gray-500 mb-6">RELATED TERMS</h3>
                        <div className="flex flex-wrap gap-4">
                            {relatedTerms.map(related => (
                                <Link
                                    key={related.slug}
                                    href={`/codex/${related.slug}`}
                                    className="px-4 py-2 rounded-lg border border-white/10 bg-white/5 hover:bg-[#b71928] hover:border-[#b71928] hover:text-white text-gray-300 transition-all duration-300 text-sm"
                                >
                                    {related.term}
                                </Link>
                            ))}
                        </div>
                    </section>
                )}
            </div>
        </article>
        <Footer />
        </>
    );
}

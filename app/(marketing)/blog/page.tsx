import Link from 'next/link';
import Image from 'next/image';
import { getHubGroups } from '@/lib/blog/posts';
import { Metadata } from 'next';
import { Footer } from '@/app/components/landing/footer';

export const metadata: Metadata = {
    title: 'Blog | BasaltVigil — Agentic Law Insights',
    description: 'Insights on agentic law, corporate governance automation, and swarm intelligence.',
};

const HUB_GROUP_TITLES: Record<string, { title: string; subtitle: string }> = {
    'legal-economics': {
        title: 'LEGAL ECONOMICS',
        subtitle: 'How agentic AI is rewriting the business model of law.',
    },
    'agentic-infrastructure': {
        title: 'AGENTIC INFRASTRUCTURE',
        subtitle: 'The technical architecture powering autonomous legal intelligence.',
    },
};

export default function BlogIndex() {
    const hubGroups = getHubGroups();

    return (
        <div className="min-h-screen bg-black text-white selection:bg-[#b71928] selection:text-white font-sans">
            <main className="pt-32 pb-24 max-w-7xl mx-auto">
                <div className="text-center px-6 mb-20">
                    <span className="text-xs font-mono tracking-[0.3em] text-[#b71928] mb-4 block">VIGIL.JOURNAL</span>
                    <h1 className="text-5xl md:text-8xl font-bold mt-4 mb-8 leading-tight tracking-tight font-vox">
                        THE BLOG
                    </h1>
                    <p className="text-xl md:text-2xl text-gray-400 max-w-2xl mx-auto font-light leading-relaxed">
                        Dispatches from the frontier of Agentic Law.
                    </p>
                </div>

                {hubGroups.map((group, groupIndex) => {
                    const meta = HUB_GROUP_TITLES[group.groupId] || { title: group.groupId.toUpperCase(), subtitle: '' };

                    return (
                        <section key={group.groupId} className={`mb-24 ${groupIndex > 0 ? 'border-t border-white/[0.06] pt-20' : ''}`}>
                            {/* Section Header */}
                            <div className="px-6 mb-12 flex items-end justify-between">
                                <div>
                                    <span className="text-[10px] font-mono tracking-[0.3em] text-[#b71928] block mb-2">
                                        SERIES {String(groupIndex + 1).padStart(2, '0')}
                                    </span>
                                    <h2 className="text-3xl md:text-4xl font-bold font-vox">{meta.title}</h2>
                                    <p className="text-gray-500 text-sm mt-2 max-w-lg">{meta.subtitle}</p>
                                </div>
                                <div className="hidden md:block text-right">
                                    <span className="text-xs font-mono text-gray-600">{group.spokes.length + 1} ARTICLES</span>
                                </div>
                            </div>

                            {/* Hub Article — Featured */}
                            <Link
                                href={`/blog/${group.hub.slug}`}
                                className="group block mx-6 mb-8 rounded-2xl overflow-hidden border border-white/5 hover:border-[#b71928]/30 transition-all duration-500"
                            >
                                <div className="relative aspect-[21/9] overflow-hidden bg-[#050505]">
                                    <Image src={group.hub.coverImage} alt={group.hub.title} fill className="object-cover opacity-50 group-hover:opacity-70 group-hover:scale-105 transition-all duration-700" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent z-10" />
                                    
                                    <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12 z-20">
                                        <div className="flex items-center gap-4 mb-4">
                                            <span className="px-3 py-1 bg-[#b71928] text-black text-[10px] font-mono tracking-wider rounded-full font-bold">
                                                HUB ARTICLE
                                            </span>
                                            <span className="text-xs font-mono text-gray-400">{group.hub.category}</span>
                                            <span className="text-xs font-mono text-gray-500">{group.hub.readTime}</span>
                                        </div>
                                        <h3 className="text-2xl md:text-4xl font-bold mb-4 group-hover:text-[#b71928] transition-colors leading-tight max-w-4xl">
                                            {group.hub.title}
                                        </h3>
                                        <p className="text-gray-400 max-w-3xl leading-relaxed hidden md:block">
                                            {group.hub.excerpt}
                                        </p>
                                    </div>
                                </div>
                            </Link>

                            {/* Spoke Articles */}
                            <div className="grid md:grid-cols-2 gap-6 px-6">
                                {group.spokes.map((post) => (
                                    <Link
                                        key={post.slug}
                                        href={`/blog/${post.slug}`}
                                        className="group rounded-2xl overflow-hidden border border-white/5 hover:border-[#b71928]/30 transition-all duration-500 hover:-translate-y-1 bg-[#050505]"
                                    >
                                        {/* Spoke Cover Image */}
                                        <div className="relative aspect-[2/1] overflow-hidden">
                                            <Image src={post.coverImage} alt={post.title} fill className="object-cover opacity-40 group-hover:opacity-60 group-hover:scale-105 transition-all duration-500" />
                                            <div className="absolute inset-0 bg-gradient-to-t from-[#050505] to-transparent" />
                                        </div>

                                        <div className="p-6">
                                            <div className="flex items-center gap-3 mb-3">
                                                <span className="text-[10px] font-mono text-[#b71928] tracking-widest uppercase">{post.category}</span>
                                                <span className="text-[10px] font-mono text-gray-600">•</span>
                                                <span className="text-[10px] font-mono text-gray-500">{post.readTime}</span>
                                            </div>
                                            <h4 className="text-lg font-bold mb-3 group-hover:text-[#b71928] transition-colors leading-snug">
                                                {post.title}
                                            </h4>
                                            <p className="text-gray-400 text-sm leading-relaxed line-clamp-3">
                                                {post.excerpt}
                                            </p>
                                            <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between">
                                                <span className="text-xs font-mono text-gray-500">{post.author}</span>
                                                <span className="text-xs font-mono text-gray-600">{new Date(post.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </section>
                    );
                })}
            </main>
            <Footer />
        </div>
    );
}

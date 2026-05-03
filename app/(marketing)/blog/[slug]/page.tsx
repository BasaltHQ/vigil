import { getPostBySlug, getAllPosts } from '@/lib/blog/posts';
import { notFound } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Clock, Calendar, User2 } from 'lucide-react';
import { Footer } from '@/app/components/landing/footer';

export async function generateStaticParams() {
    return getAllPosts().map((post) => ({
        slug: post.slug,
    }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params;
    const post = getPostBySlug(slug);
    if (!post) return { title: 'Post Not Found' };
    return {
        title: `${post.title} | BasaltVigil`,
        description: post.metaDescription,
    };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const post = getPostBySlug(slug);

    if (!post) {
        notFound();
    }

    const allPosts = getAllPosts();
    const relatedPosts = post.relatedSlugs
        .map(s => allPosts.find(p => p.slug === s))
        .filter((p): p is NonNullable<typeof p> => p !== undefined);

    return (
        <>
        <article className="min-h-screen bg-[#050505] text-white selection:bg-[#b71928] selection:text-white font-sans relative overflow-hidden">
            {/* Subtle grid background */}
            <div className="absolute top-0 left-0 right-0 h-[800px] opacity-[0.04] pointer-events-none"
                style={{
                    backgroundImage: 'linear-gradient(rgba(183,25,40,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(183,25,40,0.3) 1px, transparent 1px)',
                    backgroundSize: '60px 60px',
                    maskImage: 'linear-gradient(to bottom, black 30%, transparent 100%)'
                }}
            />
            
            <div className="max-w-5xl mx-auto px-6 relative z-10">
                {/* Navigation */}
                <div className="pt-32 pb-8">
                    <Link href="/blog" className="inline-flex items-center gap-2 text-gray-500 hover:text-[#b71928] transition-colors text-sm font-mono tracking-wider">
                        <ArrowLeft className="w-4 h-4" />
                        BACK TO JOURNAL
                    </Link>
                </div>

                {/* Article Header */}
                <header className="mb-16">
                    {/* Category Badge */}
                    <div className="flex items-center gap-4 mb-8">
                        <span className="px-4 py-1.5 bg-[#b71928]/10 border border-[#b71928]/30 text-[#b71928] text-[10px] font-mono tracking-[0.2em] rounded-full uppercase font-bold">
                            {post.category}
                        </span>
                    </div>

                    {/* Title */}
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-8 leading-[1.1] tracking-tight font-vox max-w-4xl">
                        {post.title}
                    </h1>

                    {/* Excerpt */}
                    <p className="text-xl md:text-2xl text-gray-400 font-light leading-relaxed max-w-3xl mb-10">
                        {post.excerpt}
                    </p>

                    {/* Meta bar */}
                    <div className="flex flex-wrap items-center gap-6 text-xs font-mono text-gray-500 border-t border-b border-white/[0.06] py-5">
                        <div className="flex items-center gap-2">
                            <User2 className="w-3.5 h-3.5 text-[#b71928]" />
                            <span className="tracking-wider uppercase">{post.author}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Calendar className="w-3.5 h-3.5 text-[#b71928]" />
                            <span>{new Date(post.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Clock className="w-3.5 h-3.5 text-[#b71928]" />
                            <span>{post.readTime}</span>
                        </div>
                    </div>
                </header>

                {/* Cover Image */}
                <div className="relative w-full aspect-[2/1] rounded-2xl overflow-hidden border border-white/[0.08] mb-16 shadow-2xl shadow-black/50">
                    <Image src={post.coverImage} alt={post.title} fill className="object-cover" priority />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#050505]/60 via-transparent to-[#050505]/20" />
                </div>

                {/* Article Body */}
                <div className="max-w-3xl mx-auto">
                    <div className="vigil-prose">
                        <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={{
                                h2: ({ children }) => (
                                    <h2 className="text-3xl md:text-4xl font-bold font-vox text-white mt-20 mb-8 leading-tight tracking-tight relative">
                                        <span className="absolute -left-6 top-0 bottom-0 w-1 bg-gradient-to-b from-[#b71928] to-transparent rounded-full hidden md:block" />
                                        {children}
                                    </h2>
                                ),
                                h3: ({ children }) => (
                                    <h3 className="text-xl md:text-2xl font-bold font-vox text-white mt-14 mb-6 leading-snug flex items-center gap-3">
                                        <span className="w-2 h-2 bg-[#b71928] rounded-full shrink-0" />
                                        {children}
                                    </h3>
                                ),
                                p: ({ children, ...props }) => {
                                    // Check if the paragraph only contains an image
                                    const childArray = Array.isArray(children) ? children : [children];
                                    const hasOnlyImage = childArray.length === 1 && typeof childArray[0] === 'object' && childArray[0] !== null && (childArray[0] as any).type?.name === 'img';
                                    if (hasOnlyImage) return <>{children}</>;
                                    return (
                                        <p className="text-[17px] leading-[1.9] text-gray-300 mb-6 font-light" {...props}>
                                            {children}
                                        </p>
                                    );
                                },
                                strong: ({ children }) => (
                                    <strong className="font-bold text-white">{children}</strong>
                                ),
                                em: ({ children }) => (
                                    <em className="text-gray-200 italic">{children}</em>
                                ),
                                blockquote: ({ children }) => (
                                    <blockquote className="border-l-4 border-[#b71928] pl-6 py-4 my-8 bg-white/[0.02] rounded-r-xl">
                                        <div className="text-gray-300 italic text-lg leading-relaxed">{children}</div>
                                    </blockquote>
                                ),
                                ul: ({ children }) => (
                                    <ul className="space-y-3 my-8 ml-1">{children}</ul>
                                ),
                                ol: ({ children }) => (
                                    <ol className="space-y-3 my-8 ml-1 list-none counter-reset-item">{children}</ol>
                                ),
                                li: ({ children, ...props }) => (
                                    <li className="flex items-start gap-4 text-[17px] leading-[1.8] text-gray-300 font-light" {...props}>
                                        <span className="mt-[10px] w-1.5 h-1.5 bg-[#b71928] rounded-full shrink-0" />
                                        <span>{children}</span>
                                    </li>
                                ),
                                img: ({ src, alt }) => (
                                    <figure className="my-14">
                                        <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-white/[0.08] shadow-xl shadow-black/40">
                                            <Image src={src || ''} alt={alt || ''} fill className="object-cover" />
                                        </div>
                                        {alt && (
                                            <figcaption className="mt-4 text-center text-xs font-mono text-gray-600 tracking-wider uppercase">
                                                {alt}
                                            </figcaption>
                                        )}
                                    </figure>
                                ),
                                hr: () => (
                                    <div className="my-16 flex items-center gap-4">
                                        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                                        <div className="w-2 h-2 bg-[#b71928] rounded-full" />
                                        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                                    </div>
                                ),
                                a: ({ children, href }) => (
                                    <a href={href} className="text-[#b71928] hover:text-white underline underline-offset-4 decoration-[#b71928]/40 hover:decoration-white/40 transition-colors">
                                        {children}
                                    </a>
                                ),
                            }}
                        >{post.content}</ReactMarkdown>
                    </div>
                </div>

                {/* Related Posts */}
                {relatedPosts.length > 0 && (
                    <section className="max-w-3xl mx-auto border-t border-white/[0.06] mt-24 pt-16">
                        <h3 className="text-xs font-mono tracking-[0.3em] text-[#b71928] mb-10 uppercase">Related Dispatches</h3>
                        <div className="grid md:grid-cols-2 gap-6">
                            {relatedPosts.map(related => (
                                <Link
                                    key={related.slug}
                                    href={`/blog/${related.slug}`}
                                    className="group block rounded-xl border border-white/[0.06] bg-white/[0.01] hover:bg-white/[0.04] hover:border-[#b71928]/30 transition-all duration-300 overflow-hidden"
                                >
                                    <div className="relative aspect-[2/1] overflow-hidden">
                                        <Image src={related.coverImage} alt={related.title} fill className="object-cover opacity-60 group-hover:opacity-80 group-hover:scale-105 transition-all duration-500" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] to-transparent" />
                                    </div>
                                    <div className="p-5">
                                        <div className="text-[10px] font-mono text-[#b71928] tracking-[0.2em] mb-2 uppercase">{related.category}</div>
                                        <h4 className="text-base font-bold group-hover:text-[#b71928] transition-colors leading-snug">{related.title}</h4>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </section>
                )}

                <div className="pb-24" />
            </div>
        </article>
        <Footer />
        </>
    );
}

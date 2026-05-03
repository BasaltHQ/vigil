import { getIndustryBySlug, getAllIndustries } from '@/lib/data/industries';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import { Footer } from '@/app/components/landing/footer';

export async function generateStaticParams() {
    return getAllIndustries().map((industry) => ({
        slug: industry.slug,
    }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params;
    const industry = getIndustryBySlug(slug);
    if (!industry) return { title: 'Industry Not Found' };
    return {
        title: \`Agentic AI for \${industry.name} | BasaltVigil\`,
        description: industry.description,
    };
}

export default async function IndustryPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const industry = getIndustryBySlug(slug);

    if (!industry) {
        notFound();
    }

    return (
        <>
        <article className="min-h-screen bg-black text-white selection:bg-[#b71928] selection:text-white font-sans relative overflow-hidden">
            
            {/* Hero Section */}
            <div className="relative pt-40 pb-32 border-b border-white/10">
                <div className="absolute inset-0 bg-[#050505] z-0" />
                <div className="absolute inset-0 z-0 opacity-30"
                    style={{
                        backgroundImage: 'linear-gradient(#b71928 1px, transparent 1px), linear-gradient(to right, #b71928 1px, transparent 1px)',
                        backgroundSize: '40px 40px',
                        maskImage: 'radial-gradient(ellipse at center, black 20%, transparent 70%)'
                    }}
                />
                
                <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
                    <Link href="/industries" className="inline-flex items-center gap-2 text-gray-400 hover:text-[#b71928] transition-colors mb-12 text-sm font-mono tracking-wider">
                        <ArrowLeft className="w-4 h-4" />
                        ALL INDUSTRIES
                    </Link>

                    <div className="flex justify-center mb-6">
                        <span className="px-4 py-1 bg-[#b71928]/10 border border-[#b71928]/30 text-[#b71928] text-xs font-mono tracking-widest rounded-full uppercase">
                            Industry Deployment
                        </span>
                    </div>

                    <h1 className="text-5xl md:text-7xl font-bold mb-8 leading-tight tracking-tight font-vox">
                        Agentic Swarms for<br/>
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-[#b71928]">
                            {industry.name}
                        </span>
                    </h1>

                    <p className="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto font-light leading-relaxed">
                        {industry.description}
                    </p>

                    <div className="mt-12 flex justify-center gap-4">
                        <Link href="/chat" className="px-8 py-4 bg-[#b71928] text-black font-bold rounded-lg hover:bg-white transition-colors duration-300">
                            INITIALIZE SWARM
                        </Link>
                    </div>
                </div>
            </div>

            {/* Features Section */}
            <div className="py-32 max-w-7xl mx-auto px-6">
                <div className="grid md:grid-cols-2 gap-16 items-center">
                    <div>
                        <h2 className="text-3xl md:text-5xl font-bold font-vox mb-8 leading-tight">
                            Execute at the Speed of Thought.
                        </h2>
                        <p className="text-lg text-gray-400 leading-relaxed mb-8">
                            Traditional legal software acts as a filing cabinet. BasaltVigil acts as a fleet of executing attorneys. In the realm of {industry.name}, our swarms are pre-trained on historical case law, regulatory shifts, and standard playbook enforcement protocols.
                        </p>
                        
                        <div className="space-y-6">
                            {industry.keyFeatures.map((feature, i) => (
                                <div key={i} className="flex items-start gap-4 p-4 rounded-xl border border-white/5 bg-white/[0.02]">
                                    <CheckCircle2 className="w-6 h-6 text-[#b71928] shrink-0" />
                                    <div>
                                        <h3 className="font-bold text-lg mb-1">{feature}</h3>
                                        <p className="text-sm text-gray-500">Autonomous execution integrated directly into your existing infrastructure.</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="relative aspect-square rounded-2xl border border-white/10 bg-[#050505] overflow-hidden flex items-center justify-center">
                        <div className="absolute inset-0 bg-gradient-to-tr from-[#b71928]/20 to-transparent opacity-50" />
                        <div className="w-3/4 h-3/4 border border-[#b71928]/30 rounded-full animate-[spin_60s_linear_infinite] flex items-center justify-center relative">
                            <div className="absolute top-0 w-4 h-4 bg-[#b71928] rounded-full shadow-[0_0_20px_#b71928] -translate-y-1/2" />
                            <div className="w-3/4 h-3/4 border border-white/10 rounded-full animate-[spin_40s_linear_infinite_reverse] flex items-center justify-center relative">
                                <div className="absolute bottom-0 w-3 h-3 bg-white rounded-full shadow-[0_0_15px_white] translate-y-1/2" />
                                <div className="font-mono text-[#b71928] tracking-widest text-center">
                                    <div className="text-xs opacity-50">STATUS</div>
                                    <div className="font-bold">ACTIVE</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </article>
        <Footer />
        </>
    );
}

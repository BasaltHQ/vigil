import Link from 'next/link';
import { getAllIndustries } from '@/lib/data/industries';
import { Metadata } from 'next';
import { Footer } from '@/app/components/landing/footer';

export const metadata: Metadata = {
    title: 'Industries | BasaltVigil — Agentic Law for Every Sector',
    description: 'Discover how BasaltVigil automates legal workflows across Corporate, Real Estate, Healthcare, and IP Law.',
};

export default function IndustriesIndex() {
    const industries = getAllIndustries();

    return (
        <div className="min-h-screen bg-[#050505] text-white selection:bg-[#b71928] selection:text-white font-sans">
            <main className="pt-32 pb-24 max-w-7xl mx-auto px-6">
                <div className="text-center mb-24">
                    <span className="text-xs font-mono tracking-[0.3em] text-[#b71928] mb-4 block">SECTOR DEPLOYMENTS</span>
                    <h1 className="text-5xl md:text-8xl font-bold mt-4 mb-8 leading-tight tracking-tight font-vox">
                        INDUSTRIES
                    </h1>
                    <p className="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto font-light leading-relaxed">
                        Agentic Law is not one-size-fits-all. We deploy specialized swarms trained on the specific jurisprudence, regulatory frameworks, and risk tolerances of your industry.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {industries.map((industry) => (
                        <Link
                            key={industry.slug}
                            href={`/industries/${industry.slug}`}
                            className="group block rounded-2xl border border-white/10 bg-black overflow-hidden hover:border-[#b71928]/50 transition-all duration-500 relative hover:-translate-y-1"
                        >
                            <div className="absolute inset-0 bg-gradient-to-b from-[#b71928]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            
                            <div className="p-8 h-full flex flex-col relative z-10">
                                <h2 className="text-3xl font-bold mb-4 font-vox group-hover:text-[#b71928] transition-colors">{industry.name}</h2>
                                <p className="text-gray-400 mb-8 flex-grow leading-relaxed">
                                    {industry.description}
                                </p>
                                
                                <div>
                                    <h3 className="text-xs font-mono tracking-widest text-gray-500 mb-4">CAPABILITIES</h3>
                                    <ul className="space-y-2">
                                        {industry.keyFeatures.map((feature, i) => (
                                            <li key={i} className="flex items-center gap-2 text-sm text-gray-300">
                                                <div className="w-1.5 h-1.5 rounded-full bg-[#b71928]" />
                                                {feature}
                                            </li>
                                        ))}
                                    </ul>
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

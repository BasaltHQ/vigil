import LOCATIONS from '@/lib/data/locations.json';
import { TOP_JURISDICTIONS } from '@/lib/data/top-jurisdictions';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, MapPin, Zap, Shield, Globe } from 'lucide-react';
import { Footer } from '@/app/components/landing/footer';

// For Next.js dynamic routing on massive arrays, generating all params at build time
// for 100k locations might cause out-of-memory or take hours.
// We'll generate a subset statically, and let the rest be generated on demand (ISR).
export async function generateStaticParams() {
    const topParams = TOP_JURISDICTIONS.map((loc) => ({ slug: loc.slug }));
    const restParams = LOCATIONS.slice(0, 500).map((loc: any) => ({ slug: loc.slug }));
    return [...topParams, ...restParams];
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params;
    const loc: any = TOP_JURISDICTIONS.find((l) => l.slug === slug) || LOCATIONS.find((l: any) => l.slug === slug);
    if (!loc) return { title: 'Location Not Found' };
    return {
        title: `Agentic Legal Infrastructure in ${loc.name}, ${loc.country} | BasaltVigil`,
        description: `Deploy autonomous legal swarms in ${loc.name} with full adherence to local data sovereignty and compliance requirements.`,
    };
}

export default async function LocationPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const loc: any = TOP_JURISDICTIONS.find((l) => l.slug === slug) || LOCATIONS.find((l: any) => l.slug === slug);

    if (!loc) {
        notFound();
    }

    return (
        <>
        <article className="min-h-screen bg-black text-white selection:bg-[#b71928] selection:text-white font-sans relative overflow-hidden">
            {/* Generative Geographic Background */}
            <div className="absolute top-0 right-0 w-[600px] h-[600px] opacity-10 pointer-events-none"
                style={{
                    backgroundImage: `radial-gradient(circle at center, #b71928 0%, transparent 60%)`,
                    backgroundPosition: `${Math.abs(loc.lng)}% ${Math.abs(loc.lat)}%`
                }}
            />

            <div className="pt-40 pb-20 max-w-7xl mx-auto px-6 relative z-10 text-center">
                <Link href="/locations" className="inline-flex items-center gap-2 text-gray-400 hover:text-[#b71928] transition-colors mb-12 text-sm font-mono tracking-wider">
                    <ArrowLeft className="w-4 h-4" />
                    BACK TO CAPABILITY MATRIX
                </Link>

                <div className="flex justify-center mb-8">
                    <div className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full font-mono text-xs tracking-widest text-[#b71928]">
                        <span className="w-2 h-2 rounded-full bg-[#b71928] animate-pulse" />
                        NODE: {loc.lat}, {loc.lng}
                    </div>
                </div>

                <h1 className="text-5xl md:text-8xl font-bold mb-8 leading-tight tracking-tight font-vox">
                    Legal AI Infrastructure in<br/>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-500">{loc.name}</span>
                </h1>

                <p className="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto font-light leading-relaxed mb-16">
                    Deploy BasaltVigil's executing swarms in {loc.name}. Ensure strict data sovereignty, low-latency document processing, and compliance with local {loc.country} corporate governance protocols.
                </p>
                
                <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto text-left mb-24">
                    <div className="p-8 rounded-2xl bg-[#050505] border border-white/10 hover:border-[#b71928]/30 transition-colors">
                        <MapPin className="w-8 h-8 text-[#b71928] mb-6" />
                        <h3 className="text-xl font-bold font-vox mb-3">Data Sovereignty</h3>
                        <p className="text-gray-400 text-sm leading-relaxed">
                            Vectors generated in {loc.name} remain within the {loc.country} privacy perimeter. External reasoning utilizes Zero-Knowledge abstraction.
                        </p>
                    </div>

                    <div className="p-8 rounded-2xl bg-[#050505] border border-white/10 hover:border-[#b71928]/30 transition-colors">
                        <Shield className="w-8 h-8 text-[#b71928] mb-6" />
                        <h3 className="text-xl font-bold font-vox mb-3">Jurisdictional Playbooks</h3>
                        <p className="text-gray-400 text-sm leading-relaxed">
                            Swarms deployed via this node automatically inherit regional playbook overrides specific to {loc.country} commercial law.
                        </p>
                    </div>

                    <div className="p-8 rounded-2xl bg-[#050505] border border-white/10 hover:border-[#b71928]/30 transition-colors">
                        <Zap className="w-8 h-8 text-[#b71928] mb-6" />
                        <h3 className="text-xl font-bold font-vox mb-3">Edge Compute</h3>
                        <p className="text-gray-400 text-sm leading-relaxed">
                            Utilize local inferencing capabilities for sub-second contract redlining and M&A document routing.
                        </p>
                    </div>
                </div>

                <div className="pb-16">
                    <Link href="/chat" className="inline-flex px-8 py-4 bg-[#b71928] text-black font-bold rounded-lg hover:bg-white transition-colors duration-300">
                        INITIALIZE {loc.name.toUpperCase()} NODE
                    </Link>
                </div>
            </div>
        </article>
        <Footer />
        </>
    );
}

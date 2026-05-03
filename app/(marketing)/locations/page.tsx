import Link from 'next/link';
import LOCATIONS from '@/lib/data/locations.json';
import { Metadata } from 'next';
import { Footer } from '@/app/components/landing/footer';

export const metadata: Metadata = {
    title: 'Global Agentic Hubs | BasaltVigil Locations',
    description: 'Explore the global availability of BasaltVigil swarm infrastructure.',
};

export default function LocationsIndex() {
    // Only take top 100 or so for the index to avoid massive DOM
    const displayLocations = LOCATIONS.slice(0, 60);

    return (
        <div className="min-h-screen bg-[#050505] text-white selection:bg-[#b71928] selection:text-white font-sans relative overflow-hidden">
            <main className="pt-32 pb-24 max-w-7xl mx-auto px-6 relative z-10">
                <div className="text-center mb-24">
                    <span className="text-xs font-mono tracking-[0.3em] text-[#b71928] mb-4 block">GLOBAL CAPABILITY MATRIX</span>
                    <h1 className="text-5xl md:text-8xl font-bold mt-4 mb-8 leading-tight tracking-tight font-vox">
                        AGENTIC HUBS
                    </h1>
                    <p className="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto font-light leading-relaxed">
                        Vigil is deployed globally, ensuring jurisdictional compliance and data sovereignty across all major markets.
                    </p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {displayLocations.map((loc: any) => (
                        <Link
                            key={loc.slug}
                            href={`/locations/${loc.slug}`}
                            className="p-4 rounded-lg border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] hover:border-[#b71928]/30 transition-all text-sm font-mono tracking-wider flex items-center justify-between group"
                        >
                            <span className="truncate group-hover:text-[#b71928] transition-colors">{loc.name}</span>
                            <span className="text-gray-600 text-[10px]">{loc.country}</span>
                        </Link>
                    ))}
                </div>
                
                <div className="mt-16 text-center text-sm font-mono text-gray-500">
                    Showing 60 of {LOCATIONS.length.toLocaleString()} active global edge nodes. Search via programmatic routing.
                </div>
            </main>
            <Footer />
        </div>
    );
}

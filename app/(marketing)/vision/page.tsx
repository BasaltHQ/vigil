import { NeuromimeticSlideshow } from "@/app/components/landing/neuromimetic-slideshow";
import { OntologyExplainer } from "@/app/components/landing/ontology-explainer";
import { Footer } from "@/app/components/landing/footer";
import { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = {
    title: "Our Vision | BasaltVigil",
    description: "The architectural vision behind agentic legal swarms and the death of the billable hour.",
};

export default function VisionPage() {
    return (
        <div className="min-h-screen bg-black text-white font-sans selection:bg-[#b71928] selection:text-white">
            {/* Ambient Background */}
            <div className="fixed top-0 left-0 w-full h-full pointer-events-none overflow-hidden z-0">
                <div className="absolute top-[20%] left-[-10%] w-[1000px] h-[1000px] bg-[#b71928] rounded-full blur-[300px] opacity-[0.03]" />
                <div className="absolute bottom-[10%] right-[-10%] w-[800px] h-[800px] bg-white rounded-full blur-[250px] opacity-[0.02]" />
            </div>

            <div className="relative z-10 pt-40 pb-32 max-w-7xl mx-auto px-6">
                <div className="text-center mb-24 animate-fadeInUp">
                    <span className="text-xs font-mono tracking-[0.3em] text-[#b71928] mb-4 block uppercase">The Manifesto</span>
                    <h1 className="text-5xl md:text-8xl font-bold mt-4 mb-8 leading-tight tracking-tight font-vox">
                        THE DEATH OF <br className="hidden md:block"/> THE BILLABLE HOUR
                    </h1>
                    <p className="text-xl md:text-2xl text-gray-400 max-w-4xl mx-auto font-light leading-relaxed">
                        For a century, the legal industry has scaled by exploiting inefficiency. BasaltVigil was built on a different premise: Compute is infinite. Human intellect is not. 
                    </p>
                </div>
            </div>

            {/* Conceptual Section */}
            <section className="relative z-10 py-24 bg-[#050505]">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex flex-col lg:flex-row gap-16 items-center">
                        <div className="lg:w-1/2">
                            <h2 className="text-3xl md:text-5xl font-bold font-vox mb-8 leading-tight">The Neuromimetic Firm</h2>
                            <div className="space-y-6 text-gray-400 text-lg font-light leading-relaxed">
                                <p>
                                    Modern law firms operate as massive, parallel human computers. Associates act as data ingestion pipelines; senior partners serve as inference engines and final decision nodes. This architecture is slow, prone to exhaustion, and prohibitively expensive for clients.
                                </p>
                                <p>
                                    BasaltVigil abstracts the structure of the elite law firm into a <strong className="text-white font-medium">Neuromimetic Digital Brain</strong>. We have digitized the "partner review process" into a multi-agent swarm architecture. 
                                </p>
                                <p>
                                    When you submit a query to Vigil, it doesn't just read the text. It spawns an internal courtroom. Agent Alpha drafts a defensive contract; Agent Beta attacks the indemnification clauses; Agent Gamma references 40 years of Delaware corporate case law to find the loophole. They deliberate at the speed of light, arriving at consensus before presenting you with the perfect legal payload.
                                </p>
                            </div>
                            <div className="mt-12 p-6 border-l-2 border-[#b71928] bg-[#b71928]/5 rounded-r-xl">
                                <p className="font-mono text-sm tracking-widest text-[#b71928] mb-2 uppercase">The Moral Imperative</p>
                                <p className="text-white font-medium">"Justice should not be constrained by human latency. By collapsing 50 hours of associate labor into 400 milliseconds of compute, we democratize elite corporate defense."</p>
                            </div>
                        </div>

                        <div className="lg:w-1/2 relative">
                            <div className="relative w-full aspect-square rounded-2xl overflow-hidden glass-panel border border-white/10 shadow-[0_0_80px_rgba(183,25,40,0.15)] group">
                                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-10" />
                                <Image
                                    src="/vigil_digital_brain.png"
                                    alt="The Neuromimetic Digital Brain representing Agentic Law"
                                    fill
                                    className="object-cover transition-transform duration-1000 group-hover:scale-110"
                                    priority
                                />
                                <div className="absolute bottom-6 left-6 z-20">
                                    <div className="flex items-center gap-3">
                                        <div className="w-2 h-2 rounded-full bg-[#b71928] animate-pulse" />
                                        <span className="font-mono text-xs tracking-widest text-white">ONTOLOGY ACTIVE</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Existing Explainer Sections */}
            <div className="relative z-10">
                <OntologyExplainer />
            </div>

            <div className="relative z-10 border-t border-white/5 bg-[#020202]">
                <NeuromimeticSlideshow />
            </div>

            <Footer />
        </div>
    )
}

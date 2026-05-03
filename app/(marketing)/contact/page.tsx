"use client";

import { useState } from "react";
import { Footer } from "@/app/components/landing/footer";
import { Loader2 } from "lucide-react";

export default function ContactPage() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        const form = e.currentTarget;
        const formData = new FormData(form);
        
        // System fields required by the CRM
        formData.append("form_slug", "basaltvigil-contact-form-0d0d696c");
        formData.append("source_url", window.location.href);
        if (document.referrer) formData.append("referrer", document.referrer);

        try {
            const res = await fetch("https://crm.basalthq.com/api/forms/submit", {
                method: "POST",
                body: formData,
            });

            // The CRM API responds with 200 OK and no body on success
            if (res.ok) {
                setIsSuccess(true);
            } else {
                const text = await res.text();
                try {
                    const data = JSON.parse(text);
                    setError(data.error || "Submission failed. Please try again.");
                } catch {
                    setError("Network transmission error. Please try again.");
                }
            }
        } catch (err) {
            setError("Submission failed. Network disrupted.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-black text-white selection:bg-[#b71928] selection:text-white font-sans relative overflow-hidden flex flex-col">
            {/* Ambient Background */}
            <div className="absolute top-0 left-0 w-[800px] h-[800px] bg-[#b71928] rounded-full blur-[200px] opacity-[0.03] pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-white rounded-full blur-[150px] opacity-[0.02] pointer-events-none" />

            <main className="flex-grow pt-40 pb-24 max-w-4xl mx-auto px-6 relative z-10 w-full">
                <div className="text-center mb-16">
                    <span className="text-xs font-mono tracking-[0.3em] text-[#b71928] mb-4 block uppercase">Secure Channel</span>
                    <h1 className="text-5xl md:text-7xl font-bold mt-4 mb-6 leading-tight tracking-tight font-vox">
                        CONTACT VIGIL
                    </h1>
                    <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto font-light leading-relaxed">
                        Request a private briefing on agentic legal infrastructure or coordinate a custom deployment for your firm.
                    </p>
                </div>

                <div className="max-w-xl mx-auto glass-panel p-8 md:p-12 rounded-2xl border border-white/10 bg-[#050505]/80 backdrop-blur-xl relative">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 px-4 py-1 bg-black border border-white/10 text-gray-400 text-[10px] font-bold font-mono tracking-widest rounded-full flex items-center gap-2 shadow-lg">
                        <div className="w-2 h-2 rounded-full bg-[#b71928] animate-pulse" />
                        ENCRYPTED PORTAL
                    </div>

                    {isSuccess ? (
                        <div className="text-center py-12 px-6 border border-white/10 rounded-xl bg-white/[0.02]">
                            <h3 className="text-[#b71928] font-bold mb-4 text-2xl tracking-widest font-vox uppercase">Transmission Secured</h3>
                            <p className="text-gray-400 leading-relaxed">
                                Your inquiry has been encrypted and routed to our intake node.<br />
                                A specialist will reach out to you within one business day.
                            </p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label htmlFor="first_name" className="block text-xs font-bold text-gray-400 tracking-wider uppercase">First Name *</label>
                                    <input 
                                        type="text" 
                                        id="first_name"
                                        name="first_name" 
                                        required 
                                        placeholder="Enter your first name"
                                        className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-[#b71928] focus:bg-white/[0.05] transition-all"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="last_name" className="block text-xs font-bold text-gray-400 tracking-wider uppercase">Last Name *</label>
                                    <input 
                                        type="text" 
                                        id="last_name"
                                        name="last_name" 
                                        required 
                                        placeholder="Enter your last name"
                                        className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-[#b71928] focus:bg-white/[0.05] transition-all"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="email" className="block text-xs font-bold text-gray-400 tracking-wider uppercase">Email Address *</label>
                                <input 
                                    type="email" 
                                    id="email"
                                    name="email" 
                                    required 
                                    placeholder="you@example.com"
                                    className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-[#b71928] focus:bg-white/[0.05] transition-all"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label htmlFor="phone" className="block text-xs font-bold text-gray-400 tracking-wider uppercase">Phone Number</label>
                                    <input 
                                        type="tel" 
                                        id="phone"
                                        name="phone" 
                                        placeholder="(555) 123-4567"
                                        className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-[#b71928] focus:bg-white/[0.05] transition-all"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="company" className="block text-xs font-bold text-gray-400 tracking-wider uppercase">Company Name</label>
                                    <input 
                                        type="text" 
                                        id="company"
                                        name="company" 
                                        placeholder="e.g., Acme Legal Corp"
                                        className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-[#b71928] focus:bg-white/[0.05] transition-all"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="website" className="block text-xs font-bold text-gray-400 tracking-wider uppercase">Company Website</label>
                                <input 
                                    type="text" 
                                    id="website"
                                    name="website" 
                                    placeholder="https://yourcompany.com"
                                    className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-[#b71928] focus:bg-white/[0.05] transition-all"
                                />
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="message" className="block text-xs font-bold text-gray-400 tracking-wider uppercase">Additional Details</label>
                                <textarea 
                                    id="message"
                                    name="message" 
                                    rows={4}
                                    placeholder="What brings you to BasaltVigil today? (optional)"
                                    className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-[#b71928] focus:bg-white/[0.05] transition-all resize-y"
                                />
                            </div>

                            {error && (
                                <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                                    {error}
                                </div>
                            )}

                            <button 
                                type="submit" 
                                disabled={isSubmitting}
                                className="w-full bg-[#b71928] text-white border-none py-4 px-6 rounded-lg cursor-pointer text-sm font-bold tracking-widest uppercase mt-4 transition-all hover:bg-[#ff1f35] hover:shadow-[0_0_20px_rgba(183,25,40,0.4)] focus:outline-none focus:ring-2 focus:ring-[#b71928] focus:ring-offset-2 focus:ring-offset-black disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                                {isSubmitting ? "Transmitting..." : "Initialize Contact"}
                            </button>
                        </form>
                    )}
                </div>
            </main>
            
            <Footer />
        </div>
    );
}

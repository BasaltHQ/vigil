import Link from "next/link";
import { Shield, Lock, FileText, Database, Server } from "lucide-react";

export const metadata = {
  title: "Privacy Policy | BasaltVigil Legal-Ops Platform",
  description: "Enterprise privacy policy outlining our zero-retention inference guarantees and data security protocols.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-[#020202] text-gray-300 font-sans pt-32 pb-24">
      <div className="max-w-4xl mx-auto px-6">
        {/* Header */}
        <div className="mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs font-mono tracking-widest text-gray-400 mb-6">
            <Shield size={14} className="text-[#b71928]" />
            LEGAL DOCUMENTATION
          </div>
          <h1 className="text-4xl md:text-5xl font-bold font-vox text-white mb-6 tracking-wide">Privacy Policy</h1>
          <p className="text-xl text-gray-400 max-w-2xl">
            Our commitment to total data sovereignty. BasaltVigil operates under strict Zero-Retention protocols to protect your proprietary legal intelligence.
          </p>
          <div className="mt-6 text-sm text-gray-500 font-mono">
            LAST UPDATED: May 3, 2026 | EFFECTIVE: May 3, 2026
          </div>
        </div>

        {/* Content */}
        <div className="space-y-12 text-sm leading-relaxed text-gray-300">
          
          <section className="glass-panel p-8 rounded-2xl border border-red-900/30 bg-gradient-to-b from-red-900/10 to-transparent relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
              <Lock size={120} />
            </div>
            <h2 className="text-xl font-bold text-white mb-4 tracking-wider flex items-center gap-3">
              1. The Zero-Retention Inference Guarantee
            </h2>
            <p className="mb-4">
              BasaltVigil processes highly sensitive corporate intelligence, M&A data rooms, and proprietary contract logic. As such, we strictly enforce a <strong>Zero-Retention Inference Model</strong> across our entire application infrastructure.
            </p>
            <ul className="space-y-3 mt-6">
              <li className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 bg-[#b71928] rounded-full mt-2 shrink-0" />
                <p><strong>No Foundational Training:</strong> Data submitted to the Vigil platform, including documents, queries, and Custom Firm Playbooks, is <em>never</em> used to train, fine-tune, or improve foundational Large Language Models (LLMs) managed by us or our sub-processors (e.g., Azure OpenAI).</p>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 bg-[#b71928] rounded-full mt-2 shrink-0" />
                <p><strong>Ephemeral Context Windows:</strong> Context injected into our AI Swarm agents is maintained only for the duration of the computational session (inference). Upon completion of the generation or redlining task, the computational memory is purged.</p>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 bg-[#b71928] rounded-full mt-2 shrink-0" />
                <p><strong>Encrypted Artifact Storage:</strong> Output artifacts (e.g., drafted PDFs, redlined DOCX files) are stored at rest utilizing AES-256 encryption. Enterprise-tier users operate within air-gapped or dedicated vector indices that are cryptographically isolated from other tenants.</p>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4 tracking-wider">2. Information We Collect</h2>
            <p className="mb-4">We collect information that identifies, relates to, describes, or could reasonably be linked, directly or indirectly, with a particular consumer or device ("Personal Information").</p>
            <div className="grid md:grid-cols-2 gap-6 mt-6">
              <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                <Database className="text-blue-400 mb-4" size={24} />
                <h3 className="font-bold text-white mb-2">Account Data</h3>
                <p className="text-xs text-gray-400">Email addresses, corporate identities, billing information (processed securely via Stripe), and Thirdweb cryptographic wallet addresses used for authentication.</p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                <FileText className="text-amber-400 mb-4" size={24} />
                <h3 className="font-bold text-white mb-2">Operational Data</h3>
                <p className="text-xs text-gray-400">Custom Firm Playbooks, brand parameters, and ingested source documents. This data is strictly governed by our Zero-Retention guarantee.</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4 tracking-wider">3. Third-Party Sub-Processors</h2>
            <p className="mb-4">To provide our computational services, we engage with industry-leading sub-processors. We maintain strict Data Processing Agreements (DPAs) with each provider:</p>
            <ul className="list-disc pl-6 space-y-2 text-gray-400">
              <li><strong>Azure OpenAI:</strong> API endpoints configured for zero data retention (abuse monitoring opt-out enforced).</li>
              <li><strong>Stripe, Inc.:</strong> Payment processing and subscription management.</li>
              <li><strong>Thirdweb:</strong> Decentralized Identity (DID) and session authentication.</li>
              <li><strong>AWS / Vercel:</strong> Secure global edge hosting and encrypted blob storage.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4 tracking-wider">4. Data Security & Compliance</h2>
            <p className="mb-4">
              Vigil implements organizational, technical, and physical security measures designed to protect your data. This includes role-based access control (RBAC), end-to-end TLS 1.3 encryption in transit, and continuous vulnerability scanning. While we strive for absolute security, no system is impenetrable; Enterprise tier clients are provided SOC2 Type II reporting upon request.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4 tracking-wider">5. Your Rights & Jurisdiction</h2>
            <p className="mb-4">
              Depending on your jurisdiction (e.g., GDPR in the EU, CCPA in California), you maintain the right to access, rectify, or execute a "right to be forgotten" regarding your account data. Operational data tied to legal records may be subject to mandated retention periods pursuant to local bar association regulations.
            </p>
            <p>
              For privacy-related inquiries or to exercise your data sovereignty rights, please contact our Data Protection Officer at <a href="mailto:privacy@basalthq.com" className="text-[#b71928] hover:underline">privacy@basalthq.com</a>.
            </p>
          </section>
        </div>

        {/* Footer Actions */}
        <div className="mt-16 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <Link href="/terms" className="text-sm font-mono tracking-wider text-gray-500 hover:text-white transition-colors">
            READ TERMS OF SERVICE &rarr;
          </Link>
          <Link href="/" className="px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded font-mono text-xs tracking-widest transition-colors">
            RETURN TO PLATFORM
          </Link>
        </div>
      </div>
    </div>
  );
}

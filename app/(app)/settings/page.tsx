"use client";

import { useState, useEffect } from "react";
import { Search, Loader2, Save, Image as ImageIcon, CheckCircle, Palette, Type, MessageSquare, Briefcase, FileText, Maximize2, Target, Globe, Upload, X, User, CreditCard } from "lucide-react";
import { FORTUNE_50_TEMPLATES } from "@/lib/templates/fortune50";
import { ConnectButton, darkTheme } from "thirdweb/react";
import { inAppWallet } from "thirdweb/wallets";
import { base } from "thirdweb/chains";
import { client } from "@/lib/thirdweb";

export default function SettingsPage() {
  const [profile, setProfile] = useState<any>(null);
  const [urlInput, setUrlInput] = useState("");
  const [companyNameInput, setCompanyNameInput] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);
  
  // Doc ID State
  const [docIdTemplate, setDocIdTemplate] = useState("VARUNA-[YYYY]-[####]");
  const [docIdCounter, setDocIdCounter] = useState(0);
  
  // Curation Modal State
  const [showModal, setShowModal] = useState(false);
  const [extractedProfile, setExtractedProfile] = useState<any>(null);

  // Template Selection State
  const [selectedTemplateKey, setSelectedTemplateKey] = useState<string | null>(null);
  const [previewPdfUrl, setPreviewPdfUrl] = useState<string | null>(null);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [isFullscreenPreview, setIsFullscreenPreview] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isUploadingCover, setIsUploadingCover] = useState(false);

  // Tabs
  const [activeTab, setActiveTab] = useState<"identity" | "playbook" | "billing">("identity");
  const [isAnnual, setIsAnnual] = useState(true);

  // Playbook State
  const [playbookText, setPlaybookText] = useState("");
  const [isUploadingPlaybook, setIsUploadingPlaybook] = useState(false);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append("file", file);

    setIsUploading(true);
    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData
      });
      const data = await res.json();
      if (data.url) {
        const newProfile = { ...extractedProfile };
        newProfile.logos = [data.url, ...(newProfile.logos || [])];
        setExtractedProfile(newProfile);
      } else {
        alert("Upload failed: " + data.error);
      }
    } catch (error) {
      alert("Upload failed.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append("file", file);

    setIsUploadingCover(true);
    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData
      });
      const data = await res.json();
      if (data.url) {
        setExtractedProfile({ ...extractedProfile, coverImage: data.url });
      } else {
        alert("Upload failed: " + data.error);
      }
    } catch (error) {
      alert("Upload failed.");
    } finally {
      setIsUploadingCover(false);
    }
  };

  const handlePlaybookUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append("file", file);

    setIsUploadingPlaybook(true);
    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData
      });
      const data = await res.json();
      if (data.url) {
        const appendedText = playbookText ? `${playbookText}\n\n[Attached Reference: ${data.url}]` : `[Attached Reference: ${data.url}]`;
        setPlaybookText(appendedText);
      } else {
        alert("Upload failed: " + data.error);
      }
    } catch (error) {
      alert("Upload failed.");
    } finally {
      setIsUploadingPlaybook(false);
    }
  };

  useEffect(() => {
    fetch("/api/profile")
      .then(r => r.json())
      .then(data => {
        setProfile(data);
        if (data.companyUrl) setUrlInput(data.companyUrl);
        if (data.companyName) setCompanyNameInput(data.companyName);
        if (data.baseTemplate) setSelectedTemplateKey(data.baseTemplate);
        if (data.docIdTemplate) setDocIdTemplate(data.docIdTemplate);
        if (data.docIdCounter !== undefined) setDocIdCounter(data.docIdCounter);
        if (data.brandParameters?.customPlaybook) setPlaybookText(data.brandParameters.customPlaybook);
      });
  }, []);

  const handleCheckout = async (priceId: string) => {
    setIsCheckoutLoading(true);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId })
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert("Failed to start checkout: " + data.error);
      }
    } catch (error) {
      alert("Checkout failed.");
    } finally {
      setIsCheckoutLoading(false);
    }
  };

  const handleAnalyze = async () => {
    if (!urlInput) return;
    setIsAnalyzing(true);
    try {
      const res = await fetch("/api/settings/brand/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: urlInput })
      });
      const data = await res.json();
      if (data.success) {
        setExtractedProfile(data.profile);
        if (data.profile.companyName && !companyNameInput) {
          setCompanyNameInput(data.profile.companyName);
        }
        setShowModal(true);
      } else {
        alert("Failed to analyze: " + data.error);
      }
    } catch (error) {
      alert("Analysis failed.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const saveSettings = async (updates: any) => {
    setIsSaving(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates)
      });
      if (res.ok) {
        const updated = await res.json();
        setProfile(updated);
        setShowModal(false);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const previewTemplate = async (key: string) => {
    setIsPreviewing(true);
    setPreviewPdfUrl(null);
    try {
      let latex = FORTUNE_50_TEMPLATES[key].latex;
      
      const primaryColor = profile?.brandAssets?.colors?.primary?.replace('#', '') || '000000';
      const secondaryColor = profile?.brandAssets?.colors?.secondary?.replace('#', '') || '555555';
      const companyName = profile?.companyName || "SAMPLE COMPANY";
      const logoUrl = profile?.brandAssets?.logos?.[0] || null;
      const isValidLogo = logoUrl && !logoUrl.toLowerCase().includes('.svg') && !logoUrl.toLowerCase().includes('.webp');
      const companyHeader = isValidLogo ? `\\includegraphics[height=1.2cm]{logo.png}` : `\\textbf{\\textcolor{BrandPrimary}{${companyName}}}`;

      const coverUrl = profile?.brandAssets?.coverImage || null;
      const isValidCover = coverUrl && !coverUrl.toLowerCase().includes('.svg') && !coverUrl.toLowerCase().includes('.webp');
      const coverImageBlock = isValidCover ? `\\includegraphics[width=\\textwidth,height=10cm,keepaspectratio]{cover.png}` : '';

      latex = latex.replace(/\[BRAND_PRIMARY\]/g, primaryColor);
      latex = latex.replace(/\[BRAND_SECONDARY\]/g, secondaryColor);
      latex = latex.replace(/\[COMPANY_HEADER\]/g, companyHeader);
      latex = latex.replace(/\[COMPANY_NAME\]/g, companyName);
      latex = latex.replace(/\[COVER_IMAGE_BLOCK\]/g, coverImageBlock);
      latex = latex.replace(/\[DISPLAY_ID\]/g, "PREVIEW-0000");
      latex = latex.replace(/\[TITLE\]/g, "Document Layout Preview");
      latex = latex.replace(/\[SECTIONS_CONTENT\]/g, "\\section*{1. Sample Section}\nThis is a demonstration of how the layout structure handles standard paragraphs and typography.\n\n\\section*{2. Formatting Test}\nAnother section to test spacing.");
      latex = latex.replace(/\[SIGNATURES_CONTENT\]/g, "\\noindent\n\\textbf{\\textcolor{BrandPrimary}{SAMPLE ENTITY}}\\\\[1em]\n\\hrulefill \\\\\n\\textbf{John Doe}, CEO\n");
      latex = latex.replace(/\[MEMO_HEADERS\]/g, "\\begin{tabular}{@{}ll}\n\\textbf{TO:} & All Employees \\\\\n\\textbf{FROM:} & Management \\\\\n\\textbf{DATE:} & \\today \\\\\n\\textbf{SUBJECT:} & Template Preview \\\\\n\\end{tabular}\n");

      const res = await fetch("/api/compile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ latex, filename: `preview_${key}`, logoUrl, coverUrl })
      });
      const data = await res.json();
      if (data.url) {
        setPreviewPdfUrl(data.url);
      } else {
        alert("Failed to generate preview: " + data.error);
      }
    } catch (e: any) {
      alert("Failed to compile preview.");
    } finally {
      setIsPreviewing(false);
    }
  };

  if (!profile) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-gray-500" /></div>;

  return (
    <div className="h-full flex flex-col bg-black/40 overflow-hidden relative">
      <div className="flex-1 overflow-y-auto p-8 max-w-6xl mx-auto w-full">
        <div className="flex items-center justify-between mb-8 border-b border-white/10 pb-4">
          <h2 className="text-2xl font-vox text-white tracking-wider">WORKSPACE SETTINGS</h2>
          <div className="flex gap-4">
            <button 
              onClick={() => setActiveTab("identity")}
              className={`px-4 py-2 font-mono text-xs tracking-widest rounded-t-lg border-b-2 transition-colors ${activeTab === "identity" ? "border-[#b71928] text-white" : "border-transparent text-gray-500 hover:text-gray-300"}`}
            >
              IDENTITY
            </button>
            <button 
              onClick={() => setActiveTab("playbook")}
              className={`px-4 py-2 font-mono text-xs tracking-widest rounded-t-lg border-b-2 transition-colors ${activeTab === "playbook" ? "border-[#b71928] text-white" : "border-transparent text-gray-500 hover:text-gray-300"}`}
            >
              PLAYBOOK
            </button>
            <button 
              onClick={() => setActiveTab("billing")}
              className={`px-4 py-2 font-mono text-xs tracking-widest rounded-t-lg border-b-2 transition-colors ${activeTab === "billing" ? "border-[#b71928] text-white" : "border-transparent text-gray-500 hover:text-gray-300"}`}
            >
              BILLING
            </button>
          </div>
        </div>

        {activeTab === "identity" && (
          <>
            {/* User Profile Section */}
        <div className="glass-panel p-6 border-white/10 mb-8">
          <div className="flex justify-between items-start mb-6">
            <h3 className="text-sm font-bold text-gray-300 tracking-wider flex items-center gap-2">
              <User size={16} className="text-blue-400" /> USER IDENTITY
            </h3>
            <ConnectButton 
              client={client} 
              chain={base}
              wallets={[
                inAppWallet({
                  auth: {
                    options: ["google", "apple", "email", "phone"]
                  },
                  executionMode: {
                    mode: "EIP4337",
                    smartAccount: {
                      chain: base,
                      sponsorGas: true,
                    },
                  },
                })
              ]}
              theme={darkTheme({
                colors: {
                  accentText: "hsl(354, 76%, 41%)",
                  accentButtonBg: "hsl(354, 76%, 41%)",
                  primaryButtonBg: "hsl(354, 76%, 41%)",
                  primaryButtonText: "hsl(0, 0%, 100%)",
                },
              })}
              connectModal={{
                size: "compact",
                showThirdwebBranding: false,
              }}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <div className="text-xs text-gray-500 mb-1 tracking-wider">DISPLAY NAME</div>
              <p className="text-sm text-gray-200 font-bold">{profile.displayName || "Not Provided"}</p>
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-1 tracking-wider">EMAIL ADDRESS</div>
              <p className="text-sm text-gray-300">{profile.email || "Not Provided"}</p>
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-1 tracking-wider">ACCOUNT ROLE</div>
              <p className="text-sm text-gray-300 uppercase tracking-widest">{profile.role}</p>
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-1 tracking-wider">ACCOUNT ROLE</div>
              <p className="text-sm text-gray-300 uppercase tracking-widest">{profile.role}</p>
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-1 tracking-wider">WALLET ADDRESS (ID)</div>
              <p className="text-[10px] text-gray-400 font-mono break-all">{profile.id}</p>
            </div>
          </div>
        </div>

        {/* URL Input Section */}
        <div className="glass-panel p-6 border-white/10 mb-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-red-900/10 to-transparent pointer-events-none" />
          <h3 className="text-sm font-bold text-gray-300 tracking-wider mb-4 flex items-center gap-2">
            <Search size={16} className="text-red-400" /> COMPANY RESEARCH
          </h3>
          <p className="text-sm text-gray-400 mb-4">
            Enter your company name and URL. The agentic scraper will navigate the site to extract your brand assets, tone of voice, and key offerings to fine-tune document generation.
          </p>
          <div className="flex flex-col gap-4">
            <input
              type="text"
              value={companyNameInput}
              onChange={(e) => setCompanyNameInput(e.target.value)}
              placeholder="Company Name (e.g. BasaltHQ)"
              className="w-full bg-black/40 border border-white/10 rounded px-4 py-2 text-white focus:outline-none focus:border-red-500/50"
            />
            <div className="flex gap-4">
              <input
                type="text"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="https://example.com"
                className="flex-1 bg-black/40 border border-white/10 rounded px-4 py-2 text-white focus:outline-none focus:border-red-500/50"
              />
              <button
                onClick={handleAnalyze}
                disabled={isAnalyzing || !urlInput}
                className="glass-button px-6 py-2 bg-red-900/20 text-red-400 hover:bg-red-900/40 hover:text-white transition-all disabled:opacity-50 flex items-center gap-2"
              >
                {isAnalyzing ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
                ANALYZE BRAND
              </button>
            </div>
          </div>
        </div>

        {/* Current Identity View */}
        {(profile.brandAssets || profile.brandParameters) && !showModal && (
          <div className="grid grid-cols-2 gap-8 mb-8">
            <div className="glass-panel p-6 border-white/10">
              <h3 className="text-sm font-bold text-gray-300 tracking-wider mb-4 flex items-center gap-2">
                <Palette size={16} className="text-blue-400" /> BRAND ASSETS
              </h3>
              {profile.brandAssets?.logos?.length > 0 && (
                <div className="mb-4">
                  <div className="text-xs text-gray-500 mb-2 tracking-wider">PRIMARY LOGO</div>
                  <img src={profile.brandAssets.logos[0]} alt="Logo" className="h-12 object-contain bg-white/5 p-2 rounded" />
                </div>
              )}
              {profile.brandAssets?.colors && (
                <div>
                  <div className="text-xs text-gray-500 mb-2 tracking-wider">COLOR PALETTE</div>
                  <div className="flex gap-2">
                    <div className="w-8 h-8 rounded border border-white/20" style={{ backgroundColor: profile.brandAssets.colors.primary }} title={profile.brandAssets.colors.primary} />
                    <div className="w-8 h-8 rounded border border-white/20" style={{ backgroundColor: profile.brandAssets.colors.secondary }} title={profile.brandAssets.colors.secondary} />
                  </div>
                </div>
              )}
            </div>

            <div className="glass-panel p-6 border-white/10">
              <h3 className="text-sm font-bold text-gray-300 tracking-wider mb-4 flex items-center gap-2">
                <MessageSquare size={16} className="text-green-400" /> BRAND PARAMETERS
              </h3>
              <div className="mb-4">
                <div className="text-xs text-gray-500 mb-1 tracking-wider">TONE OF VOICE</div>
                <p className="text-sm text-gray-300">{profile.brandParameters?.tone}</p>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-1 tracking-wider">KEY OFFERINGS</div>
                <div className="flex flex-wrap gap-2">
                  {profile.brandParameters?.offerings?.map((o: string, i: number) => (
                    <span key={i} className="px-2 py-1 bg-white/5 border border-white/10 rounded text-xs text-gray-400">{o}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Document Identification Engine Section */}
        <div className="glass-panel p-6 border-white/10 mb-8">
          <h3 className="text-sm font-bold text-gray-300 tracking-wider mb-4 flex items-center gap-2">
            <Briefcase size={16} className="text-amber-400" /> DOCUMENT IDENTIFICATION ENGINE
          </h3>
          <p className="text-sm text-gray-400 mb-6">
            Configure how the swarm assigns unique tracking numbers to generated documents. The system will automatically iterate the counter.
          </p>
          
          <div className="grid grid-cols-2 gap-8">
            <div>
              <label className="text-xs text-gray-500 block mb-2 tracking-wider">ID TEMPLATE FORMAT</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={docIdTemplate}
                  onChange={(e) => setDocIdTemplate(e.target.value)}
                  placeholder="VARUNA-[YYYY]-[####]"
                  className="flex-1 bg-black/40 border border-white/10 rounded px-4 py-2 text-white focus:outline-none focus:border-red-500/50 font-mono text-sm"
                />
                <button
                  onClick={() => saveSettings({ docIdTemplate })}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded border border-white/20 transition-colors text-sm"
                >
                  Save Format
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2">Available tokens: [YYYY], [####], [##], [#]</p>
            </div>
            
            <div className="bg-black/50 border border-white/10 rounded p-4 flex flex-col justify-center relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <FileText size={64} />
              </div>
              <div className="text-xs text-gray-500 tracking-wider mb-1">NEXT DOCUMENT ID PREVIEW</div>
              <div className="text-xl font-mono text-amber-400 tracking-wider">
                {docIdTemplate
                  .replace('[YYYY]', new Date().getFullYear().toString())
                  .replace('[####]', (docIdCounter + 1).toString().padStart(4, '0'))
                  .replace('[##]', (docIdCounter + 1).toString().padStart(2, '0'))
                  .replace('[#]', (docIdCounter + 1).toString())}
              </div>
              <div className="text-xs text-gray-600 mt-2">Current Counter: {docIdCounter}</div>
            </div>
          </div>
        </div>

        {/* Templates Section */}
        <div className="glass-panel p-6 border-white/10 mb-8">
          <h3 className="text-sm font-bold text-gray-300 tracking-wider mb-4 flex items-center gap-2">
            <FileText size={16} className="text-purple-400" /> ABSTRACT PRESENTATION LAYOUTS
          </h3>
          <p className="text-sm text-gray-400 mb-4">
            Select an abstract structural layout. Your swarm agents will use this to automatically structure whatever document they draft.
          </p>

          {/* Template Selection Grid */}
          <div className="grid grid-cols-3 lg:grid-cols-5 gap-3 mb-4">
            {Object.entries(FORTUNE_50_TEMPLATES).map(([key, template]) => (
              <div 
                key={key} 
                className={`p-3 border rounded cursor-pointer transition-all flex flex-col justify-between ${selectedTemplateKey === key ? 'bg-red-900/20 border-red-500/50 shadow-lg shadow-red-900/20' : 'bg-black/20 border-white/10 hover:border-white/30'}`}
              >
                <div>
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="text-white font-semibold text-xs leading-tight">{template.name}</h4>
                    {selectedTemplateKey === key && <CheckCircle size={12} className="text-red-400 flex-shrink-0 ml-1" />}
                  </div>
                  <p className="text-[10px] text-gray-500 mb-3 line-clamp-2">{template.description}</p>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={(e) => { e.stopPropagation(); previewTemplate(key); }}
                    className="px-2 py-1 bg-white/5 hover:bg-white/10 text-[10px] text-gray-300 rounded border border-white/10 transition-colors"
                  >
                    Preview
                  </button>
                  <button 
                    onClick={() => {
                      setSelectedTemplateKey(key);
                      saveSettings({ baseTemplate: key });
                    }}
                    className="px-2 py-1 bg-white/10 hover:bg-white/20 text-[10px] text-white rounded border border-white/20 transition-colors"
                  >
                    {selectedTemplateKey === key ? '✓ Active' : 'Set Default'}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom Row: Large PDF Preview */}
          <div className={`border rounded overflow-hidden flex flex-col transition-all duration-500 ${previewPdfUrl ? 'border-red-900/50 shadow-[0_0_30px_rgba(127,0,0,0.15)]' : 'border-white/10'}`} style={{ height: '80vh', background: 'rgba(5,0,0,0.6)' }}>
            <div className="p-3 border-b border-red-900/30 flex items-center justify-between flex-shrink-0" style={{ background: 'linear-gradient(90deg, rgba(127,0,0,0.15) 0%, rgba(10,10,10,0.8) 50%, rgba(127,0,0,0.1) 100%)' }}>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${previewPdfUrl ? 'bg-red-500 shadow-[0_0_6px_rgba(204,0,0,0.8)]' : 'bg-gray-700'}`} />
                <span className="text-xs font-mono text-gray-400 tracking-wider">PDF PREVIEW</span>
                {isPreviewing && <span className="text-[10px] text-red-400/70 animate-pulse ml-2">COMPILING...</span>}
              </div>
              <div className="flex items-center gap-3">
                {isPreviewing && <Loader2 size={14} className="animate-spin text-red-400" />}
                {previewPdfUrl && (
                  <button onClick={() => setIsFullscreenPreview(true)} className="text-gray-500 hover:text-red-400 transition-colors" title="Fullscreen Preview">
                    <Maximize2 size={14} />
                  </button>
                )}
              </div>
            </div>
            <div className="flex-1 relative">
              {previewPdfUrl ? (
                <iframe src={`${previewPdfUrl}#view=FitPage&pagemode=none`} className="w-full h-full border-none" />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                  <FileText size={48} className="text-red-900/30" />
                  <p className="text-sm text-gray-600">Click <span className="text-gray-400 font-semibold">Preview</span> on any template above to compile</p>
                  <p className="text-[10px] text-gray-700 tracking-wider">POWERED BY YTOTECH LATEX ENGINE</p>
                </div>
              )}
            </div>
          </div>
        </div>
        </>
        )}

        {activeTab === "playbook" && (
          <div className="space-y-8 relative">
            {profile.tier === 'starter' || profile.tier === 'free' ? (
              <div className="absolute inset-0 z-50 flex items-center justify-center backdrop-blur-md bg-black/40 rounded-xl border border-white/10">
                <div className="text-center p-8 bg-[#050505] border border-[#b71928]/30 shadow-[0_0_40px_rgba(183,25,40,0.2)] rounded-2xl max-w-md">
                  <div className="w-16 h-16 bg-[#b71928]/20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Target size={32} className="text-[#b71928]" />
                  </div>
                  <h3 className="text-xl font-bold font-vox text-white mb-3">Pro Tier Required</h3>
                  <p className="text-sm text-gray-400 mb-8">
                    Custom Firm Playbooks allow you to inject proprietary risk tolerances, fallback clauses, and negotiation rules directly into the AI Swarm. Upgrade to unlock this feature.
                  </p>
                  <button onClick={() => setActiveTab("billing")} className="glass-button w-full px-6 py-3 bg-[#b71928] text-white hover:bg-red-600 transition-colors font-bold tracking-widest text-sm shadow-[0_0_20px_rgba(183,25,40,0.3)]">
                    UPGRADE TO PRO
                  </button>
                </div>
              </div>
            ) : null}

            <div className={`glass-panel p-6 border-white/10 ${profile.tier === 'starter' || profile.tier === 'free' ? 'opacity-50 pointer-events-none' : ''}`}>
              <div className="flex justify-between items-start mb-6">
                <h3 className="text-sm font-bold text-gray-300 tracking-wider flex items-center gap-2">
                  <Target size={16} className="text-red-400" /> CUSTOM FIRM PLAYBOOK
                </h3>
                <div className="flex gap-3">
                  <label className="glass-button px-4 py-2 bg-white/5 hover:bg-white/10 text-white transition-colors cursor-pointer flex items-center gap-2 text-xs font-mono tracking-wider border border-white/10">
                    {isUploadingPlaybook ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                    UPLOAD REFERENCE DOC
                    <input type="file" accept=".pdf,.docx,.txt" className="hidden" onChange={handlePlaybookUpload} disabled={isUploadingPlaybook} />
                  </label>
                  <button 
                    onClick={() => saveSettings({ brandParameters: { ...profile.brandParameters, customPlaybook: playbookText } })}
                    disabled={isSaving}
                    className="glass-button px-4 py-2 bg-[#b71928] hover:bg-red-600 text-white transition-colors flex items-center gap-2 text-xs font-mono tracking-wider"
                  >
                    {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                    SAVE PLAYBOOK
                  </button>
                </div>
              </div>
              <p className="text-sm text-gray-400 mb-6">
                Define the rules of engagement for your autonomous agents. Paste your firm's standard fallback clauses, negotiation deal-breakers, and risk tolerance matrices here. The AI swarm will strict-enforce these parameters during document redlining and analysis.
              </p>
              
              <div className="relative">
                <div className="absolute top-0 right-0 px-4 py-2 flex gap-2 border-b border-l border-white/10 bg-[#050505] rounded-bl-lg opacity-50 z-10 pointer-events-none">
                  <span className="text-[9px] font-mono tracking-widest text-gray-500">SYSTEM PROMPT INJECTION</span>
                </div>
                <textarea
                  value={playbookText}
                  onChange={(e) => setPlaybookText(e.target.value)}
                  placeholder="e.g. 1. Mutual Indemnification is required for all vendors.&#10;2. Limitation of Liability must be capped at 12 months fees.&#10;3. Do not accept aggregate liability caps under $1M without VP approval."
                  className="w-full h-96 bg-[#050505] border border-white/10 rounded-lg p-6 text-sm text-gray-300 font-mono focus:outline-none focus:border-red-500/50 resize-y shadow-inner relative z-0"
                  style={{ lineHeight: '1.6' }}
                />
              </div>
              
              <div className="mt-6 p-4 bg-red-900/10 border border-red-900/30 rounded-lg flex items-start gap-3">
                <Globe size={18} className="text-red-400 mt-0.5 shrink-0" />
                <p className="text-xs text-gray-400 leading-relaxed">
                  <strong className="text-white font-mono">Zero-Retention Notice:</strong> Your custom playbook data is encrypted at rest and dynamically injected into the agentic swarm's context window purely at runtime. None of this data is used to train foundational LLMs or shared across tenants.
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === "billing" && (
          <div className="space-y-8">
            <div className="glass-panel p-6 border-white/10">
              <h3 className="text-sm font-bold text-gray-300 tracking-wider mb-6 flex items-center gap-2">
                <CreditCard size={16} className="text-[#b71928]" /> SUBSCRIPTION & BILLING
              </h3>
              
              <div className="grid md:grid-cols-2 gap-8 mb-8">
                <div className="p-6 bg-black/40 rounded-xl border border-white/5">
                  <div className="text-xs font-mono text-gray-500 tracking-widest mb-2">CURRENT PLAN</div>
                  <div className="text-4xl font-bold font-vox text-white mb-2 uppercase">{profile.role === 'admin' ? "ADMIN" : profile.tier || "STARTER"}</div>
                  <p className="text-sm text-gray-400 mb-6">You are currently on the {profile.role === 'admin' ? "Admin (Uncapped)" : profile.tier || "Starter"} tier.</p>
                  
                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-400">Monthly Token Limit</span>
                      <span className="text-white font-mono">{profile.role === 'admin' ? "Uncapped" : profile.tier === "enterprise" ? "50M" : (profile.tier === "firm" ? "10M" : (profile.tier === "pro" ? "2M" : "100K"))}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-400">Max Context Window</span>
                      <span className="text-white font-mono">{profile.role === 'admin' ? "Uncapped" : profile.tier === "enterprise" ? "256K" : (profile.tier === "firm" ? "128K" : (profile.tier === "pro" ? "64K" : "32K"))}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-400">Concurrent Agents</span>
                      <span className="text-white font-mono">{profile.role === 'admin' ? "Unlimited" : profile.tier === "enterprise" ? "Unlimited" : (profile.tier === "firm" ? "25" : (profile.tier === "pro" ? "5" : "1"))}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-400">Token Topup</span>
                      <span className="text-white font-mono">{profile.role === 'admin' ? "N/A" : "1M tokens / $9.99"}</span>
                    </div>
                  </div>

                  <button 
                    disabled={true}
                    className="w-full px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded border border-white/10 transition-colors text-sm font-mono tracking-wider"
                  >
                    MANAGE BILLING PORTAL
                  </button>
                </div>

                  <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-xs font-mono text-gray-500 tracking-widest">AVAILABLE UPGRADES</div>
                      <div className="bg-white/5 p-0.5 rounded-full border border-white/10 flex">
                        <button
                          onClick={() => setIsAnnual(false)}
                          className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-wider transition-colors ${!isAnnual ? 'bg-white text-black' : 'text-gray-400 hover:text-white'}`}
                        >
                          MONTHLY
                        </button>
                        <button
                          onClick={() => setIsAnnual(true)}
                          className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-wider transition-colors flex items-center gap-1 ${isAnnual ? 'bg-white text-black' : 'text-gray-400 hover:text-white'}`}
                        >
                          ANNUAL
                          <span className={`text-[8px] px-1 rounded-sm ${isAnnual ? 'bg-black text-[#b71928]' : 'bg-[#b71928] text-white'}`}>-20%</span>
                        </button>
                      </div>
                    </div>
                    
                    {(!profile.tier || profile.tier === "starter") && (
                      <div className="p-4 bg-white/[0.02] rounded-xl border border-[#b71928]/30 flex items-center justify-between">
                        <div>
                          <div className="font-bold text-[#b71928] mb-1 font-vox">PRO TIER</div>
                          <div className="text-xs text-gray-400">{isAnnual ? "$288.00 / year" : "$29.99 / month"}</div>
                        </div>
                        <button 
                          onClick={() => handleCheckout(isAnnual ? process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_ANNUAL as string : process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO as string)}
                          disabled={isCheckoutLoading}
                          className="px-4 py-2 bg-[#b71928] hover:bg-red-600 text-white font-bold rounded text-xs tracking-wider transition-colors disabled:opacity-50 flex items-center gap-2"
                        >
                          {isCheckoutLoading && <Loader2 size={12} className="animate-spin" />}
                          UPGRADE
                        </button>
                      </div>
                    )}

                    {(!profile.tier || profile.tier === "starter" || profile.tier === "pro") && (
                      <div className="p-4 bg-white/[0.02] rounded-xl border border-[#b71928]/30 flex items-center justify-between">
                        <div>
                          <div className="font-bold text-white mb-1 font-vox">FIRM TIER</div>
                          <div className="text-xs text-gray-400">{isAnnual ? "$1,428.00 / year" : "$149.00 / month"}</div>
                        </div>
                        <button 
                          onClick={() => handleCheckout(isAnnual ? process.env.NEXT_PUBLIC_STRIPE_PRICE_FIRM_ANNUAL as string : process.env.NEXT_PUBLIC_STRIPE_PRICE_FIRM as string)}
                          disabled={isCheckoutLoading}
                          className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white font-bold rounded text-xs tracking-wider transition-colors disabled:opacity-50 flex items-center gap-2"
                        >
                          {isCheckoutLoading && <Loader2 size={12} className="animate-spin" />}
                          UPGRADE
                        </button>
                      </div>
                    )}
                    
                    {(!profile.tier || profile.tier !== "enterprise") && (
                      <div className="p-4 bg-white/[0.02] rounded-xl border border-white/10 flex items-center justify-between">
                        <div>
                          <div className="font-bold text-gray-300 mb-1 font-vox">ENTERPRISE TIER</div>
                          <div className="text-xs text-gray-500">{isAnnual ? "$2,868.00 / year" : "$299.00 / month"}</div>
                        </div>
                        <button 
                          onClick={() => handleCheckout(isAnnual ? process.env.NEXT_PUBLIC_STRIPE_PRICE_ENTERPRISE_ANNUAL as string : process.env.NEXT_PUBLIC_STRIPE_PRICE_ENTERPRISE as string)}
                          disabled={isCheckoutLoading}
                          className="px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-400 font-bold rounded text-xs tracking-wider transition-colors disabled:opacity-50 flex items-center gap-2"
                        >
                          {isCheckoutLoading && <Loader2 size={12} className="animate-spin" />}
                          UPGRADE
                        </button>
                      </div>
                    )}
                  </div>
              </div>
            </div>
            
            {/* Token Topup */}
            <div className="glass-panel p-6 border-white/10">
              <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-gray-300 tracking-wider mb-2 flex items-center gap-2">
                      <CreditCard size={16} className="text-[#b71928]" /> TOKEN TOPUP
                    </h3>
                    <p className="text-sm text-gray-400">Add <span className="text-white font-bold">1,000,000 tokens</span> to your account instantly for <span className="text-white font-bold">$9.99</span>.</p>
                  </div>
                  <button 
                    onClick={async () => {
                      setIsCheckoutLoading(true);
                      try {
                        const res = await fetch("/api/stripe/topup", { method: "POST" });
                        const data = await res.json();
                        if (data.url) window.location.href = data.url;
                        else alert("Failed: " + data.error);
                      } catch { alert("Topup failed."); }
                      finally { setIsCheckoutLoading(false); }
                    }}
                    disabled={isCheckoutLoading}
                    className="px-6 py-3 bg-[#b71928] hover:bg-red-600 text-white font-bold rounded-lg text-xs tracking-wider transition-colors disabled:opacity-50 flex items-center gap-2 whitespace-nowrap"
                  >
                    {isCheckoutLoading && <Loader2 size={12} className="animate-spin" />}
                    BUY TOKENS
                  </button>
              </div>
            </div>

            <div className="glass-panel p-6 border-white/10">
              <h3 className="text-sm font-bold text-gray-300 tracking-wider mb-6">BILLING HISTORY</h3>
              <div className="text-center py-12 text-sm text-gray-500 font-mono">
                No recent transactions found for this account.
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Curation Modal */}
      {showModal && extractedProfile && (
        <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-8">
          <div className="glass-panel w-full max-w-4xl max-h-[90vh] flex flex-col border border-white/20 shadow-2xl">
            <div className="p-6 border-b border-white/10 flex justify-between items-center">
              <h2 className="text-xl font-vox tracking-wider text-white">CURATE BRAND IDENTITY</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-white"><X size={24} /></button>
            </div>
            
            <div className="p-6 flex-1 overflow-y-auto space-y-8">
              {/* Logos */}
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm tracking-wider text-gray-400 flex items-center gap-2"><ImageIcon size={16}/> BRAND LOGO</h3>
                  <label className="cursor-pointer px-3 py-1 bg-white/10 hover:bg-white/20 text-xs text-white rounded border border-white/20 transition-colors flex items-center gap-2">
                    {isUploading ? <Loader2 size={12} className="animate-spin" /> : <Upload size={12} />}
                    Upload Logo
                    <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} disabled={isUploading} />
                  </label>
                </div>
                <div className="flex flex-wrap gap-4">
                  {extractedProfile.logos?.length > 0 ? (
                    <div className="p-4 border border-white/10 rounded bg-white/5 relative group cursor-pointer hover:border-red-500/50 transition-colors">
                      <img src={extractedProfile.logos[0]} className="h-16 object-contain" />
                      <button onClick={() => setExtractedProfile({...extractedProfile, logos: []})} className="absolute top-2 right-2 p-1 bg-red-900/80 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity">
                        <X size={16} />
                      </button>
                    </div>
                  ) : <p className="text-sm text-gray-500">No logo uploaded. Please upload a logo.</p>}
                </div>
              </section>

              {/* Cover Photo */}
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm tracking-wider text-gray-400 flex items-center gap-2"><ImageIcon size={16}/> COVER PHOTO</h3>
                  <label className="cursor-pointer px-3 py-1 bg-white/10 hover:bg-white/20 text-xs text-white rounded border border-white/20 transition-colors flex items-center gap-2">
                    {isUploadingCover ? <Loader2 size={12} className="animate-spin" /> : <Upload size={12} />}
                    Upload Cover
                    <input type="file" accept="image/*" className="hidden" onChange={handleCoverUpload} disabled={isUploadingCover} />
                  </label>
                </div>
                {extractedProfile.coverImage ? (
                  <div className="relative group rounded overflow-hidden border border-white/10">
                    <img src={extractedProfile.coverImage} className="w-full h-32 object-cover" />
                    <button onClick={() => setExtractedProfile({...extractedProfile, coverImage: null})} className="absolute top-2 right-2 p-1 bg-red-900/80 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity">
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No cover photo uploaded.</p>
                )}
              </section>

              {/* Colors & Fonts */}
              <section className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm tracking-wider text-gray-400 mb-4 flex items-center gap-2"><Palette size={16}/> COLOR PALETTE</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs text-gray-500 block mb-1">Primary Color</label>
                      <div className="flex items-center gap-3">
                        <input type="color" value={extractedProfile.colors?.primary || "#000000"} 
                          onChange={(e) => setExtractedProfile({...extractedProfile, colors: {...extractedProfile.colors, primary: e.target.value}})}
                          className="bg-transparent border-none cursor-pointer w-8 h-8 rounded-full overflow-hidden" />
                        <input type="text" value={extractedProfile.colors?.primary || ""} 
                          onChange={(e) => setExtractedProfile({...extractedProfile, colors: {...extractedProfile.colors, primary: e.target.value}})}
                          className="bg-black/40 border border-white/10 rounded px-3 py-1 text-sm text-white w-24" />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 block mb-1">Secondary Color</label>
                      <div className="flex items-center gap-3">
                        <input type="color" value={extractedProfile.colors?.secondary || "#ffffff"} 
                          onChange={(e) => setExtractedProfile({...extractedProfile, colors: {...extractedProfile.colors, secondary: e.target.value}})}
                          className="bg-transparent border-none cursor-pointer w-8 h-8 rounded-full overflow-hidden" />
                        <input type="text" value={extractedProfile.colors?.secondary || ""} 
                          onChange={(e) => setExtractedProfile({...extractedProfile, colors: {...extractedProfile.colors, secondary: e.target.value}})}
                          className="bg-black/40 border border-white/10 rounded px-3 py-1 text-sm text-white w-24" />
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm tracking-wider text-gray-400 mb-4 flex items-center gap-2"><Type size={16}/> TYPOGRAPHY</h3>
                  <textarea 
                    value={extractedProfile.typography?.join(", ") || ""}
                    onChange={(e) => setExtractedProfile({...extractedProfile, typography: e.target.value.split(",").map(s => s.trim())})}
                    className="w-full bg-black/40 border border-white/10 rounded p-3 text-sm text-white focus:outline-none focus:border-red-500/50"
                    rows={3}
                  />
                </div>
              </section>

              {/* Voice & Mission */}
              <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm tracking-wider text-gray-400 mb-4 flex items-center gap-2"><MessageSquare size={16}/> TONE OF VOICE</h3>
                  <textarea 
                    value={extractedProfile.tone || ""}
                    onChange={(e) => setExtractedProfile({...extractedProfile, tone: e.target.value})}
                    className="w-full h-24 bg-black/40 border border-white/10 rounded p-3 text-sm text-white focus:outline-none focus:border-red-500/50"
                  />
                </div>
                <div>
                  <h3 className="text-sm tracking-wider text-gray-400 mb-4 flex items-center gap-2"><Target size={16}/> MISSION STATEMENT</h3>
                  <textarea 
                    value={extractedProfile.mission || ""}
                    onChange={(e) => setExtractedProfile({...extractedProfile, mission: e.target.value})}
                    className="w-full h-24 bg-black/40 border border-white/10 rounded p-3 text-sm text-white focus:outline-none focus:border-red-500/50"
                  />
                </div>
              </section>

              {/* Offerings & Audience */}
              <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm tracking-wider text-gray-400 mb-4 flex items-center gap-2"><Briefcase size={16}/> KEY OFFERINGS</h3>
                  <textarea 
                    value={extractedProfile.offerings?.join("\n") || ""}
                    onChange={(e) => setExtractedProfile({...extractedProfile, offerings: e.target.value.split("\n")})}
                    className="w-full h-24 bg-black/40 border border-white/10 rounded p-3 text-sm text-white focus:outline-none focus:border-red-500/50"
                    placeholder="One offering per line..."
                  />
                </div>
                <div>
                  <h3 className="text-sm tracking-wider text-gray-400 mb-4 flex items-center gap-2"><Globe size={16}/> TARGET AUDIENCE</h3>
                  <textarea 
                    value={extractedProfile.audience || ""}
                    onChange={(e) => setExtractedProfile({...extractedProfile, audience: e.target.value})}
                    className="w-full h-24 bg-black/40 border border-white/10 rounded p-3 text-sm text-white focus:outline-none focus:border-red-500/50"
                  />
                </div>
              </section>
            </div>
            
            <div className="p-6 border-t border-white/10 bg-black/40 flex justify-end gap-4">
              <button onClick={() => setShowModal(false)} className="px-6 py-2 rounded text-gray-400 hover:text-white transition-colors">Cancel</button>
              <button 
                onClick={() => {
                  saveSettings({
                    companyUrl: urlInput || null,
                    companyName: companyNameInput || null,
                    brandAssets: { 
                      logos: extractedProfile.logos || [], 
                      coverImage: extractedProfile.coverImage || null,
                      colors: extractedProfile.colors || { primary: "#000000", secondary: "#ffffff" }, 
                      typography: extractedProfile.typography || [] 
                    },
                    brandParameters: { 
                      tone: extractedProfile.tone || "", 
                      offerings: extractedProfile.offerings || [], 
                      mission: extractedProfile.mission || "", 
                      audience: extractedProfile.audience || "" 
                    }
                  });
                }}
                disabled={isSaving}
                className="px-6 py-2 bg-red-900/40 text-red-300 hover:bg-red-800/60 hover:text-white rounded transition-all border border-red-700/50 flex items-center gap-2"
              >
                {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                SAVE BRAND IDENTITY
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Fullscreen Preview Modal */}
      {isFullscreenPreview && previewPdfUrl && (
        <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex flex-col p-4 md:p-8">
          <div className="flex justify-end mb-4">
            <button onClick={() => setIsFullscreenPreview(false)} className="text-gray-400 hover:text-white transition-colors bg-black/50 p-2 rounded-full border border-white/10 hover:border-white/30">
              <X size={24} />
            </button>
          </div>
          <div className="flex-1 w-full h-full bg-black rounded-lg border border-white/10 overflow-hidden shadow-2xl">
            <iframe src={`${previewPdfUrl}#view=FitH`} className="w-full h-full border-none" />
          </div>
        </div>
      )}
    </div>
  );
}


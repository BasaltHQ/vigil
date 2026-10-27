"use client";

import React, { useState, useRef } from "react";
import {
  FileCheck2,
  ShieldAlert,
  PieChart,
  Gavel,
  Landmark,
  Receipt,
  X,
  Plus,
  Trash2,
  Sparkles,
  Download,
  FileText,
  Upload,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  Play,
  Sliders,
  Eye,
  Loader2,
} from "lucide-react";

export type LaunchpadModuleId =
  | "redline"
  | "diligence"
  | "captable"
  | "litigation"
  | "securities"
  | "billing";

interface LaunchpadWorkbenchModalProps {
  isOpen: boolean;
  initialModule: LaunchpadModuleId;
  onClose: () => void;
  onDispatchToSwarm: (prompt: string, files?: File[]) => void;
  onOpenArtifact?: (path: string, title: string) => void;
}

export default function LaunchpadWorkbenchModal({
  isOpen,
  initialModule,
  onClose,
  onDispatchToSwarm,
  onOpenArtifact,
}: LaunchpadWorkbenchModalProps) {
  const [activeModule, setActiveModule] =
    useState<LaunchpadModuleId>(initialModule);
  const [isExecutingTool, setIsExecutingTool] = useState(false);
  const [liveResult, setLiveResult] = useState<any>(null);
  const [swarmNotes, setSwarmNotes] = useState<string>("");
  const fileUploadRef = useRef<HTMLInputElement>(null);
  const [isParsingFile, setIsParsingFile] = useState(false);

  // Sync when modal opens with a specific module
  React.useEffect(() => {
    if (isOpen) {
      setActiveModule(initialModule);
      setLiveResult(null);
    }
  }, [isOpen, initialModule]);

  // =========================================================================
  // 1. REDLINE STUDIO STATE
  // =========================================================================
  const [redlineDocTitle, setRedlineDocTitle] = useState(
    "Master Services & Acquisition Agreement"
  );
  const [redlineCounterparty, setRedlineCounterparty] = useState(
    "Apex Enterprise Corp."
  );
  const [redlinePosture, setRedlinePosture] = useState<
    "Pro-Buyer / Customer" | "Pro-Seller / Vendor" | "Balanced / Market"
  >("Pro-Buyer / Customer");
  const [redlineLiabilityCap, setRedlineLiabilityCap] = useState(
    "24 Months Fees (Uncapped IP, Confidentiality & Gross Negligence)"
  );
  const [redlineSurvival, setRedlineSurvival] = useState("24 Months");
  const [redlineClauses, setRedlineClauses] = useState([
    {
      heading: "Section 8.1 — Indemnification & Hold Harmless",
      original_text:
        "Provider may, at its sole option, indemnify Customer solely for finally adjudicated direct copyright infringement claims arising in the United States, provided Customer notifies Provider within 5 days.",
      revised_text:
        "Provider shall defend, indemnify, and hold harmless Customer and its Affiliates from and against any and all third-party claims, damages, liabilities, and reasonable attorneys' fees arising out of any alleged IP infringement, breach of confidentiality, or gross negligence, subject to prompt written notice.",
      rationale:
        "Converted discretionary unilateral indemnity to mandatory full-scope IP, data breach, and gross negligence indemnity per Firm Playbook Rule 1.",
      risk_severity: "CRITICAL",
      fallback_tier: "PRIMARY",
    },
    {
      heading: "Section 9.2 — Limitation of Liability",
      original_text:
        "In no event shall Provider's aggregate cumulative liability exceed the fees paid by Customer in the one (1) month preceding the claim. Provider shall have no liability for data loss.",
      revised_text:
        "Except for Excluded Claims (indemnification obligations, confidentiality breaches, and willful misconduct), each Party's aggregate liability shall not exceed twenty-four (24) months of fees paid or payable.",
      rationale:
        "Raised artificial 1-month fee cap to mutual 24-month super-cap with carve-outs for Excluded Claims.",
      risk_severity: "HIGH",
      fallback_tier: "PRIMARY",
    },
  ]);

  // =========================================================================
  // 2. DILIGENCE & PLAYBOOK STUDIO STATE
  // =========================================================================
  const [diligenceTarget, setDiligenceTarget] = useState("NovaCloud AI, Inc.");
  const [diligenceAcquirer, setDiligenceAcquirer] = useState(
    "Basalt Holdings LLC"
  );
  const [diligenceDealValue, setDiligenceDealValue] = useState("$125,000,000");
  const [diligencePlaybookPreset, setDiligencePlaybookPreset] = useState(
    "AmLaw 10 Pro-Acquirer M&A Standard"
  );
  const [diligenceFindings, setDiligenceFindings] = useState([
    {
      category: "Change of Control & Material Contracts",
      title: "Customer Revenue Concentration & Termination Triggers",
      severity: "CRITICAL",
      description:
        "3 of the top 5 enterprise customer MSAs (representing 42% of ARR) contain immediate termination-for-convenience upon a Change of Control without prior written consent.",
      financial_exposure: "$18,500,000 ARR at risk",
      remediation_plan:
        "Make third-party consents from the top 3 customers an explicit Condition Precedent to Closing under Section 7.2(d).",
    },
    {
      category: "Intellectual Property & Open Source",
      title: "AGPLv3 Copyleft Contamination in Core Inference Engine",
      severity: "HIGH",
      description:
        "Target's proprietary inference router statically links a modified AGPLv3 library without commercial dual-licensing.",
      financial_exposure: "$4,200,000 remediation + IP escrow",
      remediation_plan:
        "Require clean-room re-engineering prior to Closing plus a $5M Special IP Indemnity Holdback for 24 months.",
    },
  ]);

  // =========================================================================
  // 3. CAP TABLE & WATERFALL STUDIO STATE
  // =========================================================================
  const [capCompanyName, setCapCompanyName] = useState("Vigil Technologies, Inc.");
  const [capRoundName, setCapRoundName] = useState("Series A Financing");
  const [capPreMoney, setCapPreMoney] = useState(25000000);
  const [capNewInvestment, setCapNewInvestment] = useState(7500000);
  const [capOptionPoolPct, setCapOptionPoolPct] = useState(10);
  const [capExitValuations, setCapExitValuations] = useState("20000000, 60000000, 150000000");
  const [capShareholders, setCapShareholders] = useState([
    { holder_name: "Founders (Common)", share_class: "Common", shares: 7500000, is_option_pool: false },
    { holder_name: "Seed Investors", share_class: "Series Seed", shares: 1800000, is_option_pool: false },
    { holder_name: "Existing ESOP Pool", share_class: "Options", shares: 700000, is_option_pool: true },
  ]);
  const [capSafes, setCapSafes] = useState([
    {
      investor_name: "Horizon Ventures SAFE",
      instrument_type: "POST_MONEY_SAFE",
      principal_amount: 2000000,
      valuation_cap: 15000000,
      discount_percent: 20,
    },
  ]);

  // =========================================================================
  // 4. LITIGATION BLUEBOOK & FRCP STUDIO STATE
  // =========================================================================
  const [litSubTab, setLitSubTab] = useState<"bluebook" | "deadlines" | "privilege">("bluebook");
  const [bluebookStyle, setBluebookStyle] = useState<"court_brief" | "law_review">("court_brief");
  const [bluebookInput, setBluebookInput] = useState(
    "1. Pennoyer v Neff 95 US 714 (1878)\n2. Ashcroft v. Iqbal, 556 U.S. 662, 678 (2009)\n3. Celotex Corp v Catrett, 477 U.S. 317 (1986)\n4. 42 U.S.C. section 1983\n5. Rule 12(b)(6) of the Federal Rules of Civil Procedure"
  );
  const [frcpMatterName, setFrcpMatterName] = useState("Apex Corp. v. NovaCloud Inc.");
  const [frcpTriggerType, setFrcpTriggerType] = useState("COMPLAINT_SERVED");
  const [frcpTriggerDate, setFrcpTriggerDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [frcpServiceMethod, setFrcpServiceMethod] = useState("ELECTRONIC");
  const [frcpJurisdiction, setFrcpJurisdiction] = useState("FEDERAL_FRCP");

  // =========================================================================
  // 5. SEC FORM D & FINCEN CTA STUDIO STATE
  // =========================================================================
  const [secIssuerName, setSecIssuerName] = useState("Vigil Quantum Labs, Inc.");
  const [secExemption, setSecExemption] = useState("RULE_506C");
  const [secOfferingAmount, setSecOfferingAmount] = useState(12000000);
  const [secFirstSaleDate, setSecFirstSaleDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [secStates, setSecStates] = useState([
    { state_code: "NY", investor_count: 6, amount_sold: 4500000, all_accredited: true },
    { state_code: "CA", investor_count: 8, amount_sold: 5000000, all_accredited: true },
    { state_code: "TX", investor_count: 3, amount_sold: 1500000, all_accredited: true },
    { state_code: "FL", investor_count: 2, amount_sold: 1000000, all_accredited: true },
  ]);

  // =========================================================================
  // 6. LEDES 1998B BILLING & E-SIGN STUDIO STATE
  // =========================================================================
  const [billClientName, setBillClientName] = useState("Apex Enterprise Corp.");
  const [billMatterName, setBillMatterName] = useState("Series A & Strategic IP Acquisition");
  const [billMatterNumber, setBillMatterNumber] = useState("MAT-2026-0842");
  const [billInvoiceNumber, setBillInvoiceNumber] = useState("INV-2026-1094");
  const [billFeeType, setBillFeeType] = useState<"HOURLY" | "CAPPED_FEE" | "FIXED_FEE">("HOURLY");
  const [billEntries, setBillEntries] = useState([
    {
      date: new Date().toISOString().split("T")[0],
      timekeeper_name: "Keyes (Senior Partner)",
      timekeeper_role: "PARTNER",
      utbms_task_code: "L120",
      utbms_activity_code: "A101",
      hours: 6.5,
      hourly_rate: 1150,
      narrative: "Lead deal strategy, negotiation posture review, and closing risk allocation.",
    },
    {
      date: new Date().toISOString().split("T")[0],
      timekeeper_name: "O'Hara (Redline Counsel)",
      timekeeper_role: "SENIOR_COUNSEL",
      utbms_task_code: "L140",
      utbms_activity_code: "A103",
      hours: 9.0,
      hourly_rate: 895,
      narrative: "Drafted full redline comparison and fallback clauses for MSA & IP schedule.",
    },
    {
      date: new Date().toISOString().split("T")[0],
      timekeeper_name: "Cairo (Venture Specialist)",
      timekeeper_role: "ASSOCIATE",
      utbms_task_code: "L130",
      utbms_activity_code: "A104",
      hours: 4.5,
      hourly_rate: 795,
      narrative: "Modeled SAFE conversion dilution and preferred liquidation waterfall.",
    },
  ]);

  if (!isOpen) return null;

  // Handle uploading a contract into Redline or Diligence Studio
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    setIsParsingFile(true);
    try {
      let extracted = "";
      if (
        file.name.toLowerCase().endsWith(".pdf") ||
        file.name.toLowerCase().endsWith(".docx")
      ) {
        const fd = new FormData();
        fd.append("file", file);
        const res = await fetch("/api/parse", { method: "POST", body: fd });
        if (res.ok) {
          const data = await res.json();
          extracted = data.markdown || "";
        }
      } else {
        extracted = await file.text();
      }

      if (extracted) {
        setRedlineDocTitle(file.name.replace(/\.[^.]+$/, ""));
        setRedlineClauses((prev) => [
          {
            heading: `Uploaded Contract — ${file.name}`,
            original_text: extracted.slice(0, 2500),
            revised_text:
              extracted.slice(0, 2500) +
              "\n\n[COUNSEL RIDER: Notwithstanding anything to the contrary, obligations under this section shall be mutual and subject to the 24-month liability super-cap.]",
            rationale: `Extracted from ${file.name} for partner redlining.`,
            risk_severity: "HIGH",
            fallback_tier: "PRIMARY",
          },
          ...prev,
        ]);
      }
    } catch (err) {
      console.error("Failed to parse uploaded file:", err);
    } finally {
      setIsParsingFile(false);
      e.target.value = "";
    }
  };

  // Run Instant Deterministic Engine via /api/tools
  const runInstantEngine = async () => {
    setIsExecutingTool(true);
    setLiveResult(null);

    try {
      let toolName = "";
      let parameters: Record<string, any> = {};

      if (activeModule === "redline") {
        toolName = "redline_document";
        parameters = {
          title: redlineDocTitle,
          counterparty_name: redlineCounterparty,
          negotiation_summary: `Posture: ${redlinePosture}. Target Liability Cap: ${redlineLiabilityCap}. Survival: ${redlineSurvival}. ${swarmNotes}`,
          output_formats: "both_pdf_and_docx",
          sections: redlineClauses,
        };
      } else if (activeModule === "diligence") {
        toolName = "generate_diligence_red_flag_report";
        parameters = {
          matter_title: `${diligenceTarget} Acquisition Due Diligence`,
          target_company: diligenceTarget,
          acquirer_company: diligenceAcquirer,
          transaction_value: diligenceDealValue,
          executive_overview: `Comprehensive diligence audit evaluated against ${diligencePlaybookPreset}. ${swarmNotes}`,
          findings: diligenceFindings,
        };
      } else if (activeModule === "captable") {
        toolName = "model_cap_table_and_dilution";
        parameters = {
          company_name: capCompanyName,
          round_name: capRoundName,
          pre_money_valuation: Number(capPreMoney),
          new_money_investment: Number(capNewInvestment),
          target_post_money_option_pool_percent: Number(capOptionPoolPct),
          existing_shareholders: capShareholders,
          converting_instruments: capSafes,
          compile_pdf_report: true,
        };
      } else if (activeModule === "litigation") {
        if (litSubTab === "bluebook") {
          toolName = "verify_and_format_bluebook_citations";
          parameters = {
            citations: bluebookInput
              .split("\n")
              .map((s) => s.replace(/^\d+\.\s*/, "").trim())
              .filter(Boolean),
            style: bluebookStyle,
          };
        } else {
          toolName = "calculate_litigation_deadlines";
          parameters = {
            matter_name: frcpMatterName,
            trigger_event_type: frcpTriggerType,
            trigger_date: frcpTriggerDate,
            service_method: frcpServiceMethod,
            jurisdiction_rules: frcpJurisdiction,
          };
        }
      } else if (activeModule === "securities") {
        toolName = "prepare_sec_form_d_and_blue_sky";
        parameters = {
          issuer_name: secIssuerName,
          entity_type: "Delaware C-Corporation",
          jurisdiction_of_incorporation: "Delaware",
          exemption_claimed: secExemption,
          total_offering_amount: Number(secOfferingAmount),
          total_amount_sold: secStates.reduce((s, r) => s + Number(r.amount_sold), 0),
          first_sale_date: secFirstSaleDate,
          investor_states: secStates,
          compile_pdf_report: true,
        };
      } else if (activeModule === "billing") {
        toolName = "generate_legal_invoice_and_roi";
        parameters = {
          client_name: billClientName,
          matter_name: billMatterName,
          matter_number: billMatterNumber,
          invoice_number: billInvoiceNumber,
          fee_arrangement: billFeeType,
          time_entries: billEntries,
          value_delivered_summary:
            swarmNotes ||
            "Automated multi-agent contract redlining, cap table modeling, and playbook verification.",
          compile_pdf_invoice: true,
        };
      }

      const res = await fetch("/api/tools", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tool_name: toolName, parameters }),
      });
      const data = await res.json();
      setLiveResult(data.result || data);
    } catch (e: any) {
      setLiveResult({ error: e.message || "Execution failed" });
    } finally {
      setIsExecutingTool(false);
    }
  };

  // Build rich structured prompt & dispatch to the AI Swarm in the Console
  const handleCollaborateWithSwarm = () => {
    let prompt = "";

    if (activeModule === "redline") {
      prompt = `### [REDLINE & BLACKLINE WORKBENCH SUBMISSION]
**Document Title**: ${redlineDocTitle}
**Counterparty**: ${redlineCounterparty}
**Negotiation Posture**: ${redlinePosture}
**Target Liability Cap**: ${redlineLiabilityCap}
**Representation Survival Target**: ${redlineSurvival}
${swarmNotes ? `**Partner Shaping Instructions**: ${swarmNotes}\n` : ""}
Please review, refine, and execute \`redline_document\` (with \`output_formats: "both_pdf_and_docx"\`) across the following clauses, improving the proposed revisions to maximize protection under our posture and providing both the compiled Fortune 50 Redline PDF and Word (.docx) Track-Changes links:

${redlineClauses
  .map(
    (c, i) =>
      `#### ${i + 1}. ${c.heading} [${c.risk_severity} / ${c.fallback_tier}]
- **Original Text**: "${c.original_text}"
- **Draft Revision**: "${c.revised_text}"
- **Counsel Rationale**: ${c.rationale}`
  )
  .join("\n\n")}`;
    } else if (activeModule === "diligence") {
      prompt = `### [M&A DUE DILIGENCE & PLAYBOOK AUDIT SUBMISSION]
**Target Company**: ${diligenceTarget}
**Acquirer**: ${diligenceAcquirer}
**Transaction Value**: ${diligenceDealValue}
**Playbook Standard**: ${diligencePlaybookPreset}
${swarmNotes ? `**Partner Shaping Instructions**: ${swarmNotes}\n` : ""}
Please evaluate these diligence findings against our playbook using \`evaluate_against_playbook\` and compile a formal Executive Diligence Red-Flag Report PDF using \`generate_diligence_red_flag_report\`:

${diligenceFindings
  .map(
    (f, i) =>
      `#### ${i + 1}. [${f.severity}] ${f.category} — ${f.title}
- **Finding**: ${f.description}
- **Exposure**: ${f.financial_exposure}
- **Proposed Remediation**: ${f.remediation_plan}`
  )
  .join("\n\n")}`;
    } else if (activeModule === "captable") {
      prompt = `### [CAP TABLE & LIQUIDATION WATERFALL WORKBENCH SUBMISSION]
**Company**: ${capCompanyName} (${capRoundName})
**Pre-Money Valuation**: $${Number(capPreMoney).toLocaleString()}
**New Money Investment**: $${Number(capNewInvestment).toLocaleString()}
**Target Post-Money Option Pool**: ${capOptionPoolPct}%
**Exit Waterfall Valuations**: $${capExitValuations}
${swarmNotes ? `**Partner Shaping Instructions**: ${swarmNotes}\n` : ""}
**Existing Shareholders**:
${capShareholders.map((s) => `- ${s.holder_name} (${s.share_class}): ${s.shares.toLocaleString()} shares`).join("\n")}

**Converting SAFEs / Notes**:
${capSafes.map((s) => `- ${s.investor_name} (${s.instrument_type}): $${s.principal_amount.toLocaleString()} @ $${s.valuation_cap.toLocaleString()} Cap / ${s.discount_percent}% Discount`).join("\n")}

Please execute \`model_cap_table_and_dilution\` and \`model_liquidation_waterfall\` across the exit valuations and provide the full ownership table, dilution analysis, and compiled PDF report.`;
    } else if (activeModule === "litigation") {
      prompt = `### [LITIGATION BLUEBOOK & FRCP CALENDAR SUBMISSION]
**Matter**: ${frcpMatterName} (${frcpJurisdiction})
**Trigger Event**: ${frcpTriggerType} on ${frcpTriggerDate} via ${frcpServiceMethod} service
**Citation Style**: ${bluebookStyle}
${swarmNotes ? `**Partner Shaping Instructions**: ${swarmNotes}\n` : ""}
**Citations to Verify & Format**:
${bluebookInput}

Please execute \`verify_and_format_bluebook_citations\` and \`calculate_litigation_deadlines\` and provide a complete litigation compliance report.`;
    } else if (activeModule === "securities") {
      prompt = `### [SEC FORM D, BLUE SKY & FINCEN CTA WORKBENCH SUBMISSION]
**Issuer**: ${secIssuerName}
**Exemption**: ${secExemption}
**Total Offering**: $${Number(secOfferingAmount).toLocaleString()} (First Sale: ${secFirstSaleDate})
${swarmNotes ? `**Partner Shaping Instructions**: ${swarmNotes}\n` : ""}
**Investor State Allocation**:
${secStates.map((s) => `- ${s.state_code}: ${s.investor_count} investors ($${Number(s.amount_sold).toLocaleString()})`).join("\n")}

Please execute \`prepare_sec_form_d_and_blue_sky\` and \`run_aml_kyc_and_cta_audit\` to generate our Form D filing schedule, state Blue Sky fee table, and FinCEN BOI compliance PDF.`;
    } else if (activeModule === "billing") {
      prompt = `### [LEDES 1998B BILLING & EXECUTION PACKET SUBMISSION]
**Client**: ${billClientName}
**Matter**: ${billMatterName} (${billMatterNumber})
**Invoice**: ${billInvoiceNumber} (${billFeeType})
${swarmNotes ? `**Partner Shaping Instructions**: ${swarmNotes}\n` : ""}
**Time Entries**:
${billEntries.map((e) => `- ${e.date} | ${e.timekeeper_name} (${e.timekeeper_role}) | ${e.utbms_task_code}/${e.utbms_activity_code} | ${e.hours} hrs @ $${e.hourly_rate}/hr: ${e.narrative}`).join("\n")}

Please execute \`generate_legal_invoice_and_roi\` and return the itemized invoice PDF, ROI summary, and LEDES 1998B export block.`;
    }

    onDispatchToSwarm(prompt);
    onClose();
  };

  const MODULE_TABS: Array<{
    id: LaunchpadModuleId;
    label: string;
    short: string;
    accent: string;
    icon: any;
  }> = [
    {
      id: "redline",
      label: "Redline & Blackline Studio",
      short: "Redlining",
      accent: "#ef4444",
      icon: FileCheck2,
    },
    {
      id: "diligence",
      label: "M&A Diligence & Playbook",
      short: "Diligence",
      accent: "#f97316",
      icon: ShieldAlert,
    },
    {
      id: "captable",
      label: "Cap Table & Waterfall",
      short: "Cap Table",
      accent: "#a855f7",
      icon: PieChart,
    },
    {
      id: "litigation",
      label: "Bluebook & FRCP Deadlines",
      short: "Litigation",
      accent: "#3b82f6",
      icon: Gavel,
    },
    {
      id: "securities",
      label: "SEC Form D & FinCEN CTA",
      short: "Securities",
      accent: "#10b981",
      icon: Landmark,
    },
    {
      id: "billing",
      label: "LEDES 1998B & E-Sign",
      short: "Billing & Ops",
      accent: "#eab308",
      icon: Receipt,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-5 animate-fade-in">
      <div className="w-full max-w-7xl h-[92vh] rounded-2xl bg-[#07090e] border border-white/15 shadow-[0_0_60px_rgba(0,0,0,0.9)] flex flex-col overflow-hidden">
        {/* TOP STUDIO HEADER & MODULE SWITCHER */}
        <div className="flex-shrink-0 px-5 py-3.5 border-b border-white/10 bg-[#0b0e16] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-400">
              <Sliders size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-bold text-white tracking-wider uppercase font-vox">
                  AMLAW 10 INTERACTIVE LAUNCHPAD STUDIO
                </h2>
                <span className="px-2 py-0.5 rounded bg-red-500/15 border border-red-500/30 text-[10px] font-mono text-red-300">
                  SWARM CO-PILOT WORKBENCH
                </span>
              </div>
              <p className="text-[11px] text-zinc-400">
                Configure deal parameters, run the deterministic engine for instant PDF/DOCX deliverables, or collaborate with the AI Swarm
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* MODULE NAVIGATION BAR */}
        <div className="flex-shrink-0 px-5 py-2 border-b border-white/[0.07] bg-[#090b11] flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {MODULE_TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeModule === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setActiveModule(tab.id);
                  setLiveResult(null);
                }}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-mono transition-all flex-shrink-0 border ${
                  isActive
                    ? "bg-white/[0.09] text-white border-white/25 shadow-md"
                    : "bg-transparent text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.03] border-transparent"
                }`}
              >
                <Icon size={14} style={{ color: tab.accent }} />
                <span className="font-semibold">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* MAIN SPLIT BODY: LEFT CONFIGURATOR + RIGHT LIVE ENGINE & SWARM SHAPER */}
        <div className="flex-1 min-h-0 flex flex-col lg:flex-row overflow-hidden">
          {/* LEFT PANE: INTERACTIVE PARAMETER BUILDER */}
          <div className="flex-1 overflow-y-auto p-5 space-y-5 custom-scrollbar border-b lg:border-b-0 lg:border-r border-white/[0.08]">
            {/* ===============================================================
                MODULE 1: REDLINE & BLACKLINE STUDIO
               =============================================================== */}
            {activeModule === "redline" && (
              <div className="space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-3 bg-red-950/15 border border-red-500/25 rounded-xl p-3.5">
                  <div>
                    <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-red-300">
                      Document Intake & Posture Configuration
                    </h3>
                    <p className="text-[11px] text-zinc-400 mt-0.5">
                      Upload a contract (.PDF, .DOCX, .MD) or edit clauses directly below to compile Track-Changes Word (.docx) + Fortune 50 Redline PDFs.
                    </p>
                  </div>
                  <div>
                    <input
                      ref={fileUploadRef}
                      type="file"
                      className="hidden"
                      accept=".pdf,.docx,.md,.txt"
                      onChange={handleFileUpload}
                    />
                    <button
                      type="button"
                      onClick={() => fileUploadRef.current?.click()}
                      disabled={isParsingFile}
                      className="px-3 py-1.5 rounded-lg bg-red-600/25 hover:bg-red-600/40 border border-red-500/40 text-xs font-mono text-red-100 flex items-center gap-1.5"
                    >
                      {isParsingFile ? (
                        <Loader2 size={13} className="animate-spin" />
                      ) : (
                        <Upload size={13} />
                      )}
                      <span>{isParsingFile ? "Extracting..." : "Upload Contract"}</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-[10px] font-mono uppercase text-zinc-400 mb-1">
                      Agreement Title
                    </label>
                    <input
                      value={redlineDocTitle}
                      onChange={(e) => setRedlineDocTitle(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-black/50 border border-white/10 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono uppercase text-zinc-400 mb-1">
                      Counterparty Name
                    </label>
                    <input
                      value={redlineCounterparty}
                      onChange={(e) => setRedlineCounterparty(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-black/50 border border-white/10 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono uppercase text-zinc-400 mb-1">
                      Negotiation Posture
                    </label>
                    <select
                      value={redlinePosture}
                      onChange={(e) => setRedlinePosture(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-lg bg-[#0d1017] border border-white/10 text-xs text-white"
                    >
                      <option value="Pro-Buyer / Customer">Pro-Buyer / Customer (Aggressive Protection)</option>
                      <option value="Pro-Seller / Vendor">Pro-Seller / Vendor (Liability Cap & Narrow Indemnity)</option>
                      <option value="Balanced / Market">Balanced / Mutual Market Standard</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono uppercase text-zinc-400 mb-1">
                      Target Liability Cap & Carve-Outs
                    </label>
                    <input
                      value={redlineLiabilityCap}
                      onChange={(e) => setRedlineLiabilityCap(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-black/50 border border-white/10 text-xs text-white"
                    />
                  </div>
                </div>

                {/* Clauses List */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-zinc-300">
                      Clauses to Redline ({redlineClauses.length})
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setRedlineClauses((prev) => [
                          ...prev,
                          {
                            heading: `Section ${prev.length + 1} — Governing Law & Venue`,
                            original_text:
                              "This Agreement shall be governed by the laws of the State of Texas.",
                            revised_text:
                              "This Agreement shall be governed by and construed in accordance with the internal laws of the State of Delaware, and the Parties consent to exclusive jurisdiction in the Court of Chancery of the State of Delaware.",
                            rationale: "Standardized governing law to Delaware per Firm Playbook.",
                            risk_severity: "MEDIUM",
                            fallback_tier: "PRIMARY",
                          },
                        ])
                      }
                      className="px-2.5 py-1 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-[11px] font-mono text-zinc-200 flex items-center gap-1"
                    >
                      <Plus size={12} /> Add Clause
                    </button>
                  </div>

                  {redlineClauses.map((clause, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-xl bg-[#0c0f17] border border-white/10 space-y-3"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <input
                          value={clause.heading}
                          onChange={(e) => {
                            const next = [...redlineClauses];
                            next[idx].heading = e.target.value;
                            setRedlineClauses(next);
                          }}
                          className="flex-1 bg-transparent text-xs font-bold text-white border-b border-white/10 pb-1 focus:outline-none"
                        />
                        <select
                          value={clause.risk_severity}
                          onChange={(e) => {
                            const next = [...redlineClauses];
                            next[idx].risk_severity = e.target.value;
                            setRedlineClauses(next);
                          }}
                          className="px-2 py-1 rounded bg-black border border-white/15 text-[10px] font-mono text-red-300"
                        >
                          <option value="CRITICAL">CRITICAL</option>
                          <option value="HIGH">HIGH</option>
                          <option value="MEDIUM">MEDIUM</option>
                          <option value="LOW">LOW</option>
                        </select>
                        {redlineClauses.length > 1 && (
                          <button
                            type="button"
                            onClick={() =>
                              setRedlineClauses((prev) =>
                                prev.filter((_, i) => i !== idx)
                              )
                            }
                            className="text-zinc-500 hover:text-red-400"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[9px] font-mono uppercase text-red-400 mb-1">
                            Counterparty Original Text (Deletions in Strikethrough)
                          </label>
                          <textarea
                            rows={4}
                            value={clause.original_text}
                            onChange={(e) => {
                              const next = [...redlineClauses];
                              next[idx].original_text = e.target.value;
                              setRedlineClauses(next);
                            }}
                            className="w-full p-2.5 rounded-lg bg-black/60 border border-red-500/20 text-xs text-zinc-300 font-mono"
                          />
                        </div>
                        <div>
                          <label className="block text-[9px] font-mono uppercase text-blue-400 mb-1">
                            Proposed Counsel Revision (Insertions in Blue Underline)
                          </label>
                          <textarea
                            rows={4}
                            value={clause.revised_text}
                            onChange={(e) => {
                              const next = [...redlineClauses];
                              next[idx].revised_text = e.target.value;
                              setRedlineClauses(next);
                            }}
                            className="w-full p-2.5 rounded-lg bg-black/60 border border-blue-500/20 text-xs text-zinc-200 font-mono"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[9px] font-mono uppercase text-zinc-500 mb-1">
                          Counsel Rationale & Playbook Citation
                        </label>
                        <input
                          value={clause.rationale}
                          onChange={(e) => {
                            const next = [...redlineClauses];
                            next[idx].rationale = e.target.value;
                            setRedlineClauses(next);
                          }}
                          className="w-full px-2.5 py-1.5 rounded-lg bg-black/40 border border-white/10 text-xs text-zinc-300"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ===============================================================
                MODULE 2: M&A DILIGENCE & PLAYBOOK AUDIT STUDIO
               =============================================================== */}
            {activeModule === "diligence" && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-[10px] font-mono uppercase text-zinc-400 mb-1">
                      Target Company
                    </label>
                    <input
                      value={diligenceTarget}
                      onChange={(e) => setDiligenceTarget(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-black/50 border border-white/10 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono uppercase text-zinc-400 mb-1">
                      Acquirer / Client
                    </label>
                    <input
                      value={diligenceAcquirer}
                      onChange={(e) => setDiligenceAcquirer(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-black/50 border border-white/10 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono uppercase text-zinc-400 mb-1">
                      Transaction Value
                    </label>
                    <input
                      value={diligenceDealValue}
                      onChange={(e) => setDiligenceDealValue(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-black/50 border border-white/10 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono uppercase text-zinc-400 mb-1">
                      Playbook Audit Standard
                    </label>
                    <select
                      value={diligencePlaybookPreset}
                      onChange={(e) => setDiligencePlaybookPreset(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-[#0d1017] border border-white/10 text-xs text-white"
                    >
                      <option value="AmLaw 10 Pro-Acquirer M&A Standard">AmLaw 10 Pro-Acquirer M&A Standard</option>
                      <option value="Enterprise SaaS Customer Protection">Enterprise SaaS Customer Protection</option>
                      <option value="Private Equity Buyout Diligence Matrix">Private Equity Buyout Diligence Matrix</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-[11px] font-mono font-bold uppercase text-zinc-300">
                    Diligence Red-Flag Findings ({diligenceFindings.length})
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setDiligenceFindings((prev) => [
                        ...prev,
                        {
                          category: "Regulatory & Tax",
                          title: "Unfiled State Sales Tax Nexus in 6 Jurisdictions",
                          severity: "MEDIUM",
                          description:
                            "Target exceeded economic nexus thresholds in NY, WA, and MA without collecting SaaS sales tax.",
                          financial_exposure: "$650,000 + statutory interest",
                          remediation_plan:
                            "File Voluntary Disclosure Agreements (VDAs) and deduct $650K from Purchase Price.",
                        },
                      ])
                    }
                    className="px-2.5 py-1 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-[11px] font-mono text-zinc-200 flex items-center gap-1"
                  >
                    <Plus size={12} /> Add Finding
                  </button>
                </div>

                {diligenceFindings.map((f, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl bg-[#0c0f17] border border-white/10 space-y-2.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <input
                        value={f.title}
                        onChange={(e) => {
                          const next = [...diligenceFindings];
                          next[idx].title = e.target.value;
                          setDiligenceFindings(next);
                        }}
                        className="flex-1 bg-transparent text-xs font-bold text-white border-b border-white/10 pb-1"
                      />
                      <select
                        value={f.severity}
                        onChange={(e) => {
                          const next = [...diligenceFindings];
                          next[idx].severity = e.target.value;
                          setDiligenceFindings(next);
                        }}
                        className="px-2 py-1 rounded bg-black border border-white/15 text-[10px] font-mono text-orange-300"
                      >
                        <option value="CRITICAL">CRITICAL</option>
                        <option value="HIGH">HIGH</option>
                        <option value="MEDIUM">MEDIUM</option>
                        <option value="LOW">LOW</option>
                      </select>
                      {diligenceFindings.length > 1 && (
                        <button
                          type="button"
                          onClick={() =>
                            setDiligenceFindings((prev) =>
                              prev.filter((_, i) => i !== idx)
                            )
                          }
                          className="text-zinc-500 hover:text-red-400"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                    <textarea
                      rows={2}
                      value={f.description}
                      onChange={(e) => {
                        const next = [...diligenceFindings];
                        next[idx].description = e.target.value;
                        setDiligenceFindings(next);
                      }}
                      className="w-full p-2 rounded-lg bg-black/50 border border-white/10 text-xs text-zinc-300"
                    />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <input
                        value={f.financial_exposure}
                        onChange={(e) => {
                          const next = [...diligenceFindings];
                          next[idx].financial_exposure = e.target.value;
                          setDiligenceFindings(next);
                        }}
                        placeholder="Financial Exposure"
                        className="px-2.5 py-1.5 rounded bg-black/40 border border-white/10 text-xs text-red-300 font-mono"
                      />
                      <input
                        value={f.remediation_plan}
                        onChange={(e) => {
                          const next = [...diligenceFindings];
                          next[idx].remediation_plan = e.target.value;
                          setDiligenceFindings(next);
                        }}
                        placeholder="Remediation / Escrow Plan"
                        className="px-2.5 py-1.5 rounded bg-black/40 border border-white/10 text-xs text-emerald-300"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ===============================================================
                MODULE 3: CAP TABLE & WATERFALL STUDIO
               =============================================================== */}
            {activeModule === "captable" && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-[10px] font-mono uppercase text-zinc-400 mb-1">
                      Company Name
                    </label>
                    <input
                      value={capCompanyName}
                      onChange={(e) => setCapCompanyName(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-black/50 border border-white/10 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono uppercase text-zinc-400 mb-1">
                      Pre-Money ($ USD)
                    </label>
                    <input
                      type="number"
                      value={capPreMoney}
                      onChange={(e) => setCapPreMoney(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-lg bg-black/50 border border-white/10 text-xs text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono uppercase text-zinc-400 mb-1">
                      New Round ($ USD)
                    </label>
                    <input
                      type="number"
                      value={capNewInvestment}
                      onChange={(e) => setCapNewInvestment(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-lg bg-black/50 border border-white/10 text-xs text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono uppercase text-zinc-400 mb-1">
                      Post-Round ESOP (%)
                    </label>
                    <input
                      type="number"
                      value={capOptionPoolPct}
                      onChange={(e) => setCapOptionPoolPct(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-lg bg-black/50 border border-white/10 text-xs text-white font-mono"
                    />
                  </div>
                </div>

                {/* Share Classes */}
                <div className="p-4 rounded-xl bg-[#0c0f17] border border-white/10 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono font-bold uppercase text-purple-300">
                      Existing Share Classes
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setCapShareholders((prev) => [
                          ...prev,
                          {
                            holder_name: "Advisor Shares",
                            share_class: "Common",
                            shares: 250000,
                            is_option_pool: false,
                          },
                        ])
                      }
                      className="px-2 py-1 rounded bg-white/5 hover:bg-white/10 text-[10px] font-mono text-zinc-300"
                    >
                      + Add Shareholder
                    </button>
                  </div>
                  {capShareholders.map((sh, idx) => (
                    <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                      <input
                        value={sh.holder_name}
                        onChange={(e) => {
                          const next = [...capShareholders];
                          next[idx].holder_name = e.target.value;
                          setCapShareholders(next);
                        }}
                        className="col-span-5 px-2.5 py-1.5 rounded bg-black/50 border border-white/10 text-xs text-white"
                      />
                      <input
                        value={sh.share_class}
                        onChange={(e) => {
                          const next = [...capShareholders];
                          next[idx].share_class = e.target.value;
                          setCapShareholders(next);
                        }}
                        className="col-span-3 px-2.5 py-1.5 rounded bg-black/50 border border-white/10 text-xs text-zinc-300"
                      />
                      <input
                        type="number"
                        value={sh.shares}
                        onChange={(e) => {
                          const next = [...capShareholders];
                          next[idx].shares = Number(e.target.value);
                          setCapShareholders(next);
                        }}
                        className="col-span-3 px-2.5 py-1.5 rounded bg-black/50 border border-white/10 text-xs text-purple-300 font-mono"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setCapShareholders((prev) =>
                            prev.filter((_, i) => i !== idx)
                          )
                        }
                        className="col-span-1 text-zinc-500 hover:text-red-400 flex justify-center"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Converting SAFEs / Notes */}
                <div className="p-4 rounded-xl bg-[#0c0f17] border border-white/10 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono font-bold uppercase text-amber-300">
                      Converting SAFEs & Convertible Notes
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setCapSafes((prev) => [
                          ...prev,
                          {
                            investor_name: "Bridge Note II",
                            instrument_type: "POST_MONEY_SAFE",
                            principal_amount: 1000000,
                            valuation_cap: 18000000,
                            discount_percent: 15,
                          },
                        ])
                      }
                      className="px-2 py-1 rounded bg-white/5 hover:bg-white/10 text-[10px] font-mono text-zinc-300"
                    >
                      + Add SAFE / Note
                    </button>
                  </div>
                  {capSafes.map((sf, idx) => (
                    <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                      <input
                        value={sf.investor_name}
                        onChange={(e) => {
                          const next = [...capSafes];
                          next[idx].investor_name = e.target.value;
                          setCapSafes(next);
                        }}
                        className="col-span-4 px-2.5 py-1.5 rounded bg-black/50 border border-white/10 text-xs text-white"
                      />
                      <input
                        type="number"
                        value={sf.principal_amount}
                        onChange={(e) => {
                          const next = [...capSafes];
                          next[idx].principal_amount = Number(e.target.value);
                          setCapSafes(next);
                        }}
                        placeholder="Principal"
                        className="col-span-3 px-2.5 py-1.5 rounded bg-black/50 border border-white/10 text-xs text-emerald-300 font-mono"
                      />
                      <input
                        type="number"
                        value={sf.valuation_cap}
                        onChange={(e) => {
                          const next = [...capSafes];
                          next[idx].valuation_cap = Number(e.target.value);
                          setCapSafes(next);
                        }}
                        placeholder="Cap"
                        className="col-span-3 px-2.5 py-1.5 rounded bg-black/50 border border-white/10 text-xs text-amber-300 font-mono"
                      />
                      <input
                        type="number"
                        value={sf.discount_percent}
                        onChange={(e) => {
                          const next = [...capSafes];
                          next[idx].discount_percent = Number(e.target.value);
                          setCapSafes(next);
                        }}
                        placeholder="Disc %"
                        className="col-span-1 px-1.5 py-1.5 rounded bg-black/50 border border-white/10 text-xs text-zinc-300 font-mono"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setCapSafes((prev) => prev.filter((_, i) => i !== idx))
                        }
                        className="col-span-1 text-zinc-500 hover:text-red-400 flex justify-center"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ===============================================================
                MODULE 4: LITIGATION BLUEBOOK & FRCP DEADLINES
               =============================================================== */}
            {activeModule === "litigation" && (
              <div className="space-y-4">
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setLitSubTab("bluebook")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono border ${
                      litSubTab === "bluebook"
                        ? "bg-blue-600/25 border-blue-500 text-white"
                        : "bg-white/5 border-white/10 text-zinc-400"
                    }`}
                  >
                    Bluebook 21st Ed. Verifier
                  </button>
                  <button
                    type="button"
                    onClick={() => setLitSubTab("deadlines")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono border ${
                      litSubTab === "deadlines"
                        ? "bg-blue-600/25 border-blue-500 text-white"
                        : "bg-white/5 border-white/10 text-zinc-400"
                    }`}
                  >
                    FRCP Statutory Deadline Calculator
                  </button>
                </div>

                {litSubTab === "bluebook" ? (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-[10px] font-mono uppercase text-zinc-400 mb-1">
                        Formatting Style
                      </label>
                      <select
                        value={bluebookStyle}
                        onChange={(e) => setBluebookStyle(e.target.value as any)}
                        className="w-full px-3 py-2 rounded-lg bg-[#0d1017] border border-white/10 text-xs text-white"
                      >
                        <option value="court_brief">Court Brief / Practitioner (Bluepages)</option>
                        <option value="law_review">Law Review Footnote (Whitepages)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono uppercase text-zinc-400 mb-1">
                        Citations to Audit (One per line)
                      </label>
                      <textarea
                        rows={7}
                        value={bluebookInput}
                        onChange={(e) => setBluebookInput(e.target.value)}
                        className="w-full p-3 rounded-xl bg-black/60 border border-white/15 text-xs text-zinc-200 font-mono"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-[10px] font-mono uppercase text-zinc-400 mb-1">
                        Case Caption
                      </label>
                      <input
                        value={frcpMatterName}
                        onChange={(e) => setFrcpMatterName(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-black/50 border border-white/10 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono uppercase text-zinc-400 mb-1">
                        Trigger Event
                      </label>
                      <select
                        value={frcpTriggerType}
                        onChange={(e) => setFrcpTriggerType(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-[#0d1017] border border-white/10 text-xs text-white"
                      >
                        <option value="COMPLAINT_SERVED">Complaint Served (Rule 12 / 26)</option>
                        <option value="SUMMARY_JUDGMENT_FILED">Motion for Summary Judgment Filed (Rule 56)</option>
                        <option value="DISCOVERY_SERVED">Interrogatories / RFPs Served (Rule 33/34)</option>
                        <option value="FINAL_JUDGMENT_ENTERED">Final Judgment Entered (Rule 59 / FRAP 4)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono uppercase text-zinc-400 mb-1">
                        Trigger Date
                      </label>
                      <input
                        type="date"
                        value={frcpTriggerDate}
                        onChange={(e) => setFrcpTriggerDate(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-black/50 border border-white/10 text-xs text-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono uppercase text-zinc-400 mb-1">
                        Service Method (Rule 6(d))
                      </label>
                      <select
                        value={frcpServiceMethod}
                        onChange={(e) => setFrcpServiceMethod(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-[#0d1017] border border-white/10 text-xs text-white"
                      >
                        <option value="ELECTRONIC">CM/ECF Electronic (+0 days)</option>
                        <option value="PERSONAL">Personal Hand Delivery (+0 days)</option>
                        <option value="MAIL">U.S. Mail (+3 calendar days)</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ===============================================================
                MODULE 5: SEC FORM D & FINCEN CTA STUDIO
               =============================================================== */}
            {activeModule === "securities" && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-[10px] font-mono uppercase text-zinc-400 mb-1">
                      Issuer Legal Name
                    </label>
                    <input
                      value={secIssuerName}
                      onChange={(e) => setSecIssuerName(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-black/50 border border-white/10 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono uppercase text-zinc-400 mb-1">
                      Regulation D Exemption
                    </label>
                    <select
                      value={secExemption}
                      onChange={(e) => setSecExemption(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-[#0d1017] border border-white/10 text-xs text-white"
                    >
                      <option value="RULE_506C">Rule 506(c) — General Solicitation (Verified Accredited)</option>
                      <option value="RULE_506B">Rule 506(b) — Private Placement (Up to 35 Non-Accredited)</option>
                      <option value="RULE_504">Rule 504 — Up to $10M Regional Offering</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono uppercase text-zinc-400 mb-1">
                      Total Offering Amount ($ USD)
                    </label>
                    <input
                      type="number"
                      value={secOfferingAmount}
                      onChange={(e) => setSecOfferingAmount(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-lg bg-black/50 border border-white/10 text-xs text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono uppercase text-zinc-400 mb-1">
                      Date of First Sale (Triggers 15-Day SEC Deadline)
                    </label>
                    <input
                      type="date"
                      value={secFirstSaleDate}
                      onChange={(e) => setSecFirstSaleDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-black/50 border border-white/10 text-xs text-white font-mono"
                    />
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[#0c0f17] border border-white/10 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono font-bold uppercase text-emerald-300">
                      State Blue Sky Investor Allocations
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setSecStates((prev) => [
                          ...prev,
                          {
                            state_code: "MA",
                            investor_count: 2,
                            amount_sold: 750000,
                            all_accredited: true,
                          },
                        ])
                      }
                      className="px-2 py-1 rounded bg-white/5 hover:bg-white/10 text-[10px] font-mono text-zinc-300"
                    >
                      + Add State
                    </button>
                  </div>
                  {secStates.map((st, idx) => (
                    <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                      <input
                        value={st.state_code}
                        onChange={(e) => {
                          const next = [...secStates];
                          next[idx].state_code = e.target.value.toUpperCase();
                          setSecStates(next);
                        }}
                        placeholder="State (e.g. NY)"
                        className="col-span-3 px-2.5 py-1.5 rounded bg-black/50 border border-white/10 text-xs text-white font-mono"
                      />
                      <input
                        type="number"
                        value={st.investor_count}
                        onChange={(e) => {
                          const next = [...secStates];
                          next[idx].investor_count = Number(e.target.value);
                          setSecStates(next);
                        }}
                        placeholder="Investors"
                        className="col-span-3 px-2.5 py-1.5 rounded bg-black/50 border border-white/10 text-xs text-zinc-300 font-mono"
                      />
                      <input
                        type="number"
                        value={st.amount_sold}
                        onChange={(e) => {
                          const next = [...secStates];
                          next[idx].amount_sold = Number(e.target.value);
                          setSecStates(next);
                        }}
                        placeholder="Amount ($)"
                        className="col-span-5 px-2.5 py-1.5 rounded bg-black/50 border border-white/10 text-xs text-emerald-300 font-mono"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setSecStates((prev) => prev.filter((_, i) => i !== idx))
                        }
                        className="col-span-1 text-zinc-500 hover:text-red-400 flex justify-center"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ===============================================================
                MODULE 6: LEDES 1998B BILLING & E-SIGN STUDIO
               =============================================================== */}
            {activeModule === "billing" && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[10px] font-mono uppercase text-zinc-400 mb-1">
                      Client Name
                    </label>
                    <input
                      value={billClientName}
                      onChange={(e) => setBillClientName(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-black/50 border border-white/10 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono uppercase text-zinc-400 mb-1">
                      Matter Number
                    </label>
                    <input
                      value={billMatterNumber}
                      onChange={(e) => setBillMatterNumber(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-black/50 border border-white/10 text-xs text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono uppercase text-zinc-400 mb-1">
                      Fee Arrangement
                    </label>
                    <select
                      value={billFeeType}
                      onChange={(e) => setBillFeeType(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-lg bg-[#0d1017] border border-white/10 text-xs text-white"
                    >
                      <option value="HOURLY">Standard Hourly (UTBMS / LEDES)</option>
                      <option value="CAPPED_FEE">Capped Fee Arrangement</option>
                      <option value="FIXED_FEE">Alternative Fixed Fee</option>
                    </select>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[#0c0f17] border border-white/10 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono font-bold uppercase text-yellow-300">
                      UTBMS Timekeeper Line Items ({billEntries.length})
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setBillEntries((prev) => [
                          ...prev,
                          {
                            date: new Date().toISOString().split("T")[0],
                            timekeeper_name: "Bannister (Securities)",
                            timekeeper_role: "SENIOR_COUNSEL",
                            utbms_task_code: "L210",
                            utbms_activity_code: "A106",
                            hours: 3.5,
                            hourly_rate: 895,
                            narrative: "Blue Sky state notice filings and Form D verification.",
                          },
                        ])
                      }
                      className="px-2 py-1 rounded bg-white/5 hover:bg-white/10 text-[10px] font-mono text-zinc-300"
                    >
                      + Add Time Entry
                    </button>
                  </div>

                  {billEntries.map((entry, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-lg bg-black/40 border border-white/[0.06] space-y-2"
                    >
                      <div className="grid grid-cols-12 gap-2 items-center">
                        <input
                          value={entry.timekeeper_name}
                          onChange={(e) => {
                            const next = [...billEntries];
                            next[idx].timekeeper_name = e.target.value;
                            setBillEntries(next);
                          }}
                          className="col-span-5 px-2 py-1 rounded bg-black/60 border border-white/10 text-xs text-white"
                        />
                        <input
                          value={entry.utbms_task_code}
                          onChange={(e) => {
                            const next = [...billEntries];
                            next[idx].utbms_task_code = e.target.value;
                            setBillEntries(next);
                          }}
                          placeholder="UTBMS (L120)"
                          className="col-span-2 px-2 py-1 rounded bg-black/60 border border-white/10 text-xs text-yellow-300 font-mono"
                        />
                        <input
                          type="number"
                          step="0.5"
                          value={entry.hours}
                          onChange={(e) => {
                            const next = [...billEntries];
                            next[idx].hours = Number(e.target.value);
                            setBillEntries(next);
                          }}
                          className="col-span-2 px-2 py-1 rounded bg-black/60 border border-white/10 text-xs text-white font-mono"
                        />
                        <input
                          type="number"
                          value={entry.hourly_rate}
                          onChange={(e) => {
                            const next = [...billEntries];
                            next[idx].hourly_rate = Number(e.target.value);
                            setBillEntries(next);
                          }}
                          className="col-span-2 px-2 py-1 rounded bg-black/60 border border-white/10 text-xs text-emerald-300 font-mono"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setBillEntries((prev) =>
                              prev.filter((_, i) => i !== idx)
                            )
                          }
                          className="col-span-1 text-zinc-500 hover:text-red-400 flex justify-center"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                      <input
                        value={entry.narrative}
                        onChange={(e) => {
                          const next = [...billEntries];
                          next[idx].narrative = e.target.value;
                          setBillEntries(next);
                        }}
                        className="w-full px-2 py-1 rounded bg-black/30 border border-white/[0.05] text-[11px] text-zinc-400"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* PARTNER CO-PILOT SHAPING INSTRUCTIONS */}
            <div className="pt-3 border-t border-white/10">
              <label className="block text-[10px] font-mono uppercase tracking-wider text-zinc-400 mb-1.5">
                Custom Partner Shaping Instructions for the AI Swarm (Optional)
              </label>
              <textarea
                rows={2}
                value={swarmNotes}
                onChange={(e) => setSwarmNotes(e.target.value)}
                placeholder="e.g., 'Ensure Delaware Court of Chancery exclusive venue, add a $2M basket for general reps, and have O'Hara draft a cover memo to the Board...'"
                className="w-full p-2.5 rounded-xl bg-black/60 border border-white/15 text-xs text-white placeholder-zinc-500"
              />
            </div>
          </div>

          {/* RIGHT PANE: INSTANT DETERMINISTIC OUTPUT & SWARM DISPATCH */}
          <div className="w-full lg:w-[440px] xl:w-[480px] flex-shrink-0 bg-[#05070b] flex flex-col justify-between p-5 overflow-y-auto custom-scrollbar">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div>
                  <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-white">
                    LIVE DELIVERABLE & ENGINE PREVIEW
                  </h3>
                  <p className="text-[11px] text-zinc-400">
                    Test deterministically right here or dispatch to the full Swarm
                  </p>
                </div>
                <button
                  type="button"
                  onClick={runInstantEngine}
                  disabled={isExecutingTool}
                  className="px-3 py-1.5 rounded-lg bg-white/[0.07] hover:bg-white/[0.14] border border-white/15 text-xs font-mono font-semibold text-white flex items-center gap-1.5 transition-all"
                >
                  {isExecutingTool ? (
                    <Loader2 size={13} className="animate-spin text-red-400" />
                  ) : (
                    <Play size={13} className="text-emerald-400" />
                  )}
                  <span>{isExecutingTool ? "Compiling..." : "⚡ Run Live Engine"}</span>
                </button>
              </div>

              {/* Live Engine Result Display */}
              {!liveResult && !isExecutingTool && (
                <div className="p-6 rounded-xl bg-white/[0.02] border border-dashed border-white/10 text-center space-y-2">
                  <Sparkles size={26} className="text-red-400/70 mx-auto" />
                  <div className="text-xs font-semibold text-zinc-300">
                    Ready to Compile or Collaborate
                  </div>
                  <p className="text-[11px] text-zinc-500 leading-relaxed">
                    Click <strong>⚡ Run Live Engine</strong> above to immediately compile PDFs, Word (.docx) Track-Changes files, or financial tables right inside this studio—or click <strong>🤝 Collaborate with AI Swarm</strong> below to have the agents iterate on your configuration in the console.
                  </p>
                </div>
              )}

              {isExecutingTool && (
                <div className="p-8 rounded-xl bg-white/[0.02] border border-white/10 text-center space-y-3">
                  <Loader2 size={28} className="animate-spin text-red-500 mx-auto" />
                  <div className="text-xs font-mono uppercase tracking-wider text-zinc-300">
                    Executing AmLaw 10 Engine & Compiling Deliverables...
                  </div>
                </div>
              )}

              {liveResult && (
                <div className="space-y-3 animate-fade-in">
                  {/* Status Banner */}
                  <div
                    className={`p-3 rounded-xl border flex items-center justify-between ${
                      liveResult.error || liveResult.status === "failed"
                        ? "bg-red-950/30 border-red-500/40 text-red-200"
                        : "bg-emerald-950/25 border-emerald-500/35 text-emerald-200"
                    }`}
                  >
                    <div className="flex items-center gap-2 text-xs font-mono font-bold">
                      <CheckCircle2 size={15} />
                      <span>
                        {liveResult.display_id
                          ? `COMPILED: ${liveResult.display_id}`
                          : "ENGINE EXECUTION COMPLETE"}
                      </span>
                    </div>
                  </div>

                  {/* Deliverable Download Cards (PDF + DOCX) */}
                  {(liveResult.pdf_file_url || liveResult.file_url) && (
                    <div className="p-3.5 rounded-xl bg-red-950/30 border border-red-500/40 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <FileText size={18} className="text-red-400 flex-shrink-0" />
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-white truncate">
                            Fortune 50 PDF Deliverable
                          </div>
                          <div className="text-[10px] font-mono text-red-300 truncate">
                            {liveResult.pdf_file_url || liveResult.file_url}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {onOpenArtifact && (
                          <button
                            type="button"
                            onClick={() =>
                              onOpenArtifact(
                                liveResult.pdf_file_url || liveResult.file_url,
                                liveResult.display_id || "Compiled PDF"
                              )
                            }
                            className="px-2.5 py-1 rounded bg-white/10 hover:bg-white/20 text-[10px] font-mono text-white"
                          >
                            Preview
                          </button>
                        )}
                        <a
                          href={liveResult.pdf_file_url || liveResult.file_url}
                          download
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2.5 py-1 rounded bg-red-600 hover:bg-red-500 text-[10px] font-mono font-bold text-white no-underline flex items-center gap-1"
                        >
                          <Download size={11} /> PDF
                        </a>
                      </div>
                    </div>
                  )}

                  {liveResult.docx_file_url && (
                    <a
                      href={liveResult.docx_file_url}
                      download
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3.5 rounded-xl bg-blue-950/35 border border-blue-500/40 hover:border-blue-400 flex items-center justify-between gap-3 no-underline transition-all"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Download size={18} className="text-blue-400 flex-shrink-0" />
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-white truncate">
                            Download Word (.DOCX) Track Changes
                          </div>
                          <div className="text-[10px] font-mono text-blue-300 truncate">
                            {liveResult.docx_file_url}
                          </div>
                        </div>
                      </div>
                      <span className="px-2.5 py-1 rounded bg-blue-600 text-[10px] font-mono font-bold text-white">
                        .DOCX
                      </span>
                    </a>
                  )}

                  {/* Summary Metrics / JSON Telemetry */}
                  <div className="p-3 rounded-xl bg-black/60 border border-white/10 max-h-72 overflow-y-auto custom-scrollbar">
                    <div className="text-[10px] font-mono uppercase text-zinc-500 mb-1.5">
                      Structured Engine Output
                    </div>
                    <pre className="text-[11px] font-mono text-zinc-300 whitespace-pre-wrap break-words">
                      {liveResult.executive_summary_markdown ||
                        liveResult.message ||
                        JSON.stringify(liveResult, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </div>

            {/* Primary Swarm Co-Pilot Action Footer */}
            <div className="pt-4 mt-4 border-t border-white/10 space-y-2.5">
              <button
                type="button"
                onClick={handleCollaborateWithSwarm}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-xs font-mono font-bold uppercase tracking-wider text-white shadow-[0_0_25px_rgba(220,38,38,0.4)] flex items-center justify-center gap-2 transition-all"
              >
                <Sparkles size={15} />
                <span>🤝 Shape & Execute with AI Swarm in Console</span>
                <ArrowUpRight size={15} />
              </button>
              <p className="text-[10px] text-center text-zinc-500">
                Dispatches your structured studio configuration to the active Swarm Orchestrator & Practice Specialists for collaborative refinement.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

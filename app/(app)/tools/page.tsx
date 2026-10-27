"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Wrench,
  Search,
  Play,
  Sparkles,
  Download,
  FileText,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Code,
  ArrowUpRight,
} from "lucide-react";
import { useRouter } from "next/navigation";

interface ToolItem {
  name: string;
  category: string;
  description: string;
  parameters: Record<string, any>;
  usage_stats: {
    execution_count: number;
    last_execution_time: number | null;
  };
}

interface ToolExecution {
  id: string;
  tool_name: string;
  parameters: Record<string, any>;
  result: any;
  status: "success" | "error";
  timestamp: string;
}

const SAMPLE_PAYLOADS: Record<string, Record<string, any>> = {
  redline_document: {
    title: "Enterprise SaaS Master Services Agreement",
    counterparty_name: "OmniCloud Corp.",
    negotiation_summary: "Pro-Customer redline enforcing mutual indemnification and a 24-month super-cap.",
    output_formats: "both_pdf_and_docx",
    sections: [
      {
        heading: "Section 10.1 — Indemnification",
        original_text:
          "Customer shall indemnify and hold harmless Vendor against any and all claims arising from Customer's use of the Services.",
        revised_text:
          "Each Party shall mutually defend, indemnify, and hold harmless the other Party from third-party claims arising out of IP infringement, gross negligence, or breach of confidentiality.",
        rationale: "Converted unilateral customer indemnity to mutual protection per Playbook Rule 1.",
        risk_severity: "CRITICAL",
        fallback_tier: "PRIMARY",
      },
    ],
  },
  compare_document_versions: {
    document_title: "NDA Clause Comparison",
    version_a_label: "Counterparty Draft v1",
    version_b_label: "Firm Markup v2",
    version_a_text:
      "The Receiving Party shall keep Confidential Information secret for a period of one (1) year from disclosure.",
    version_b_text:
      "The Receiving Party shall keep Confidential Information strictly confidential for five (5) years from disclosure, and perpetually with respect to trade secrets.",
    compile_redline_pdf: true,
  },
  evaluate_against_playbook: {
    document_title: "Vendor MSA",
    party_role: "Buyer / Customer",
    clauses_to_evaluate: [
      {
        clause_heading: "Limitation of Liability",
        clause_text: "Vendor's total liability shall not exceed $1,000.",
        playbook_ideal_position: "Mutual 24-month fees super-cap with uncapped IP/confidentiality.",
        playbook_acceptable_fallback: "12 months fees paid or payable.",
        playbook_walk_away_trigger: "Liability cap below 6 months fees.",
      },
    ],
  },
  generate_diligence_red_flag_report: {
    matter_title: "Project Horizon M&A Diligence",
    target_company: "VectorAI Labs, Inc.",
    acquirer_company: "Basalt Strategic Holdings",
    transaction_value: "$85,000,000",
    executive_overview: "Key IP, Change-of-Control, and tax nexus findings identified during Phase I diligence.",
    findings: [
      {
        category: "Change of Control",
        title: "Top 3 Enterprise Contracts Require Prior Written Consent",
        severity: "CRITICAL",
        description: "38% of ARR is subject to termination upon a Change of Control.",
        financial_exposure: "$14,200,000 ARR",
        remediation_plan: "Add required consents to Closing Conditions Schedule 7.2.",
      },
    ],
  },
  model_cap_table_and_dilution: {
    company_name: "Vigil AI, Inc.",
    round_name: "Series A",
    pre_money_valuation: 20000000,
    new_money_investment: 5000000,
    target_post_money_option_pool_percent: 10,
    existing_shareholders: [
      { holder_name: "Founders", share_class: "Common", shares: 8000000, is_option_pool: false },
      { holder_name: "Existing ESOP", share_class: "Options", shares: 500000, is_option_pool: true },
    ],
    converting_instruments: [
      {
        investor_name: "Seed SAFE I",
        instrument_type: "POST_MONEY_SAFE",
        principal_amount: 2000000,
        valuation_cap: 10000000,
        discount_percent: 20,
      },
    ],
    compile_pdf_report: true,
  },
  verify_and_format_bluebook_citations: {
    citations: [
      "Pennoyer v Neff 95 US 714 (1878)",
      "Ashcroft v. Iqbal, 556 U.S. 662, 678 (2009)",
      "42 U.S.C. section 1983",
      "Rule 12(b)(6) of the Federal Rules of Civil Procedure",
    ],
    style: "court_brief",
  },
  calculate_litigation_deadlines: {
    matter_name: "Apex Corp. v. NovaCloud Inc.",
    trigger_event_type: "COMPLAINT_SERVED",
    trigger_date: "2026-05-04",
    service_method: "ELECTRONIC",
    jurisdiction_rules: "FEDERAL_FRCP",
  },
  prepare_sec_form_d_and_blue_sky: {
    issuer_name: "Vigil Quantum Corp.",
    entity_type: "Delaware C-Corporation",
    jurisdiction_of_incorporation: "Delaware",
    exemption_claimed: "RULE_506C",
    total_offering_amount: 10000000,
    total_amount_sold: 6500000,
    first_sale_date: "2026-05-01",
    investor_states: [
      { state_code: "NY", investor_count: 5, amount_sold: 3500000, all_accredited: true },
      { state_code: "CA", investor_count: 6, amount_sold: 3000000, all_accredited: true },
    ],
    compile_pdf_report: true,
  },
  generate_legal_invoice_and_roi: {
    client_name: "Apex Enterprise Corp.",
    matter_name: "Series A Financing & IP Audit",
    matter_number: "MAT-2026-019",
    invoice_number: "INV-2026-881",
    fee_arrangement: "HOURLY",
    time_entries: [
      {
        date: "2026-05-01",
        timekeeper_name: "Keyes (Senior Partner)",
        timekeeper_role: "PARTNER",
        utbms_task_code: "L120",
        utbms_activity_code: "A101",
        hours: 5.5,
        hourly_rate: 1150,
        narrative: "Deal structuring and negotiation strategy.",
      },
      {
        date: "2026-05-02",
        timekeeper_name: "O'Hara (Senior Counsel)",
        timekeeper_role: "SENIOR_COUNSEL",
        utbms_task_code: "L140",
        utbms_activity_code: "A103",
        hours: 8.0,
        hourly_rate: 895,
        narrative: "Drafted redline comparison and fallback clauses.",
      },
    ],
    compile_pdf_invoice: true,
  },
};

export default function ToolWorkbenchPage() {
  const router = useRouter();
  const [tools, setTools] = useState<ToolItem[]>([]);
  const [selectedTool, setSelectedTool] = useState<ToolItem | null>(null);
  const [toolParams, setToolParams] = useState<Record<string, any>>({});
  const [rawJsonParams, setRawJsonParams] = useState<string>("{}");
  const [jsonMode, setJsonMode] = useState<boolean>(false);
  const [executions, setExecutions] = useState<ToolExecution[]>([]);
  const [isExecuting, setIsExecuting] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const fetchTools = async () => {
    try {
      const response = await fetch("/api/tools");
      if (response.ok) {
        const data = await response.json();
        setTools(data.tools || []);
        if (data.tools?.length > 0 && !selectedTool) {
          selectTool(data.tools[0]);
        }
      }
    } catch (error) {
      console.error("Error fetching tools:", error);
    }
  };

  useEffect(() => {
    fetchTools();
  }, []);

  const selectTool = (tool: ToolItem) => {
    setSelectedTool(tool);
    if (SAMPLE_PAYLOADS[tool.name]) {
      setToolParams(SAMPLE_PAYLOADS[tool.name]);
      setRawJsonParams(JSON.stringify(SAMPLE_PAYLOADS[tool.name], null, 2));
      return;
    }

    const initialParams: Record<string, any> = {};
    Object.entries(tool.parameters || {}).forEach(([key, param]) => {
      if (param.default !== undefined) initialParams[key] = param.default;
      else if (param.type === "string") initialParams[key] = "";
      else if (param.type === "number" || param.type === "integer")
        initialParams[key] = 0;
      else if (param.type === "boolean") initialParams[key] = false;
      else if (param.type === "array") initialParams[key] = [];
      else if (param.type === "object") initialParams[key] = {};
    });
    setToolParams(initialParams);
    setRawJsonParams(JSON.stringify(initialParams, null, 2));
  };

  const loadSamplePayload = () => {
    if (!selectedTool) return;
    const sample = SAMPLE_PAYLOADS[selectedTool.name] || toolParams;
    setToolParams(sample);
    setRawJsonParams(JSON.stringify(sample, null, 2));
  };

  const executeTool = async () => {
    if (!selectedTool) return;
    setIsExecuting(true);

    let payload = toolParams;
    if (jsonMode) {
      try {
        payload = JSON.parse(rawJsonParams);
      } catch (e) {
        alert("Invalid JSON in parameters editor");
        setIsExecuting(false);
        return;
      }
    }

    try {
      const res = await fetch("/api/tools", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tool_name: selectedTool.name,
          parameters: payload,
        }),
      });
      const data = await res.json();
      const isSuccess = res.ok && data.status !== "error";

      const execution: ToolExecution = {
        id: `exec-${Date.now()}`,
        tool_name: selectedTool.name,
        parameters: payload,
        result: data.result || data,
        status: isSuccess ? "success" : "error",
        timestamp: new Date().toISOString(),
      };

      setExecutions((prev) => [execution, ...prev]);
      fetchTools();
    } catch (error) {
      setExecutions((prev) => [
        {
          id: `exec-${Date.now()}`,
          tool_name: selectedTool.name,
          parameters: payload,
          result: {
            error: error instanceof Error ? error.message : "Unknown error",
          },
          status: "error",
          timestamp: new Date().toISOString(),
        },
        ...prev,
      ]);
    } finally {
      setIsExecuting(false);
    }
  };

  const categories = useMemo(
    () => ["all", ...Array.from(new Set(tools.map((t) => t.category)))],
    [tools]
  );

  const filteredTools = useMemo(() => {
    return tools.filter((t) => {
      const matchesCat =
        selectedCategory === "all" || t.category === selectedCategory;
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        t.name.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q);
      return matchesCat && matchesSearch;
    });
  }, [tools, selectedCategory, searchQuery]);

  const getCategoryBadge = (cat: string) => {
    const map: Record<string, { label: string; color: string }> = {
      redlining: { label: "REDLINING & DIFF", color: "#ef4444" },
      diligence: { label: "DUE DILIGENCE", color: "#f97316" },
      corporate: { label: "CORPORATE & CAP", color: "#a855f7" },
      litigation: { label: "LITIGATION & FRCP", color: "#3b82f6" },
      ip_compliance: { label: "IP & COMPLIANCE", color: "#10b981" },
      firm_ops: { label: "FIRM OPS & LEDES", color: "#eab308" },
      research: { label: "SEC & CASE LAW", color: "#06b6d4" },
      document: { label: "DOCUMENT ENGINE", color: "#ec4899" },
    };
    return map[cat] || { label: cat.toUpperCase(), color: "#a1a1aa" };
  };

  return (
    <div className="h-full flex flex-col bg-[#040507] text-zinc-100 overflow-hidden">
      {/* TOP HEADER */}
      <header className="flex-shrink-0 px-6 py-3.5 border-b border-white/[0.07] bg-[#080a10] flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-600/20 border border-red-500/35 flex items-center justify-center text-red-400">
            <Wrench size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-wider uppercase font-vox text-white">
                AMLAW 10 LEGAL TOOL WORKBENCH
              </h1>
              <span className="px-2 py-0.5 rounded bg-white/[0.06] border border-white/10 text-[10px] font-mono text-zinc-300">
                {tools.length} LIVE TOOLS
              </span>
            </div>
            <p className="text-xs text-zinc-400">
              Direct deterministic execution of Vigil&apos;s redlining, playbook audit, cap table, Bluebook, SEC EDGAR, and LaTeX engines
            </p>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-mono uppercase tracking-wider border transition-all ${
                selectedCategory === cat
                  ? "bg-red-600/25 border-red-500/50 text-white"
                  : "bg-white/[0.03] border-white/[0.07] text-zinc-400 hover:text-white"
              }`}
            >
              {cat === "all" ? "ALL SUITES" : cat.replace(/_/g, " ")}
            </button>
          ))}
        </div>
      </header>

      {/* 3-COLUMN WORKBENCH */}
      <div className="flex-1 flex min-h-0 overflow-hidden">
        {/* LEFT: TOOL CATALOG */}
        <aside className="w-80 flex-shrink-0 border-r border-white/[0.07] bg-[#06080d] flex flex-col">
          <div className="p-3.5 border-b border-white/[0.06]">
            <div className="relative">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"
              />
              <input
                type="text"
                placeholder="Search tools..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-black/50 border border-white/10 text-xs text-white focus:outline-none focus:border-red-500/50"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar divide-y divide-white/[0.05]">
            {filteredTools.map((tool) => {
              const isSelected = selectedTool?.name === tool.name;
              const badge = getCategoryBadge(tool.category);
              return (
                <div
                  key={tool.name}
                  onClick={() => selectTool(tool)}
                  className={`p-3.5 cursor-pointer transition-all ${
                    isSelected
                      ? "bg-white/[0.08] border-l-2 border-l-red-500"
                      : "hover:bg-white/[0.03]"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span
                      className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded"
                      style={{
                        backgroundColor: `${badge.color}20`,
                        color: badge.color,
                      }}
                    >
                      {badge.label}
                    </span>
                    <span className="text-[10px] font-mono text-zinc-500">
                      {tool.usage_stats.execution_count} runs
                    </span>
                  </div>
                  <h3 className="text-xs font-mono font-bold text-white truncate">
                    ◊ {tool.name}
                  </h3>
                  <p className="text-[11px] text-zinc-400 line-clamp-2 mt-1">
                    {tool.description}
                  </p>
                </div>
              );
            })}
          </div>
        </aside>

        {/* CENTER: PARAMETER CONFIGURATOR */}
        <section className="flex-1 flex flex-col min-w-0 bg-[#080a10] border-r border-white/[0.07]">
          {selectedTool ? (
            <>
              <div className="px-6 py-4 border-b border-white/[0.07] bg-[#0a0d14] flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-base font-mono font-bold text-white">
                    ◊ {selectedTool.name}
                  </h2>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    {selectedTool.description}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {SAMPLE_PAYLOADS[selectedTool.name] && (
                    <button
                      type="button"
                      onClick={loadSamplePayload}
                      className="px-3 py-1.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/35 text-xs font-mono text-amber-300"
                    >
                      ⚡ Load Sample Payload
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      if (!jsonMode) {
                        setRawJsonParams(JSON.stringify(toolParams, null, 2));
                      }
                      setJsonMode(!jsonMode);
                    }}
                    className="px-2.5 py-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-xs font-mono text-zinc-300 flex items-center gap-1"
                  >
                    <Code size={12} />
                    <span>{jsonMode ? "Form View" : "JSON Editor"}</span>
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6 custom-scrollbar space-y-4">
                {jsonMode ? (
                  <div>
                    <label className="block text-[10px] font-mono uppercase text-zinc-400 mb-2">
                      Raw JSON Parameters Payload
                    </label>
                    <textarea
                      rows={18}
                      value={rawJsonParams}
                      onChange={(e) => setRawJsonParams(e.target.value)}
                      className="w-full p-4 rounded-xl bg-black/70 border border-white/15 font-mono text-xs text-emerald-300 focus:outline-none focus:border-red-500/50"
                    />
                  </div>
                ) : (
                  Object.entries(selectedTool.parameters || {}).map(
                    ([key, param]) => {
                      const val = toolParams[key];
                      const isComplex =
                        param.type === "array" ||
                        param.type === "object" ||
                        typeof val === "object";

                      return (
                        <div
                          key={key}
                          className="p-3.5 rounded-xl bg-[#0c0f17] border border-white/[0.08] space-y-1.5"
                        >
                          <div className="flex items-center justify-between">
                            <label className="text-xs font-mono font-bold text-white">
                              {key}
                              {param.required && (
                                <span className="text-red-400 ml-1">*</span>
                              )}
                            </label>
                            <span className="text-[10px] font-mono text-zinc-500 uppercase">
                              {param.type}
                            </span>
                          </div>
                          {param.description && (
                            <p className="text-[11px] text-zinc-400">
                              {param.description}
                            </p>
                          )}

                          {param.enum ? (
                            <select
                              value={val || ""}
                              onChange={(e) =>
                                setToolParams({
                                  ...toolParams,
                                  [key]: e.target.value,
                                })
                              }
                              className="w-full px-3 py-2 rounded-lg bg-black/60 border border-white/15 text-xs text-white"
                            >
                              {param.enum.map((opt: string) => (
                                <option key={opt} value={opt}>
                                  {opt}
                                </option>
                              ))}
                            </select>
                          ) : param.type === "boolean" ? (
                            <label className="flex items-center gap-2 text-xs text-zinc-300 pt-1">
                              <input
                                type="checkbox"
                                checked={Boolean(val)}
                                onChange={(e) =>
                                  setToolParams({
                                    ...toolParams,
                                    [key]: e.target.checked,
                                  })
                                }
                              />
                              <span>Enabled</span>
                            </label>
                          ) : isComplex ? (
                            <textarea
                              rows={5}
                              value={
                                typeof val === "string"
                                  ? val
                                  : JSON.stringify(val, null, 2)
                              }
                              onChange={(e) => {
                                try {
                                  setToolParams({
                                    ...toolParams,
                                    [key]: JSON.parse(e.target.value),
                                  });
                                } catch {}
                              }}
                              className="w-full p-2.5 rounded-lg bg-black/60 border border-white/15 font-mono text-xs text-amber-200"
                            />
                          ) : (
                            <input
                              type={
                                param.type === "number" ||
                                param.type === "integer"
                                  ? "number"
                                  : "text"
                              }
                              value={val ?? ""}
                              onChange={(e) =>
                                setToolParams({
                                  ...toolParams,
                                  [key]:
                                    param.type === "number" ||
                                    param.type === "integer"
                                      ? Number(e.target.value)
                                      : e.target.value,
                                })
                              }
                              className="w-full px-3 py-2 rounded-lg bg-black/60 border border-white/15 text-xs text-white"
                            />
                          )}
                        </div>
                      );
                    }
                  )
                )}
              </div>

              <div className="p-4 border-t border-white/[0.07] bg-[#0a0d14] flex items-center gap-3">
                <button
                  type="button"
                  onClick={executeTool}
                  disabled={isExecuting}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-500 disabled:opacity-50 text-xs font-mono font-bold uppercase tracking-wider text-white flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(220,38,38,0.3)]"
                >
                  {isExecuting ? (
                    <Loader2 size={15} className="animate-spin" />
                  ) : (
                    <Play size={15} />
                  )}
                  <span>
                    {isExecuting
                      ? "Executing Tool Engine..."
                      : `Execute ${selectedTool.name}`}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    router.push(
                      `/chat?prompt=${encodeURIComponent(
                        `Please execute ${selectedTool.name} with the following parameters:\n\`\`\`json\n${JSON.stringify(
                          toolParams,
                          null,
                          2
                        )}\n\`\`\``
                      )}`
                    )
                  }
                  className="py-2.5 px-4 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/15 text-xs font-mono text-zinc-200 flex items-center gap-1.5"
                >
                  <Sparkles size={14} className="text-red-400" />
                  <span>Send to Swarm</span>
                  <ArrowUpRight size={13} />
                </button>
              </div>
            </>
          ) : null}
        </section>

        {/* RIGHT: LIVE EXECUTION LEDGER & DELIVERABLE CARDS */}
        <aside className="w-96 flex-shrink-0 bg-[#06080d] flex flex-col">
          <div className="px-4 py-3.5 border-b border-white/[0.07]">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-white">
              EXECUTION TELEMETRY & DELIVERABLES ({executions.length})
            </h3>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 custom-scrollbar">
            {executions.length === 0 ? (
              <div className="text-center py-16 text-zinc-500 space-y-2">
                <Wrench size={28} className="mx-auto text-zinc-700" />
                <p className="text-xs">
                  Select a tool and click Execute to inspect live deliverables.
                </p>
              </div>
            ) : (
              executions.map((exec) => {
                const r = exec.result || {};
                const pdfUrl = r.pdf_file_url || r.file_url;
                const docxUrl = r.docx_file_url;

                return (
                  <div
                    key={exec.id}
                    className={`p-4 rounded-xl border space-y-3 ${
                      exec.status === "success"
                        ? "bg-emerald-950/15 border-emerald-500/30"
                        : "bg-red-950/20 border-red-500/30"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-white">
                        ◊ {exec.tool_name}
                      </span>
                      <span
                        className={`text-[10px] font-mono font-bold uppercase flex items-center gap-1 ${
                          exec.status === "success"
                            ? "text-emerald-400"
                            : "text-red-400"
                        }`}
                      >
                        {exec.status === "success" ? (
                          <CheckCircle2 size={12} />
                        ) : (
                          <AlertCircle size={12} />
                        )}
                        {exec.status}
                      </span>
                    </div>

                    {pdfUrl && (
                      <a
                        href={pdfUrl}
                        download
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2.5 rounded-lg bg-red-600/25 border border-red-500/40 flex items-center justify-between text-xs text-red-100 no-underline"
                      >
                        <span className="font-mono font-semibold flex items-center gap-1.5">
                          <FileText size={14} className="text-red-400" />
                          Download PDF Deliverable
                        </span>
                        <Download size={13} />
                      </a>
                    )}

                    {docxUrl && (
                      <a
                        href={docxUrl}
                        download
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2.5 rounded-lg bg-blue-600/25 border border-blue-500/40 flex items-center justify-between text-xs text-blue-100 no-underline"
                      >
                        <span className="font-mono font-semibold flex items-center gap-1.5">
                          <Download size={14} className="text-blue-400" />
                          Download Word (.DOCX) Redline
                        </span>
                        <span className="text-[10px] font-mono">.DOCX</span>
                      </a>
                    )}

                    <pre className="p-2.5 rounded-lg bg-black/60 border border-white/10 text-[10px] font-mono text-zinc-300 max-h-60 overflow-y-auto custom-scrollbar whitespace-pre-wrap">
                      {JSON.stringify(exec.result, null, 2)}
                    </pre>
                  </div>
                );
              })
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}

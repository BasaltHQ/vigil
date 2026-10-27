"use client";

import React, { useEffect, useRef, useState, useCallback, useMemo } from "react";
import * as d3 from "d3";

export interface AgentMeta {
  id: string;
  name: string;
  role: string;
  division: string;
  accent: string;
  tools: string[];
  isCoordinator?: boolean;
}

export interface SwarmRoster {
  name: string;
  subtitle: string;
  accent: string;
  coordinator: AgentMeta;
  specialists: AgentMeta[];
}

export const SWARM_ROSTERS: Record<string, SwarmRoster> = {
  corporate: {
    name: "Corporate & M&A Swarm",
    subtitle: "AmLaw 10 Transactional, Securities & Venture Practice",
    accent: "#dc2626",
    coordinator: {
      id: "keyes",
      name: "Keyes",
      role: "Senior Managing Partner & Orchestrator",
      division: "COMMAND CORE",
      accent: "#ef4444",
      tools: ["handoff_to_agent", "redline_document", "evaluate_against_playbook", "draft_structured_document"],
      isCoordinator: true,
    },
    specialists: [
      { id: "ohara", name: "O'Hara", role: "Senior Commercial & Redline Counsel", division: "CONTRACTS", accent: "#f87171", tools: ["redline_document", "compare_document_versions", "generate_clean_execution_version"] },
      { id: "neff", name: "Neff", role: "M&A Due Diligence & Playbook Director", division: "M&A AUDIT", accent: "#fb923c", tools: ["extract_and_audit_clauses", "evaluate_against_playbook", "manage_closing_checklist"] },
      { id: "spade", name: "Spade", role: "Deal Structuring & Red-Flag Lead", division: "DILIGENCE", accent: "#fbbf24", tools: ["generate_diligence_red_flag_report", "manage_closing_checklist"] },
      { id: "bannister", name: "Bannister", role: "SEC & Blue Sky Securities Counsel", division: "SECURITIES", accent: "#38bdf8", tools: ["prepare_sec_form_d_and_blue_sky", "search_laws"] },
      { id: "cairo", name: "Cairo", role: "Venture Financing & Cap Table Architect", division: "VENTURE / CAP", accent: "#a78bfa", tools: ["model_cap_table_and_dilution", "calculate_vesting_and_83b"] },
      { id: "gutman", name: "Gutman", role: "Private Equity & Waterfall Strategist", division: "WATERFALL", accent: "#e879f9", tools: ["model_liquidation_waterfall", "model_cap_table_and_dilution"] },
      { id: "marlowe", name: "Marlowe", role: "FinCEN CTA, AML/KYC & OFAC Counsel", division: "COMPLIANCE", accent: "#34d399", tools: ["run_aml_kyc_and_cta_audit", "generate_privacy_ropa_and_dpia"] },
      { id: "gittes", name: "Gittes", role: "Commercial Litigation & Bluebook Lead", division: "LITIGATION", accent: "#60a5fa", tools: ["verify_and_format_bluebook_citations", "generate_privilege_log", "calculate_litigation_deadlines"] },
      { id: "archer", name: "Archer", role: "Executive Comp & 83(b) Specialist", division: "EMPLOYMENT", accent: "#2dd4bf", tools: ["calculate_vesting_and_83b", "redline_document"] },
      { id: "vance", name: "Vance", role: "IP Clearance, Patent & Privacy Counsel", division: "IP & PRIVACY", accent: "#818cf8", tools: ["run_trademark_clearance_analysis", "generate_patent_claim_chart", "generate_privacy_ropa_and_dpia"] },
      { id: "queen", name: "Queen", role: "Cross-Border Tax & International Structuring", division: "TAX / INT'L", accent: "#f472b6", tools: ["evaluate_against_playbook", "draft_structured_document"] },
      { id: "hammer", name: "Hammer", role: "Dispute Resolution & Examination Lead", division: "TRIAL / DEPO", accent: "#fb7185", tools: ["draft_examination_outline", "calculate_litigation_deadlines", "stage_esignature_execution_packet"] },
    ],
  },
  criminal: {
    name: "Criminal Defense & Investigations",
    subtitle: "White-Collar, Constitutional & Trial Practice",
    accent: "#ef4444",
    coordinator: {
      id: "holmes",
      name: "Holmes",
      role: "Lead Defense Strategist",
      division: "COMMAND CORE",
      accent: "#ef4444",
      tools: ["handoff_to_agent", "verify_and_format_bluebook_citations", "draft_examination_outline"],
      isCoordinator: true,
    },
    specialists: [
      { id: "poirot", name: "Poirot", role: "Forensic Evidence Analyst", division: "EVIDENCE", accent: "#f87171", tools: ["generate_privilege_log", "extract_and_audit_clauses"] },
      { id: "marple", name: "Marple", role: "Witness Credibility & Depo Lead", division: "WITNESSES", accent: "#fb923c", tools: ["draft_examination_outline"] },
      { id: "columbo", name: "Columbo", role: "4th/5th Amendment Constitutional", division: "MOTIONS", accent: "#38bdf8", tools: ["verify_and_format_bluebook_citations", "search_laws"] },
      { id: "perry", name: "Perry", role: "Trial Advocacy & Cross-Examination", division: "TRIAL", accent: "#fbbf24", tools: ["draft_examination_outline", "calculate_litigation_deadlines"] },
      { id: "mccoy", name: "McCoy", role: "Prosecutorial Strategy & Plea Matrix", division: "PLEA / RISK", accent: "#a78bfa", tools: ["evaluate_against_playbook"] },
      { id: "wolfe", name: "Wolfe", role: "Sentencing Guidelines & Mitigation", division: "SENTENCING", accent: "#34d399", tools: ["calculate_litigation_deadlines"] },
      { id: "morse", name: "Morse", role: "White-Collar & FinCEN Investigations", division: "WHITE COLLAR", accent: "#60a5fa", tools: ["run_aml_kyc_and_cta_audit"] },
      { id: "chan", name: "Chan", role: "Jury Selection & Voir Dire", division: "VOIR DIRE", accent: "#f472b6", tools: ["draft_examination_outline"] },
      { id: "dupin", name: "Dupin", role: "Appellate Briefs & Bluebook Audit", division: "APPELLATE", accent: "#818cf8", tools: ["verify_and_format_bluebook_citations", "draft_structured_document"] },
      { id: "brown", name: "Brown", role: "Restorative Justice & Diversion", division: "MITIGATION", accent: "#2dd4bf", tools: ["stage_esignature_execution_packet"] },
    ],
  },
  family: {
    name: "Family Law & Matrimonial Wealth",
    subtitle: "High-Net-Worth Asset Division, Custody & Prenuptial Practice",
    accent: "#ec4899",
    coordinator: {
      id: "bennet",
      name: "Bennet",
      role: "Matrimonial Managing Partner",
      division: "COMMAND CORE",
      accent: "#ec4899",
      tools: ["handoff_to_agent", "redline_document", "draft_structured_document"],
      isCoordinator: true,
    },
    specialists: [
      { id: "eyre", name: "Eyre", role: "Custody & Parenting Plan Specialist", division: "CUSTODY", accent: "#f472b6", tools: ["redline_document", "draft_structured_document"] },
      { id: "earnshaw", name: "Earnshaw", role: "Complex Asset & Business Valuation", division: "VALUATION", accent: "#fb923c", tools: ["model_cap_table_and_dilution", "model_liquidation_waterfall"] },
      { id: "dashwood", name: "Dashwood", role: "Spousal & Child Support Modeling", division: "SUPPORT", accent: "#38bdf8", tools: ["generate_legal_invoice_and_roi"] },
      { id: "march", name: "March", role: "Mediation & Settlement Redlining", division: "MEDIATION", accent: "#34d399", tools: ["redline_document", "compare_document_versions"] },
      { id: "rochester", name: "Rochester", role: "Protective Orders & Emergency Relief", division: "EMERGENCY", accent: "#f87171", tools: ["calculate_litigation_deadlines"] },
      { id: "woodhouse", name: "Woodhouse", role: "Adoption & Surrogacy Agreements", division: "ADOPTION", accent: "#a78bfa", tools: ["stage_esignature_execution_packet"] },
      { id: "darcy", name: "Darcy", role: "Prenuptial & Postnuptial Playbooks", division: "PRENUP", accent: "#fbbf24", tools: ["evaluate_against_playbook", "redline_document"] },
      { id: "knightley", name: "Knightley", role: "Post-Decree Modification & Enforcement", division: "MODIFICATION", accent: "#60a5fa", tools: ["verify_and_format_bluebook_citations"] },
      { id: "ferrars", name: "Ferrars", role: "Juvenile Dependency & Guardian Law", division: "GUARDIAN", accent: "#2dd4bf", tools: ["draft_structured_document"] },
      { id: "brandon", name: "Brandon", role: "Military Divorce & Federal Benefits", division: "MILITARY", accent: "#818cf8", tools: ["search_laws"] },
      { id: "tilney", name: "Tilney", role: "Trusts, Estates & Elder Care", division: "ESTATES", accent: "#e879f9", tools: ["extract_and_audit_clauses"] },
    ],
  },
  immigration: {
    name: "Global Mobility & Immigration",
    subtitle: "Employment Visas, Investor Structuring & Removal Defense",
    accent: "#06b6d4",
    coordinator: {
      id: "polo",
      name: "Polo",
      role: "Global Mobility Practice Head",
      division: "COMMAND CORE",
      accent: "#06b6d4",
      tools: ["handoff_to_agent", "draft_structured_document", "manage_closing_checklist"],
      isCoordinator: true,
    },
    specialists: [
      { id: "magellan", name: "Magellan", role: "H-1B, L-1 & O-1 Business Visas", division: "EMPLOYMENT", accent: "#38bdf8", tools: ["manage_closing_checklist", "draft_structured_document"] },
      { id: "columbus", name: "Columbus", role: "Family-Based Petitions & Consular", division: "FAMILY VISA", accent: "#34d399", tools: ["stage_esignature_execution_packet"] },
      { id: "darwin", name: "Darwin", role: "EB-1/EB-2 NIW Extraordinary Ability", division: "EB-1 / NIW", accent: "#a78bfa", tools: ["verify_and_format_bluebook_citations", "draft_structured_document"] },
      { id: "earhart", name: "Earhart", role: "Asylum & Humanitarian Relief", division: "ASYLUM", accent: "#f472b6", tools: ["draft_examination_outline"] },
      { id: "shackleton", name: "Shackleton", role: "Deportation & EOIR Court Defense", division: "REMOVAL", accent: "#f87171", tools: ["calculate_litigation_deadlines", "verify_and_format_bluebook_citations"] },
      { id: "cook", name: "Cook", role: "I-9 Audit & Workforce Compliance", division: "COMPLIANCE", accent: "#fbbf24", tools: ["run_aml_kyc_and_cta_audit", "evaluate_against_playbook"] },
      { id: "vespucci", name: "Vespucci", role: "Naturalization & Derivative Citizenship", division: "CITIZENSHIP", accent: "#60a5fa", tools: ["manage_closing_checklist"] },
      { id: "drake", name: "Drake", role: "EB-5 & E-2 Treaty Investor Structuring", division: "INVESTOR", accent: "#e879f9", tools: ["model_cap_table_and_dilution", "run_aml_kyc_and_cta_audit"] },
      { id: "livingstone", name: "Livingstone", role: "Consular Processing & Waivers", division: "CONSULAR", accent: "#2dd4bf", tools: ["draft_structured_document"] },
      { id: "hudson", name: "Hudson", role: "F-1, J-1 & Academic Exchange", division: "ACADEMIC", accent: "#818cf8", tools: ["search_laws"] },
      { id: "lewis", name: "Lewis", role: "BIA Appeals & Federal Mandamus", division: "APPEALS", accent: "#fb923c", tools: ["verify_and_format_bluebook_citations"] },
    ],
  },
  real_estate: {
    name: "Commercial Real Estate & Land Use",
    subtitle: "Acquisitions, Leasing, REITs & Environmental Diligence",
    accent: "#f59e0b",
    coordinator: {
      id: "earp",
      name: "Earp",
      role: "Real Estate Practice Chair",
      division: "COMMAND CORE",
      accent: "#f59e0b",
      tools: ["handoff_to_agent", "redline_document", "manage_closing_checklist"],
      isCoordinator: true,
    },
    specialists: [
      { id: "hickok", name: "Hickok", role: "Purchase & Sale Agreement Redlining", division: "ACQUISITIONS", accent: "#fbbf24", tools: ["redline_document", "evaluate_against_playbook"] },
      { id: "oakley", name: "Oakley", role: "Commercial Office & Retail Leasing", division: "LEASING", accent: "#f87171", tools: ["redline_document", "extract_and_audit_clauses"] },
      { id: "cody", name: "Cody", role: "Zoning, Entitlements & Land Use", division: "ZONING", accent: "#34d399", tools: ["search_laws", "generate_diligence_red_flag_report"] },
      { id: "cassidy", name: "Cassidy", role: "CMBS, Mezzanine & Construction Finance", division: "FINANCE", accent: "#38bdf8", tools: ["model_liquidation_waterfall", "manage_closing_checklist"] },
      { id: "holliday", name: "Holliday", role: "Title Defect, ALTA Survey & Quiet Title", division: "TITLE", accent: "#a78bfa", tools: ["generate_diligence_red_flag_report"] },
      { id: "masterson", name: "Masterson", role: "AIA Construction & Mechanic's Liens", division: "CONSTRUCTION", accent: "#fb923c", tools: ["redline_document", "calculate_litigation_deadlines"] },
      { id: "garrett", name: "Garrett", role: "Unlawful Detainer & Lease Litigation", division: "LITIGATION", accent: "#60a5fa", tools: ["calculate_litigation_deadlines", "draft_examination_outline"] },
      { id: "horn", name: "Horn", role: "Phase I/II Environmental & CERCLA", division: "ENVIRON", accent: "#2dd4bf", tools: ["generate_diligence_red_flag_report"] },
      { id: "starr", name: "Starr", role: "1031 Exchanges & Opportunity Zones", division: "TAX / 1031", accent: "#e879f9", tools: ["model_cap_table_and_dilution"] },
      { id: "james", name: "James", role: "CC&Rs, Condo & Planned Development", division: "HOA / DEV", accent: "#818cf8", tools: ["extract_and_audit_clauses"] },
      { id: "younger", name: "Younger", role: "Eminent Domain & Condemnation", division: "TAKINGS", accent: "#f472b6", tools: ["verify_and_format_bluebook_citations"] },
    ],
  },
  ip_entertainment: {
    name: "IP, Patent & Entertainment",
    subtitle: "Patent Litigation, USPTO Clearance, Licensing & Media Deals",
    accent: "#8b5cf6",
    coordinator: {
      id: "selznick",
      name: "Selznick",
      role: "IP & Media Practice Chair",
      division: "COMMAND CORE",
      accent: "#8b5cf6",
      tools: ["handoff_to_agent", "generate_patent_claim_chart", "run_trademark_clearance_analysis"],
      isCoordinator: true,
    },
    specialists: [
      { id: "goldwyn", name: "Goldwyn", role: "Patent Prosecution & Claim Charts", division: "PATENTS", accent: "#a78bfa", tools: ["generate_patent_claim_chart", "verify_and_format_bluebook_citations"] },
      { id: "mayer", name: "Mayer", role: "USPTO Trademark Clearance & Madrid", division: "TRADEMARKS", accent: "#38bdf8", tools: ["run_trademark_clearance_analysis"] },
      { id: "zanuck", name: "Zanuck", role: "Copyright, DMCA & Fair Use", division: "COPYRIGHT", accent: "#f472b6", tools: ["evaluate_against_playbook", "redline_document"] },
      { id: "warner", name: "Warner", role: "Talent, Guild & Production Agreements", division: "TALENT", accent: "#fbbf24", tools: ["redline_document", "stage_esignature_execution_packet"] },
      { id: "thalberg", name: "Thalberg", role: "Music Publishing & Master Licensing", division: "MUSIC", accent: "#34d399", tools: ["extract_and_audit_clauses", "redline_document"] },
      { id: "cohn", name: "Cohn", role: "Film Finance & Distribution Waterfalls", division: "DISTRIBUTION", accent: "#fb923c", tools: ["model_liquidation_waterfall"] },
      { id: "laemmle", name: "Laemmle", role: "Trade Secrets & DTSA Litigation", division: "TRADE SECRET", accent: "#f87171", tools: ["generate_privilege_log", "calculate_litigation_deadlines"] },
      { id: "zukor", name: "Zukor", role: "Right of Publicity & NIL Endorsements", division: "NIL / MEDIA", accent: "#60a5fa", tools: ["redline_document"] },
      { id: "fox", name: "Fox", role: "SaaS, Open-Source & AI Training Licensing", division: "SOFTWARE IP", accent: "#2dd4bf", tools: ["evaluate_against_playbook", "generate_privacy_ropa_and_dpia"] },
      { id: "disney", name: "Disney", role: "Global Merchandising & Franchise", division: "FRANCHISE", accent: "#e879f9", tools: ["run_trademark_clearance_analysis"] },
      { id: "universal", name: "Universal", role: "FCC, Defamation & First Amendment", division: "FIRST AMEND", accent: "#818cf8", tools: ["verify_and_format_bluebook_citations"] },
    ],
  },
  personal_injury: {
    name: "Plaintiff & Mass Tort Litigation",
    subtitle: "Catastrophic Injury, Medical Malpractice & Trial Damages",
    accent: "#10b981",
    coordinator: {
      id: "house",
      name: "House",
      role: "Chief Trial & Medical Strategist",
      division: "COMMAND CORE",
      accent: "#10b981",
      tools: ["handoff_to_agent", "calculate_litigation_deadlines", "draft_examination_outline"],
      isCoordinator: true,
    },
    specialists: [
      { id: "grey", name: "Grey", role: "Motor Vehicle & Commercial Trucking", division: "AUTO / DOT", accent: "#34d399", tools: ["calculate_litigation_deadlines", "generate_privilege_log"] },
      { id: "welby", name: "Welby", role: "Medical Malpractice & Standard of Care", division: "MED MAL", accent: "#38bdf8", tools: ["draft_examination_outline"] },
      { id: "quincy", name: "Quincy", role: "Product Liability & Mass Tort MDL", division: "MASS TORT", accent: "#f87171", tools: ["generate_diligence_red_flag_report", "verify_and_format_bluebook_citations"] },
      { id: "trapper", name: "Trapper", role: "Premises Liability & Negligent Security", division: "PREMISES", accent: "#fbbf24", tools: ["draft_examination_outline"] },
      { id: "kildare", name: "Kildare", role: "Workers' Comp & Third-Party Claims", division: "WORK COMP", accent: "#a78bfa", tools: ["calculate_litigation_deadlines"] },
      { id: "pierce", name: "Pierce", role: "Wrongful Death & Survival Damages", division: "CATASTROPHIC", accent: "#fb923c", tools: ["model_liquidation_waterfall"] },
      { id: "carter", name: "Carter", role: "TBI, Neuro-Trauma & Life Care Plans", division: "NEURO / TBI", accent: "#60a5fa", tools: ["draft_examination_outline"] },
      { id: "ross", name: "Ross", role: "Bad Faith Insurance & Policy Limits", division: "BAD FAITH", accent: "#e879f9", tools: ["evaluate_against_playbook", "redline_document"] },
      { id: "shepherd", name: "Shepherd", role: "Economic Damages & Structured Settlements", division: "DAMAGES", accent: "#2dd4bf", tools: ["generate_legal_invoice_and_roi"] },
      { id: "kovac", name: "Kovac", role: "Nursing Home Abuse & Elder Neglect", division: "ELDER LAW", accent: "#f472b6", tools: ["extract_and_audit_clauses"] },
      { id: "greene", name: "Greene", role: "Mediation Briefs & Demand Packages", division: "SETTLEMENT", accent: "#818cf8", tools: ["draft_structured_document", "stage_esignature_execution_packet"] },
    ],
  },
};

interface ConstellationGraphV2Props {
  swarmId?: string;
  activeAgents?: string[];
  onAgentSelect?: (agent: AgentMeta) => void;
  onTriggerQuickPrompt?: (prompt: string) => void;
}

interface LiveAgentTelemetry {
  state: "idle" | "thinking" | "working" | "tool_call" | "collaborating" | "completed" | "error";
  message?: string;
  tool?: string;
  target?: string;
  updatedAt: number;
}

interface PulseArc {
  id: string;
  sourceId: string;
  targetId: string;
  color: string;
  label?: string;
  createdAt: number;
}

export default function ConstellationGraphV2({
  swarmId = "corporate",
  activeAgents = [],
  onAgentSelect,
  onTriggerQuickPrompt,
}: ConstellationGraphV2Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const roster = useMemo(
    () => SWARM_ROSTERS[swarmId] || SWARM_ROSTERS.corporate,
    [swarmId]
  );

  const [dimensions, setDimensions] = useState({ width: 520, height: 520 });
  const [selectedAgent, setSelectedAgent] = useState<AgentMeta | null>(null);
  const [hoveredAgentId, setHoveredAgentId] = useState<string | null>(null);
  const [telemetryMap, setTelemetryMap] = useState<Record<string, LiveAgentTelemetry>>({});
  const [pulseArcs, setPulseArcs] = useState<PulseArc[]>([]);
  const [isSimulating, setIsSimulating] = useState(false);
  const [opsCount, setOpsCount] = useState(0);
  const simIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Measure container size responsively
  useEffect(() => {
    const updateDims = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      if (rect.width > 80 && rect.height > 80) {
        setDimensions({ width: rect.width, height: rect.height });
      }
    };
    updateDims();
    const obs = new ResizeObserver(updateDims);
    if (containerRef.current) obs.observe(containerRef.current);
    window.addEventListener("resize", updateDims);
    return () => {
      obs.disconnect();
      window.removeEventListener("resize", updateDims);
    };
  }, []);

  // Compute node coordinates (Coordinator at center, Specialists on orbital perimeter)
  const nodePositions = useMemo(() => {
    const cx = dimensions.width / 2;
    const cy = dimensions.height / 2;
    const radius = Math.min(dimensions.width, dimensions.height) * 0.36;

    const map: Record<
      string,
      { x: number; y: number; angle: number; meta: AgentMeta }
    > = {};

    map[roster.coordinator.id] = {
      x: cx,
      y: cy,
      angle: 0,
      meta: roster.coordinator,
    };

    const count = roster.specialists.length;
    roster.specialists.forEach((spec, idx) => {
      const angle = (idx / count) * 2 * Math.PI - Math.PI / 2;
      map[spec.id] = {
        x: cx + radius * Math.cos(angle),
        y: cy + radius * Math.sin(angle),
        angle,
        meta: spec,
      };
    });

    return { cx, cy, radius, map };
  }, [dimensions, roster]);

  // Helper to resolve agent ID by name or ID
  const resolveAgentId = useCallback(
    (rawName?: string): string | null => {
      if (!rawName) return null;
      const clean = rawName.toLowerCase().replace(/[^a-z0-9]/g, "");
      if (roster.coordinator.id === clean || roster.coordinator.name.toLowerCase().replace(/[^a-z0-9]/g, "") === clean) {
        return roster.coordinator.id;
      }
      const found = roster.specialists.find(
        (s) =>
          s.id === clean ||
          s.name.toLowerCase().replace(/[^a-z0-9]/g, "") === clean
      );
      return found ? found.id : roster.coordinator.id;
    },
    [roster]
  );

  // Trigger a high-luminance energy pulse arc between two nodes
  const spawnPulseArc = useCallback(
    (sourceId: string, targetId: string, color: string, label?: string) => {
      const id = `arc-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      setPulseArcs((prev) => [
        ...prev.slice(-8),
        { id, sourceId, targetId, color, label, createdAt: Date.now() },
      ]);
      setOpsCount((c) => c + 1);

      // Clean up arc after 2.6 seconds
      setTimeout(() => {
        setPulseArcs((prev) => prev.filter((a) => a.id !== id));
      }, 2600);
    },
    []
  );

  // Listen to global basalt swarm events (100% compatible with existing backend & chat page)
  useEffect(() => {
    const handleStateChange = (e: Event) => {
      const detail = (e as CustomEvent).detail || {};
      const agentId = resolveAgentId(detail.agent);
      if (!agentId) return;

      const action = detail.action || "thinking";
      const mappedState: LiveAgentTelemetry["state"] =
        action === "tool_call" || action === "processing_document"
          ? "tool_call"
          : action === "collaborating" || action === "handoff"
          ? "collaborating"
          : action === "completed" || action === "task_completed"
          ? "completed"
          : action === "error"
          ? "error"
          : action === "responding" || action === "working"
          ? "working"
          : "thinking";

      setTelemetryMap((prev) => ({
        ...prev,
        [agentId]: {
          state: mappedState,
          message: detail.message,
          tool: detail.tool,
          target: detail.target,
          updatedAt: Date.now(),
        },
      }));

      // Spawn synaptic arc from Coordinator to Specialist or between collaborating agents
      const targetId = detail.target ? resolveAgentId(detail.target) : null;
      const nodeMeta = nodePositions.map[agentId]?.meta;
      const color = nodeMeta?.accent || roster.accent;

      if (targetId && targetId !== agentId) {
        spawnPulseArc(agentId, targetId, color, detail.tool || detail.action);
      } else if (agentId !== roster.coordinator.id) {
        spawnPulseArc(roster.coordinator.id, agentId, color, detail.tool || detail.action);
      } else {
        // Coordinator calling a tool: pick a relevant specialist based on tool name
        const matchingSpec = roster.specialists.find((s) =>
          detail.tool ? s.tools.includes(detail.tool) : false
        );
        if (matchingSpec) {
          spawnPulseArc(roster.coordinator.id, matchingSpec.id, matchingSpec.accent, detail.tool);
          setTelemetryMap((prev) => ({
            ...prev,
            [matchingSpec.id]: {
              state: "tool_call",
              message: `Executing ${detail.tool}`,
              tool: detail.tool,
              updatedAt: Date.now(),
            },
          }));
        }
      }
    };

    const handleTaskStart = () => {
      const coordId = roster.coordinator.id;
      setTelemetryMap((prev) => ({
        ...prev,
        [coordId]: {
          state: "thinking",
          message: "Initializing Swarm Command Protocol...",
          updatedAt: Date.now(),
        },
      }));
    };

    const handleTaskEnd = () => {
      setTelemetryMap({});
    };

    window.addEventListener("basalt-agent-state-change", handleStateChange);
    window.addEventListener("basalt-task-start", handleTaskStart);
    window.addEventListener("basalt-task-end", handleTaskEnd);

    return () => {
      window.removeEventListener("basalt-agent-state-change", handleStateChange);
      window.removeEventListener("basalt-task-start", handleTaskStart);
      window.removeEventListener("basalt-task-end", handleTaskEnd);
    };
  }, [resolveAgentId, nodePositions.map, roster, spawnPulseArc]);

  // Built-in Swarm Choreography Simulator so the user can test & admire the animation on demand
  const toggleSimulation = useCallback(() => {
    if (isSimulating) {
      if (simIntervalRef.current) clearInterval(simIntervalRef.current);
      simIntervalRef.current = null;
      setIsSimulating(false);
      setTelemetryMap({});
      setPulseArcs([]);
      return;
    }

    setIsSimulating(true);
    const coord = roster.coordinator;
    const specs = roster.specialists;

    // Immediate opening salvo from Coordinator
    setTelemetryMap({
      [coord.id]: {
        state: "collaborating",
        message: "Orchestrating multi-specialist legal workflow...",
        tool: "handoff_to_agent",
        updatedAt: Date.now(),
      },
    });

    let step = 0;
    const runChoreographyStep = () => {
      const specA = specs[step % specs.length];
      const specB = specs[(step + 3) % specs.length];
      const toolA = specA.tools[0] || "redline_document";
      const toolB = specB.tools[0] || "evaluate_against_playbook";

      // 1. Coordinator -> SpecA handoff
      spawnPulseArc(coord.id, specA.id, specA.accent, toolA);

      setTelemetryMap((prev) => ({
        ...prev,
        [coord.id]: {
          state: "collaborating",
          message: `Delegating ${toolA} to ${specA.name}`,
          tool: "handoff_to_agent",
          updatedAt: Date.now(),
        },
        [specA.id]: {
          state: "tool_call",
          message: `Executing ${toolA}...`,
          tool: toolA,
          updatedAt: Date.now(),
        },
      }));

      // 2. SpecA -> SpecB lateral verification pulse 650ms later
      setTimeout(() => {
        spawnPulseArc(specA.id, specB.id, specB.accent, toolB);
        setTelemetryMap((prev) => ({
          ...prev,
          [specB.id]: {
            state: "thinking",
            message: `Cross-checking ${specA.division} output via ${toolB}`,
            tool: toolB,
            updatedAt: Date.now(),
          },
        }));
      }, 650);

      // 3. Return synthesis arc to Coordinator 1300ms later
      setTimeout(() => {
        spawnPulseArc(specB.id, coord.id, coord.accent, "synthesis_complete");
        setTelemetryMap((prev) => ({
          ...prev,
          [specA.id]: {
            state: "completed",
            message: `${toolA} verified`,
            updatedAt: Date.now(),
          },
        }));
      }, 1300);

      step++;
    };

    runChoreographyStep();
    simIntervalRef.current = setInterval(runChoreographyStep, 2200);
  }, [isSimulating, roster, spawnPulseArc]);

  useEffect(() => {
    return () => {
      if (simIntervalRef.current) clearInterval(simIntervalRef.current);
    };
  }, []);

  // Compute curved Quadratic Bezier path between any two nodes
  const computeCurvedPath = useCallback(
    (sourceId: string, targetId: string) => {
      const s = nodePositions.map[sourceId];
      const t = nodePositions.map[targetId];
      if (!s || !t) return "";

      const mx = (s.x + t.x) / 2;
      const my = (s.y + t.y) / 2;
      const dx = t.x - s.x;
      const dy = t.y - s.y;
      const dist = Math.hypot(dx, dy) || 1;

      // Subtle perpendicular curvature pulled slightly toward/around center
      const bend = sourceId === roster.coordinator.id || targetId === roster.coordinator.id ? 0.14 : 0.22;
      const cx = mx - dy * bend;
      const cy = my + dx * bend;

      return `M ${s.x.toFixed(1)} ${s.y.toFixed(1)} Q ${cx.toFixed(1)} ${cy.toFixed(1)} ${t.x.toFixed(1)} ${t.y.toFixed(1)}`;
    },
    [nodePositions.map, roster.coordinator.id]
  );

  // Determine if an agent is currently active via props or telemetry
  const isNodeActive = useCallback(
    (agent: AgentMeta) => {
      const inProps = activeAgents.some(
        (a) =>
          a.toLowerCase().replace(/[^a-z0-9]/g, "") === agent.id ||
          a.toLowerCase() === agent.name.toLowerCase()
      );
      const t = telemetryMap[agent.id];
      const inTelemetry =
        t &&
        t.state !== "idle" &&
        t.state !== "completed" &&
        Date.now() - t.updatedAt < 15000;
      return inProps || Boolean(inTelemetry);
    },
    [activeAgents, telemetryMap]
  );

  const activeCount = useMemo(() => {
    const all = [roster.coordinator, ...roster.specialists];
    return all.filter((a) => isNodeActive(a)).length;
  }, [roster, isNodeActive]);

  const { cx, cy, radius } = nodePositions;

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full min-h-[380px] select-none overflow-hidden bg-[#050608] flex flex-col"
    >
      {/* Ambient Radial Depth Field */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: `
            radial-gradient(circle at 50% 50%, ${roster.accent}14 0%, rgba(12, 15, 22, 0.65) 48%, #040507 100%),
            linear-gradient(180deg, rgba(255,255,255,0.02) 0%, transparent 25%, transparent 75%, rgba(255,255,255,0.015) 100%)
          `,
        }}
      />

      {/* Precision Tactical Top Overlay Bar */}
      <div className="relative z-10 flex items-center justify-between px-4 py-2.5 border-b border-white/[0.06] bg-black/40 backdrop-blur-md">
        <div className="flex items-center gap-2.5 min-w-0">
          <span
            className="w-2 h-2 rounded-full flex-shrink-0"
            style={{
              backgroundColor: activeCount > 0 ? "#22c55e" : roster.accent,
              boxShadow: `0 0 10px ${activeCount > 0 ? "#22c55e" : roster.accent}`,
            }}
          />
          <div className="truncate">
            <div className="text-[11px] font-bold tracking-[0.16em] uppercase text-white font-mono truncate">
              {roster.name}
            </div>
            <div className="text-[9px] text-zinc-400 tracking-wider uppercase truncate">
              {roster.subtitle}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="hidden sm:flex items-center gap-3 px-2.5 py-1 rounded-md bg-white/[0.03] border border-white/[0.07] text-[10px] font-mono">
            <span className="text-zinc-400">
              NODES <strong className="text-white">{roster.specialists.length + 1}</strong>
            </span>
            <span className="text-zinc-700">|</span>
            <span className="text-zinc-400">
              ACTIVE <strong className="text-emerald-400">{activeCount}</strong>
            </span>
            <span className="text-zinc-700">|</span>
            <span className="text-zinc-400">
              PULSES <strong className="text-red-400">{opsCount}</strong>
            </span>
          </div>

          <button
            type="button"
            onClick={toggleSimulation}
            className={`px-2.5 py-1 rounded-md text-[10px] font-mono uppercase tracking-wider transition-all border ${
              isSimulating
                ? "bg-red-600/25 border-red-500 text-red-200 shadow-[0_0_15px_rgba(239,68,68,0.35)]"
                : "bg-white/[0.04] hover:bg-white/[0.09] border-white/10 text-zinc-300 hover:text-white"
            }`}
            title="Simulate multi-agent legal workflow choreography"
          >
            {isSimulating ? "⏹ Stop Demo" : "⚡ Demo Swarm"}
          </button>
        </div>
      </div>

      {/* Main SVG Tactical Constellation Canvas */}
      <div className="relative flex-1 min-h-0">
        <svg
          ref={svgRef}
          width={dimensions.width}
          height={dimensions.height}
          viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
          className="w-full h-full block"
        >
          <defs>
            {/* High-precision glow filter */}
            <filter id="v2-glow" x="-60%" y="-60%" width="220%" height="220%">
              <feGaussianBlur stdDeviation="4" result="blur1" />
              <feGaussianBlur stdDeviation="9" result="blur2" />
              <feMerge>
                <feMergeNode in="blur2" />
                <feMergeNode in="blur1" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            <filter id="v2-subtle-glow" x="-40%" y="-40%" width="180%" height="180%">
              <feGaussianBlur stdDeviation="2.2" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            <radialGradient id="v2-core-halo" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor={roster.accent} stopOpacity="0.32" />
              <stop offset="55%" stopColor={roster.accent} stopOpacity="0.06" />
              <stop offset="100%" stopColor={roster.accent} stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* 1. CONCENTRIC TACTICAL RADAR RINGS & DEGREE BEZEL */}
          <g className="pointer-events-none">
            {/* Outer degree tick bezel */}
            {Array.from({ length: 72 }).map((_, i) => {
              const deg = i * 5;
              const rad = (deg * Math.PI) / 180;
              const isMajor = deg % 30 === 0;
              const rInner = radius * 1.17;
              const rOuter = radius * (isMajor ? 1.22 : 1.19);
              return (
                <line
                  key={i}
                  x1={cx + rInner * Math.cos(rad)}
                  y1={cy + rInner * Math.sin(rad)}
                  x2={cx + rOuter * Math.cos(rad)}
                  y2={cy + rOuter * Math.sin(rad)}
                  stroke={isMajor ? "rgba(255,255,255,0.18)" : "rgba(255,255,255,0.06)"}
                  strokeWidth={isMajor ? 1.2 : 0.75}
                />
              );
            })}

            {/* Outer specialist orbital track */}
            <circle
              cx={cx}
              cy={cy}
              r={radius}
              fill="none"
              stroke="rgba(255,255,255,0.09)"
              strokeWidth={1}
              strokeDasharray="3 6"
            />

            {/* Mid-range synaptic telemetry ring (slowly rotating) */}
            <circle
              cx={cx}
              cy={cy}
              r={radius * 0.64}
              fill="none"
              stroke={roster.accent}
              strokeOpacity={0.18}
              strokeWidth={1}
              strokeDasharray="12 8 2 8"
            >
              <animateTransform
                attributeName="transform"
                type="rotate"
                from={`0 ${cx} ${cy}`}
                to={`360 ${cx} ${cy}`}
                dur="80s"
                repeatCount="indefinite"
              />
            </circle>

            {/* Inner command perimeter ring */}
            <circle
              cx={cx}
              cy={cy}
              r={radius * 0.32}
              fill="none"
              stroke="rgba(255,255,255,0.08)"
              strokeWidth={1}
            />

            {/* Subtle cardinal crosshairs */}
            <line
              x1={cx - radius * 1.24}
              y1={cy}
              x2={cx + radius * 1.24}
              y2={cy}
              stroke="rgba(255,255,255,0.035)"
              strokeWidth={1}
            />
            <line
              x1={cx}
              y1={cy - radius * 1.24}
              x2={cx}
              y2={cy + radius * 1.24}
              stroke="rgba(255,255,255,0.035)"
              strokeWidth={1}
            />

            {/* Central Coordinator Halo */}
            <circle
              cx={cx}
              cy={cy}
              r={radius * 0.36}
              fill="url(#v2-core-halo)"
            />
          </g>

          {/* 2. PERIMETER ADJACENCY ARCS & CURVED SYNAPTIC SPOKES */}
          <g>
            {/* Subtle perimeter ring connecting adjacent specialists */}
            {roster.specialists.map((spec, idx) => {
              const nextSpec = roster.specialists[(idx + 1) % roster.specialists.length];
              const p1 = nodePositions.map[spec.id];
              const p2 = nodePositions.map[nextSpec.id];
              if (!p1 || !p2) return null;
              return (
                <line
                  key={`perim-${spec.id}`}
                  x1={p1.x}
                  y1={p1.y}
                  x2={p2.x}
                  y2={p2.y}
                  stroke="rgba(255,255,255,0.05)"
                  strokeWidth={0.8}
                />
              );
            })}

            {/* Curved Bezier spokes from Coordinator to each Specialist */}
            {roster.specialists.map((spec) => {
              const pathD = computeCurvedPath(roster.coordinator.id, spec.id);
              const active = isNodeActive(spec);
              const hovered =
                hoveredAgentId === spec.id || selectedAgent?.id === spec.id;

              return (
                <g key={`spoke-${spec.id}`}>
                  <path
                    d={pathD}
                    fill="none"
                    stroke={active || hovered ? spec.accent : "rgba(255,255,255,0.11)"}
                    strokeOpacity={active ? 0.75 : hovered ? 0.55 : 0.25}
                    strokeWidth={active ? 2 : hovered ? 1.5 : 1}
                    strokeDasharray={active ? "6 4" : undefined}
                    filter={active ? "url(#v2-subtle-glow)" : undefined}
                  >
                    {active && (
                      <animate
                        attributeName="stroke-dashoffset"
                        from="40"
                        to="0"
                        dur="1.4s"
                        repeatCount="indefinite"
                      />
                    )}
                  </path>
                </g>
              );
            })}
          </g>

          {/* 3. HIGH-LUMINANCE DYNAMIC PULSE ARCS & COMET PARTICLES */}
          <g>
            {pulseArcs.map((arc) => {
              const pathD = computeCurvedPath(arc.sourceId, arc.targetId);
              const targetPos = nodePositions.map[arc.targetId];
              if (!pathD || !targetPos) return null;

              return (
                <g key={arc.id}>
                  {/* Glowing energy arc */}
                  <path
                    d={pathD}
                    fill="none"
                    stroke={arc.color}
                    strokeWidth={2.6}
                    strokeOpacity={0.85}
                    filter="url(#v2-glow)"
                  />

                  {/* Lead Comet Core + 2 Trailing Afterglow Particles along the exact Bezier path */}
                  {[0, 0.12, 0.24].map((delay, idx) => (
                    <circle
                      key={idx}
                      r={idx === 0 ? 4.5 : idx === 1 ? 3 : 2}
                      fill={idx === 0 ? "#ffffff" : arc.color}
                      opacity={idx === 0 ? 1 : idx === 1 ? 0.75 : 0.45}
                      filter="url(#v2-glow)"
                    >
                      <animateMotion
                        dur="1.15s"
                        begin={`${delay}s`}
                        repeatCount="2"
                        path={pathD}
                      />
                    </circle>
                  ))}

                  {/* Destination Shockwave Ripple */}
                  <circle
                    cx={targetPos.x}
                    cy={targetPos.y}
                    r={16}
                    fill="none"
                    stroke={arc.color}
                    strokeWidth={2}
                  >
                    <animate
                      attributeName="r"
                      from="14"
                      to="38"
                      dur="1.15s"
                      repeatCount="2"
                    />
                    <animate
                      attributeName="opacity"
                      from="0.9"
                      to="0"
                      dur="1.15s"
                      repeatCount="2"
                    />
                  </circle>
                </g>
              );
            })}
          </g>

          {/* 4. SPECIALIST ORBITAL NODES */}
          <g>
            {roster.specialists.map((spec) => {
              const pos = nodePositions.map[spec.id];
              if (!pos) return null;

              const active = isNodeActive(spec);
              const telemetry = telemetryMap[spec.id];
              const isSelected = selectedAgent?.id === spec.id;
              const isHovered = hoveredAgentId === spec.id;
              const nodeR = active || isSelected ? 19 : isHovered ? 17.5 : 15.5;

              // Position label outward along radial angle
              const labelDist = nodeR + 18;
              const lx = pos.x + Math.cos(pos.angle) * labelDist;
              const ly = pos.y + Math.sin(pos.angle) * labelDist;

              return (
                <g
                  key={spec.id}
                  transform={`translate(${pos.x}, ${pos.y})`}
                  className="cursor-pointer"
                  onMouseEnter={() => setHoveredAgentId(spec.id)}
                  onMouseLeave={() => setHoveredAgentId(null)}
                  onClick={() => {
                    setSelectedAgent(spec);
                    onAgentSelect?.(spec);
                  }}
                >
                  {/* Active Rotating Tactical Ring */}
                  {(active || isSelected || isHovered) && (
                    <circle
                      r={nodeR + 6}
                      fill="none"
                      stroke={spec.accent}
                      strokeWidth={active ? 1.8 : 1.2}
                      strokeDasharray="8 5 2 5"
                      strokeOpacity={active ? 0.95 : 0.6}
                      filter={active ? "url(#v2-subtle-glow)" : undefined}
                    >
                      <animateTransform
                        attributeName="transform"
                        type="rotate"
                        from="0"
                        to="360"
                        dur={active ? "4s" : "12s"}
                        repeatCount="indefinite"
                      />
                    </circle>
                  )}

                  {/* Outer Precision Bezel */}
                  <circle
                    r={nodeR}
                    fill="#090b10"
                    stroke={active || isSelected ? spec.accent : "rgba(255,255,255,0.22)"}
                    strokeWidth={active || isSelected ? 2.2 : 1.3}
                    filter={active ? "url(#v2-subtle-glow)" : undefined}
                  />

                  {/* Inner Core Disc */}
                  <circle
                    r={nodeR - 4}
                    fill={active ? `${spec.accent}2e` : "rgba(255,255,255,0.03)"}
                    stroke={spec.accent}
                    strokeOpacity={active ? 0.8 : 0.35}
                    strokeWidth={1}
                  />

                  {/* Agent 2-Letter Monogram */}
                  <text
                    textAnchor="middle"
                    dominantBaseline="central"
                    fill={active || isHovered ? "#ffffff" : "#d4d4d8"}
                    fontSize={10}
                    fontWeight={700}
                    fontFamily="monospace"
                    letterSpacing="0.06em"
                  >
                    {spec.name.replace(/[^a-zA-Z]/g, "").slice(0, 2).toUpperCase()}
                  </text>

                  {/* Status LED dot on top-right rim */}
                  <circle
                    cx={nodeR * 0.7}
                    cy={-nodeR * 0.7}
                    r={3.2}
                    fill={
                      telemetry?.state === "tool_call"
                        ? "#f59e0b"
                        : active
                        ? "#22c55e"
                        : spec.accent
                    }
                    stroke="#050608"
                    strokeWidth={1.2}
                  />

                  {/* Specialist Name & Division Tag */}
                  <g transform={`translate(${lx - pos.x}, ${ly - pos.y})`}>
                    <rect
                      x={-42}
                      y={-11}
                      width={84}
                      height={24}
                      rx={5}
                      fill="rgba(7, 9, 14, 0.86)"
                      stroke={
                        active || isSelected
                          ? spec.accent
                          : "rgba(255,255,255,0.08)"
                      }
                      strokeWidth={active || isSelected ? 1 : 0.75}
                    />
                    <text
                      y={-1.5}
                      textAnchor="middle"
                      fill="#ffffff"
                      fontSize={9}
                      fontWeight={700}
                      fontFamily="Inter, sans-serif"
                      letterSpacing="0.08em"
                    >
                      {spec.name.toUpperCase()}
                    </text>
                    <text
                      y={8.5}
                      textAnchor="middle"
                      fill={spec.accent}
                      fontSize={7}
                      fontWeight={600}
                      fontFamily="monospace"
                      letterSpacing="0.08em"
                    >
                      {spec.division}
                    </text>
                  </g>

                  {/* Live Floating Tool Badge when calling a tool */}
                  {telemetry?.tool && active && (
                    <g transform="translate(0, -32)">
                      <rect
                        x={-58}
                        y={-9}
                        width={116}
                        height={16}
                        rx={8}
                        fill="#18181b"
                        stroke={spec.accent}
                        strokeWidth={1}
                      />
                      <text
                        y={1.5}
                        textAnchor="middle"
                        fill="#fde047"
                        fontSize={7.5}
                        fontFamily="monospace"
                        fontWeight={600}
                      >
                        ◊ {telemetry.tool.slice(0, 18)}
                      </text>
                    </g>
                  )}
                </g>
              );
            })}
          </g>

          {/* 5. CENTRAL COORDINATOR HEXAGONAL COMMAND REACTOR */}
          {(() => {
            const coord = roster.coordinator;
            const active = isNodeActive(coord);
            const hexRadius = 30;
            const outerHexRadius = 38;

            const hexPoints = (r: number) =>
              Array.from({ length: 6 })
                .map((_, i) => {
                  const a = (i * 60 - 30) * (Math.PI / 180);
                  return `${(r * Math.cos(a)).toFixed(1)},${(r * Math.sin(a)).toFixed(1)}`;
                })
                .join(" ");

            return (
              <g
                transform={`translate(${cx}, ${cy})`}
                className="cursor-pointer"
                onClick={() => {
                  setSelectedAgent(coord);
                  onAgentSelect?.(coord);
                }}
                onMouseEnter={() => setHoveredAgentId(coord.id)}
                onMouseLeave={() => setHoveredAgentId(null)}
              >
                {/* Rotating Outer Tactical Ring */}
                <circle
                  r={outerHexRadius + 6}
                  fill="none"
                  stroke={coord.accent}
                  strokeWidth={1.5}
                  strokeDasharray="14 6 4 6"
                  strokeOpacity={active ? 0.9 : 0.45}
                >
                  <animateTransform
                    attributeName="transform"
                    type="rotate"
                    from="360"
                    to="0"
                    dur={active ? "8s" : "24s"}
                    repeatCount="indefinite"
                  />
                </circle>

                {/* Outer Hexagon Armor */}
                <polygon
                  points={hexPoints(outerHexRadius)}
                  fill="rgba(10, 12, 18, 0.92)"
                  stroke={coord.accent}
                  strokeOpacity={0.5}
                  strokeWidth={1.4}
                />

                {/* Inner Command Hexagon */}
                <polygon
                  points={hexPoints(hexRadius)}
                  fill="#0c0e14"
                  stroke={coord.accent}
                  strokeWidth={2.4}
                  filter="url(#v2-glow)"
                />

                {/* Pulsing Reactor Center */}
                <circle
                  r={14}
                  fill={coord.accent}
                  fillOpacity={active ? 0.35 : 0.18}
                >
                  <animate
                    attributeName="r"
                    values={active ? "12;18;12" : "12;15;12"}
                    dur={active ? "1.6s" : "3.5s"}
                    repeatCount="indefinite"
                  />
                </circle>

                {/* Coordinator Title Inside Core */}
                <text
                  y={-2}
                  textAnchor="middle"
                  fill="#ffffff"
                  fontSize={10.5}
                  fontWeight={800}
                  fontFamily="Inter, sans-serif"
                  letterSpacing="0.12em"
                >
                  {coord.name.toUpperCase()}
                </text>
                <text
                  y={9}
                  textAnchor="middle"
                  fill={coord.accent}
                  fontSize={6.5}
                  fontWeight={700}
                  fontFamily="monospace"
                  letterSpacing="0.14em"
                >
                  ORCHESTRATOR
                </text>
              </g>
            );
          })()}
        </svg>

        {/* Interactive Selected Agent Dossier Card */}
        {selectedAgent && (
          <div className="absolute bottom-3 left-3 right-3 z-20 rounded-xl bg-[#090b10]/95 border border-white/15 p-3.5 shadow-2xl backdrop-blur-xl animate-slide-up">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center font-mono font-bold text-xs flex-shrink-0 border"
                  style={{
                    backgroundColor: `${selectedAgent.accent}1f`,
                    borderColor: `${selectedAgent.accent}66`,
                    color: selectedAgent.accent,
                  }}
                >
                  {selectedAgent.name.slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white uppercase tracking-wider">
                      {selectedAgent.name}
                    </span>
                    <span
                      className="text-[9px] font-mono px-1.5 py-0.5 rounded uppercase"
                      style={{
                        backgroundColor: `${selectedAgent.accent}20`,
                        color: selectedAgent.accent,
                      }}
                    >
                      {selectedAgent.division}
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-400 truncate">
                    {selectedAgent.role}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    spawnPulseArc(
                      roster.coordinator.id,
                      selectedAgent.id,
                      selectedAgent.accent,
                      selectedAgent.tools[0]
                    );
                    setTelemetryMap((prev) => ({
                      ...prev,
                      [selectedAgent.id]: {
                        state: "tool_call",
                        message: `Executing ${selectedAgent.tools[0]}`,
                        tool: selectedAgent.tools[0],
                        updatedAt: Date.now(),
                      },
                    }));
                  }}
                  className="px-2 py-1 rounded bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-[10px] font-mono text-zinc-200 transition-colors"
                >
                  ⚡ Pulse
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedAgent(null)}
                  className="px-2 py-1 rounded bg-white/[0.04] hover:bg-white/[0.1] text-zinc-400 hover:text-white text-xs"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Assigned AmLaw 10 Tools */}
            <div className="mt-2.5 pt-2 border-t border-white/[0.06] flex flex-wrap items-center gap-1.5">
              <span className="text-[9px] font-mono uppercase tracking-wider text-zinc-500 mr-1">
                Tools:
              </span>
              {selectedAgent.tools.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() =>
                    onTriggerQuickPrompt?.(
                      `Have ${selectedAgent.name} execute ${t} on our current matter.`
                    )
                  }
                  className="px-2 py-0.5 rounded bg-white/[0.04] hover:bg-white/[0.1] border border-white/[0.08] text-[10px] font-mono text-zinc-300 hover:text-white transition-colors"
                  title="Click to populate prompt for this specialist tool"
                >
                  ◊ {t}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

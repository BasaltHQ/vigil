"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  FileText,
  Search,
  Download,
  Eye,
  FileCheck2,
  ShieldAlert,
  Sparkles,
  Scale,
  X,
  Plus,
  Check,
  Edit3,
  MessageSquare,
  Share2,
  Users,
  Sliders,
  ArrowLeftRight,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  Swords,
  BookOpen,
  Table2,
  FolderKanban,
  Upload,
  Copy,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  Send,
  RotateCcw,
  Columns,
  Lock,
} from "lucide-react";

type WorkspaceMode = "ide" | "matrix" | "vault";
type PaneId = "navigator" | "canvas" | "copilot";
type CopilotTab = "annotations" | "ai" | "redteam" | "clausebank";

interface InteractiveClause {
  id: string;
  heading: string;
  category: string;
  riskSeverity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  originalText: string;
  proposedText: string;
  rationale: string;
  status: "PENDING" | "ACCEPTED" | "REJECTED" | "COUNTER_PROPOSED";
  lastEditedBy?: string;
}

interface ClauseAnnotation {
  id: string;
  clauseId: string;
  clauseHeading: string;
  authorName: string;
  authorRole: string;
  type: "QUESTION" | "REVISION_PROPOSAL" | "RISK_FLAG" | "APPROVAL_NOTE";
  selectedQuote?: string;
  comment: string;
  proposedText?: string;
  internalOnly?: boolean;
  resolved: boolean;
  createdAt: string;
  replies: Array<{
    id: string;
    authorName: string;
    authorRole: string;
    content: string;
    createdAt: string;
  }>;
}

interface ReviewStakeholder {
  id: string;
  name: string;
  email: string;
  organization: string;
  role:
    | "LEAD_COUNSEL"
    | "CLIENT_EXECUTIVE"
    | "COUNTERPARTY_COUNSEL"
    | "SPECIALIST_PARTNER"
    | "OBSERVER";
  permissions: "FULL_EDIT" | "PROPOSE_AND_COMMENT" | "COMMENT_ONLY";
  status: "INVITED" | "VIEWED" | "CHANGES_REQUESTED" | "APPROVED";
  updatedAt: string;
}

const INITIAL_CLAUSES: InteractiveClause[] = [
  {
    id: "clause-1",
    heading: "Section 8.1 — Indemnification & Survival of Representations",
    category: "Indemnification",
    riskSeverity: "CRITICAL",
    originalText:
      "Seller shall indemnify Buyer solely for direct out-of-pocket losses resulting from a breach of Seller's express representations, provided that all representations and warranties shall expire six (6) months following the Closing Date.",
    proposedText:
      "Seller shall indemnify, defend, and hold harmless Buyer and its Affiliates from and against all Losses (including reasonable attorneys' fees and regulatory penalties) arising out of any breach of Seller's representations, warranties, or covenants. General representations shall survive for twenty-four (24) months following the Closing Date, and Fundamental Representations, Tax, IP Ownership, and Fraud claims shall survive indefinitely or until sixty (60) days after expiration of the applicable statute of limitations.",
    rationale:
      "CRITICAL PLAYBOOK VIOLATION: 6-month survival is below market floor (18–24 months) and omits defense costs, Affiliate coverage, and statutory carve-outs for Fundamental Representations and Fraud.",
    status: "PENDING",
    lastEditedBy: "Keyes (Managing Partner AI)",
  },
  {
    id: "clause-2",
    heading: "Section 8.4 — Limitation of Liability & Super-Cap Carve-Outs",
    category: "Limitation of Liability",
    riskSeverity: "CRITICAL",
    originalText:
      "Seller's aggregate liability under this Agreement for all claims of any kind shall not exceed ten percent (10%) of the Purchase Price. In no event shall Seller be liable for any consequential, indirect, special, or punitive damages.",
    proposedText:
      "Except in the case of Fraud, Willful Misconduct, breach of Confidentiality, or third-party Intellectual Property and Data Privacy indemnification obligations (which shall be uncapped), Seller's aggregate liability for general representation breaches shall not exceed one hundred percent (100%) of the Purchase Price. Neither Party shall be liable for punitive damages, except to the extent awarded to a third party in connection with an indemnified claim.",
    rationale:
      "Uncapped carve-outs added for Fraud, Willful Misconduct, Confidentiality, and third-party IP/Data Privacy claims; raised general cap from 10% to 100% and preserved consequential damages recovery where foreseeable.",
    status: "PENDING",
    lastEditedBy: "Archer (M&A Specialist AI)",
  },
  {
    id: "clause-3",
    heading: "Section 11.2 — Intellectual Property & AI Foundation Model Training",
    category: "IP & Data Rights",
    riskSeverity: "HIGH",
    originalText:
      "Vendor grants Company a non-exclusive license to use the Deliverables. Vendor may utilize aggregated and anonymized Company data to improve Vendor's products, machine learning algorithms, and commercial services.",
    proposedText:
      "Vendor hereby irrevocably assigns to Company all right, title, and interest in and to all custom Deliverables as 'works made for hire.' Vendor is strictly prohibited from using any Company Confidential Information, customer inputs, or derivative telemetry to train, fine-tune, or validate any external or multi-tenant artificial intelligence or machine learning model without Company's prior written consent.",
    rationale:
      "HIGH RISK: Counterparty draft permits training multi-tenant AI models on client confidential data and grants only a license instead of full IP assignment for paid custom deliverables.",
    status: "PENDING",
    lastEditedBy: "Queen (IP Specialist AI)",
  },
  {
    id: "clause-4",
    heading: "Section 14.3 — Termination for Convenience & Assignment on M&A",
    category: "Term & Assignment",
    riskSeverity: "MEDIUM",
    originalText:
      "Vendor may terminate this Agreement for convenience upon thirty (30) days' written notice. Company may not assign this Agreement, including by merger, change of control, or sale of substantially all assets, without Vendor's prior written consent.",
    proposedText:
      "Neither Party may terminate this Agreement for convenience during the Initial Term; thereafter, termination requires ninety (90) days' prior written notice and a pro-rata refund of unearned prepaid fees. Either Party may freely assign this Agreement without consent in connection with a merger, corporate reorganization, or sale of all or substantially all of its assets, provided the assignee is not a direct competitor.",
    rationale:
      "Removed unilateral 30-day vendor termination walk-right and added standard M&A change-of-control assignment carve-out so future acquisitions aren't blocked by vendor hold-up.",
    status: "PENDING",
    lastEditedBy: "Spade (Governance AI)",
  },
];

const INITIAL_STAKEHOLDERS: ReviewStakeholder[] = [
  {
    id: "stk-1",
    name: "Barton Keyes",
    email: "b.keyes@vigil-law.com",
    organization: "Basalt Vigil LLP (Lead Counsel)",
    role: "LEAD_COUNSEL",
    permissions: "FULL_EDIT",
    status: "APPROVED",
    updatedAt: new Date().toISOString(),
  },
  {
    id: "stk-2",
    name: "Elena Rostova",
    email: "e.rostova@acmecorp.io",
    organization: "Acme Acquirer Corp. (CFO / Client)",
    role: "CLIENT_EXECUTIVE",
    permissions: "PROPOSE_AND_COMMENT",
    status: "VIEWED",
    updatedAt: new Date().toISOString(),
  },
  {
    id: "stk-3",
    name: "Jordan Vance, Esq.",
    email: "jvance@counterparty-law.com",
    organization: "Wachtell / Counterparty Outside Counsel",
    role: "COUNTERPARTY_COUNSEL",
    permissions: "PROPOSE_AND_COMMENT",
    status: "CHANGES_REQUESTED",
    updatedAt: new Date().toISOString(),
  },
];

const INITIAL_ANNOTATIONS: ClauseAnnotation[] = [
  {
    id: "ann-init-1",
    clauseId: "clause-2",
    clauseHeading: "Section 8.4 — Limitation of Liability & Super-Cap Carve-Outs",
    authorName: "Jordan Vance, Esq.",
    authorRole: "COUNTERPARTY_COUNSEL",
    type: "REVISION_PROPOSAL",
    selectedQuote: "100% of the Purchase Price",
    comment:
      "Our board cannot approve an uncapped IP indemnity plus a 100% general cap. We propose a 25% general cap and a 2x Super-Cap on IP and Data Privacy indemnification.",
    proposedText:
      "Except in the case of Fraud or Willful Misconduct (which shall be uncapped), Seller's aggregate liability for general representation breaches shall not exceed twenty-five percent (25%) of the Purchase Price, and Seller's aggregate liability for third-party IP Infringement and Data Privacy claims shall not exceed two hundred percent (200%) of the Purchase Price.",
    internalOnly: false,
    resolved: false,
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    replies: [
      {
        id: "rep-init-1",
        authorName: "Elena Rostova (CFO)",
        authorRole: "CLIENT_EXECUTIVE",
        content:
          "Keyes — can we live with a 2x Super-Cap on IP if Fundamental Reps stay at 100%?",
        createdAt: new Date(Date.now() - 1800000).toISOString(),
      },
    ],
  },
  {
    id: "ann-init-2",
    clauseId: "clause-3",
    clauseHeading: "Section 11.2 — Intellectual Property & AI Foundation Model Training",
    authorName: "Barton Keyes",
    authorRole: "LEAD_COUNSEL",
    type: "RISK_FLAG",
    selectedQuote: "train, fine-tune, or validate any external",
    comment:
      "INTERNAL STRATEGY NOTE: Do not concede on the AI training prohibition under any circumstances. Client's proprietary enterprise datasets are crown-jewel trade secrets.",
    internalOnly: true,
    resolved: false,
    createdAt: new Date(Date.now() - 2400000).toISOString(),
    replies: [],
  },
];

const FIRM_CLAUSE_BANK = [
  {
    id: "cb-1",
    title: "Mutual Indemnification + IP & Data Breach Super-Cap",
    category: "Indemnification",
    posture: "Aggressive Pro-Buyer",
    text: "Each Party ('Indemnifying Party') shall indemnify, defend, and hold harmless the other Party and its Affiliates from and against any and all third-party Losses arising from (a) gross negligence, willful misconduct, or fraud, (b) breach of Confidentiality or Data Security obligations, or (c) infringement or misappropriation of any third-party Intellectual Property right. Liability under clauses (a)–(c) shall not be subject to the general liability cap.",
  },
  {
    id: "cb-2",
    title: "Zero-Retention AI & Foundation Model Training Prohibition",
    category: "IP & AI Governance",
    posture: "Mandatory Firm Standard",
    text: "Provider acknowledges that all Customer Data, prompts, embeddings, and outputs constitute Customer's exclusive Confidential Information. Provider shall maintain zero-data-retention API endpoints and shall not use, copy, or permit any third party to use Customer Data to train, tune, distill, or evaluate any machine learning or foundation model.",
  },
  {
    id: "cb-3",
    title: "M&A Change-of-Control Free Assignment Carve-Out",
    category: "Corporate / M&A",
    posture: "Balanced Market Standard",
    text: "Neither Party may assign this Agreement without the prior written consent of the other Party, except that either Party may assign this Agreement without consent (i) to an Affiliate, or (ii) in connection with a merger, acquisition, corporate reorganization, or sale of all or substantially all of its equity or assets.",
  },
  {
    id: "cb-4",
    title: "Delaware Chancery Exclusive Forum & Jury Trial Waiver",
    category: "Dispute Resolution",
    posture: "AmLaw 10 Standard",
    text: "This Agreement shall be governed by the laws of the State of Delaware, without regard to conflict-of-laws principles. Each Party irrevocably submits to the exclusive jurisdiction of the Court of Chancery of the State of Delaware (or, if jurisdiction is declined, the United States District Court for the District of Delaware) and HEREBY IRREVOCABLY WAIVES ANY RIGHT TO TRIAL BY JURY.",
  },
];

const INITIAL_DEAL_MATRIX = [
  {
    id: "dm-1",
    docName: "Acme / Target Stock Purchase Agreement (v3)",
    counterparty: "Omega Holdings, Inc.",
    liabilityCap: "10% Purchase Price (Unilateral)",
    indemnitySurvival: "6 Months (No Fundamental Carve-Out)",
    changeOfControl: "Consent Required (Holdup Risk)",
    aiDataTraining: "Permitted on Anonymized Data",
    governingLaw: "California",
    riskScore: 84,
    status: "DEALBREAKER_REDLINE_REQUIRED",
  },
  {
    id: "dm-2",
    docName: "CloudCore Enterprise SaaS MSA",
    counterparty: "CloudCore Systems LLC",
    liabilityCap: "12 Months Fees (2x Super-Cap on IP)",
    indemnitySurvival: "18 Months + Statute of Limitations",
    changeOfControl: "Free Assignment on M&A",
    aiDataTraining: "Strictly Prohibited",
    governingLaw: "Delaware",
    riskScore: 22,
    status: "PLAYBOOK_COMPLIANT",
  },
  {
    id: "dm-3",
    docName: "Nexus Joint Development & Licensing Agreement",
    counterparty: "Nexus Robotics GmbH",
    liabilityCap: "50% Fees Paid (No Data Breach Carve-Out)",
    indemnitySurvival: "12 Months",
    changeOfControl: "30-Day Termination Right on CoC",
    aiDataTraining: "Silent / Ambiguous",
    governingLaw: "New York",
    riskScore: 63,
    status: "DEVIATION_REQUIRES_REDLINE",
  },
];

function computeWordDiffTokens(original: string, revised: string) {
  const origWords = (original || "").trim().split(/(\s+)/);
  const revWords = (revised || "").trim().split(/(\s+)/);
  const m = origWords.length;
  const n = revWords.length;

  if (m * n > 250000) {
    return [
      { type: "del" as const, text: original },
      { type: "same" as const, text: " " },
      { type: "ins" as const, text: revised },
    ];
  }

  const dp: number[][] = Array.from({ length: m + 1 }, () =>
    new Array(n + 1).fill(0)
  );
  for (let i = m - 1; i >= 0; i--) {
    for (let j = n - 1; j >= 0; j--) {
      if (origWords[i] === revWords[j]) dp[i][j] = 1 + dp[i + 1][j + 1];
      else dp[i][j] = Math.max(dp[i + 1][j], dp[i][j + 1]);
    }
  }

  const out: Array<{ type: "same" | "del" | "ins"; text: string }> = [];
  let i = 0;
  let j = 0;
  while (i < m && j < n) {
    if (origWords[i] === revWords[j]) {
      out.push({ type: "same", text: origWords[i] });
      i++;
      j++;
    } else if (dp[i + 1][j] >= dp[i][j + 1]) {
      out.push({ type: "del", text: origWords[i] });
      i++;
    } else {
      out.push({ type: "ins", text: revWords[j] });
      j++;
    }
  }
  while (i < m) out.push({ type: "del", text: origWords[i++] });
  while (j < n) out.push({ type: "ins", text: revWords[j++] });
  return out;
}

export default function DocumentsPage() {
  const router = useRouter();

  // Top-level workspace mode
  const [workspaceMode, setWorkspaceMode] = useState<WorkspaceMode>("ide");

  // Modular Window Arrangement, Visibility, Maximized & Resizable Widths
  const [paneOrder, setPaneOrder] = useState<PaneId[]>([
    "navigator",
    "canvas",
    "copilot",
  ]);
  const [visiblePanes, setVisiblePanes] = useState<Record<PaneId, boolean>>({
    navigator: true,
    canvas: true,
    copilot: true,
  });
  const [maximizedPane, setMaximizedPane] = useState<PaneId | null>(null);
  const [paneWidths, setPaneWidths] = useState<Record<PaneId, number>>({
    navigator: 23,
    canvas: 47,
    copilot: 30,
  });

  // Mobile responsive active tab (< lg breakpoint)
  const [mobilePane, setMobilePane] = useState<
    "navigator" | "canvas" | "copilot" | "matrix" | "vault"
  >("canvas");

  // Drag-resize state
  const containerRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{
    leftPane: PaneId;
    rightPane: PaneId;
    startX: number;
    startLeftWidth: number;
    startRightWidth: number;
  } | null>(null);

  // Vault documents fetched from /api/documents
  const [vaultDocs, setVaultDocs] = useState<any[]>([]);
  const [vaultLoading, setVaultLoading] = useState(true);
  const [vaultSearch, setVaultSearch] = useState("");
  const [previewVaultDoc, setPreviewVaultDoc] = useState<any | null>(null);

  // Active Interactive Document & Redlining Session State
  const [docTitle, setDocTitle] = useState(
    "Stock Purchase & Indemnification Agreement — Omega Holdings"
  );
  const [counterpartyName, setCounterpartyName] = useState(
    "Omega Holdings, Inc."
  );
  const [displayId, setDisplayId] = useState("VIGIL-2026-REDLINE");
  const [negotiationPosture, setNegotiationPosture] = useState(
    "Strongly Pro-Buyer"
  );
  const [clauses, setClauses] = useState<InteractiveClause[]>(INITIAL_CLAUSES);
  const [selectedClauseId, setSelectedClauseId] = useState<string>(
    INITIAL_CLAUSES[0].id
  );
  const [canvasViewMode, setCanvasViewMode] = useState<
    "track_changes" | "side_by_side" | "clean_preview"
  >("track_changes");
  const [editingClauseId, setEditingClauseId] = useState<string | null>(null);

  // Selected quote from text highlighting inside a clause
  const [selectedQuote, setSelectedQuote] = useState<string>("");

  // Right Pane (Copilot & Annotations) State
  const [copilotTab, setCopilotTab] = useState<CopilotTab>("annotations");
  const [annotations, setAnnotations] =
    useState<ClauseAnnotation[]>(INITIAL_ANNOTATIONS);
  const [stakeholders, setStakeholders] =
    useState<ReviewStakeholder[]>(INITIAL_STAKEHOLDERS);
  const [activeStakeholderId, setActiveStakeholderId] = useState<string>(
    INITIAL_STAKEHOLDERS[0].id
  );

  // Annotation form state
  const [newAnnType, setNewAnnType] = useState<
    "QUESTION" | "REVISION_PROPOSAL" | "RISK_FLAG" | "APPROVAL_NOTE"
  >("QUESTION");
  const [newAnnComment, setNewAnnComment] = useState("");
  const [newAnnProposedText, setNewAnnProposedText] = useState("");
  const [newAnnInternalOnly, setNewAnnInternalOnly] = useState(false);
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});

  // AI Copilot Q&A & Clause Revision State
  const [aiQuestion, setAiQuestion] = useState("");
  const [aiInstruction, setAiInstruction] = useState("");
  const [aiBusy, setAiBusy] = useState(false);
  const [aiAnswer, setAiAnswer] = useState<string | null>(null);
  const [aiSuggestedRevision, setAiSuggestedRevision] = useState<{
    revised_text: string;
    rationale: string;
  } | null>(null);

  // Adversarial Red-Team War Room State
  const [redTeamBusy, setRedTeamBusy] = useState(false);
  const [redTeamResult, setRedTeamResult] = useState<{
    pushback_probability: number;
    opposing_counsel_critique: string;
    tier1_opening: string;
    tier2_fallback: string;
    tier3_walkaway: string;
    negotiation_script: string[];
  } | null>(null);

  // Compilation & Export State
  const [compiling, setCompiling] = useState(false);
  const [compiledDeliverable, setCompiledDeliverable] = useState<{
    pdfUrl?: string;
    docxUrl?: string;
    title?: string;
  } | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Stakeholder Review Modal & Share Link State
  const [showShareModal, setShowShareModal] = useState(false);
  const [reviewToken, setReviewToken] = useState<string>("");
  const [hideInternalFromExternal, setHideInternalFromExternal] =
    useState(true);
  const [newStkName, setNewStkName] = useState("");
  const [newStkEmail, setNewStkEmail] = useState("");
  const [newStkOrg, setNewStkOrg] = useState("");
  const [newStkRole, setNewStkRole] =
    useState<ReviewStakeholder["role"]>("CLIENT_EXECUTIVE");
  const [savingReview, setSavingReview] = useState(false);

  // Deal Room Matrix State
  const [dealMatrix, setDealMatrix] = useState(INITIAL_DEAL_MATRIX);
  const uploadInputRef = useRef<HTMLInputElement>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4200);
  };

  // Load Vault Documents & Check URL for ?reviewToken=
  useEffect(() => {
    fetch("/api/documents")
      .then((r) => r.json())
      .then((d) => setVaultDocs(d.documents || []))
      .catch(console.error)
      .finally(() => setVaultLoading(false));

    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const tokenParam = params.get("reviewToken");
      if (tokenParam) {
        setReviewToken(tokenParam);
        fetch(`/api/documents/review?token=${encodeURIComponent(tokenParam)}`)
          .then((r) => (r.ok ? r.json() : null))
          .then((data) => {
            if (data?.session) {
              const s = data.session;
              setDocTitle(s.title || docTitle);
              setCounterpartyName(s.counterpartyName || counterpartyName);
              setDisplayId(s.displayId || displayId);
              if (s.clauses?.length) {
                setClauses(s.clauses);
                setSelectedClauseId(s.clauses[0].id);
              }
              if (s.stakeholders?.length) setStakeholders(s.stakeholders);
              if (s.annotations?.length) setAnnotations(s.annotations);
              showToast(`Loaded shared stakeholder review session (${s.token})`);
            }
          })
          .catch(console.error);
      }
    }
  }, []);

  // Mouse drag handler for resizable modular windows
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!dragRef.current || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      if (rect.width <= 0) return;
      const deltaPct = ((e.clientX - dragRef.current.startX) / rect.width) * 100;
      const { leftPane, rightPane, startLeftWidth, startRightWidth } =
        dragRef.current;

      const totalPair = startLeftWidth + startRightWidth;
      const newLeft = Math.max(16, Math.min(totalPair - 16, startLeftWidth + deltaPct));
      const newRight = totalPair - newLeft;

      setPaneWidths((prev) => ({
        ...prev,
        [leftPane]: Number(newLeft.toFixed(1)),
        [rightPane]: Number(newRight.toFixed(1)),
      }));
    };

    const handleMouseUp = () => {
      dragRef.current = null;
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  const startResize = (
    e: React.MouseEvent,
    leftPane: PaneId,
    rightPane: PaneId
  ) => {
    e.preventDefault();
    dragRef.current = {
      leftPane,
      rightPane,
      startX: e.clientX,
      startLeftWidth: paneWidths[leftPane],
      startRightWidth: paneWidths[rightPane],
    };
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  };

  const resetPaneLayout = () => {
    setPaneOrder(["navigator", "canvas", "copilot"]);
    setVisiblePanes({ navigator: true, canvas: true, copilot: true });
    setMaximizedPane(null);
    setPaneWidths({ navigator: 23, canvas: 47, copilot: 30 });
  };

  const movePaneOrder = (pane: PaneId, direction: -1 | 1) => {
    setPaneOrder((prev) => {
      const idx = prev.indexOf(pane);
      const targetIdx = idx + direction;
      if (idx === -1 || targetIdx < 0 || targetIdx >= prev.length) return prev;
      const copy = [...prev];
      const temp = copy[idx];
      copy[idx] = copy[targetIdx];
      copy[targetIdx] = temp;
      return copy;
    });
  };

  const activeClause = useMemo(
    () => clauses.find((c) => c.id === selectedClauseId) || clauses[0],
    [clauses, selectedClauseId]
  );

  const activeStakeholder = useMemo(
    () =>
      stakeholders.find((s) => s.id === activeStakeholderId) || stakeholders[0],
    [stakeholders, activeStakeholderId]
  );

  const overallRiskScore = useMemo(() => {
    if (clauses.length === 0) return 0;
    const weights = { CRITICAL: 92, HIGH: 74, MEDIUM: 45, LOW: 18 };
    const total = clauses.reduce((acc, c) => {
      const base = weights[c.riskSeverity] || 45;
      return acc + (c.status === "ACCEPTED" ? Math.round(base * 0.25) : base);
    }, 0);
    return Math.round(total / clauses.length);
  }, [clauses]);

  // Clause actions
  const updateClauseStatus = (
    clauseId: string,
    status: InteractiveClause["status"]
  ) => {
    setClauses((prev) =>
      prev.map((c) =>
        c.id === clauseId
          ? { ...c, status, lastEditedBy: activeStakeholder.name }
          : c
      )
    );
  };

  const updateClauseProposedText = (clauseId: string, newText: string) => {
    setClauses((prev) =>
      prev.map((c) =>
        c.id === clauseId
          ? {
              ...c,
              proposedText: newText,
              status: "PENDING",
              lastEditedBy: activeStakeholder.name,
            }
          : c
      )
    );
  };

  // Upload any contract (.pdf, .docx, .txt, .md) into Interactive Redline IDE
  const handleContractUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";

    showToast(`Parsing & running Playbook Redline Audit on ${file.name}...`);
    let extractedText = "";

    try {
      if (
        file.name.toLowerCase().endsWith(".pdf") ||
        file.name.toLowerCase().endsWith(".docx")
      ) {
        const fd = new FormData();
        fd.append("file", file);
        const res = await fetch("/api/parse", { method: "POST", body: fd });
        if (res.ok) {
          const data = await res.json();
          extractedText = data.markdown || "";
        }
      } else {
        extractedText = await file.text();
      }

      if (extractedText.trim()) {
        const copilotRes = await fetch("/api/documents/copilot", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            mode: "parse_contract",
            contractText: extractedText,
          }),
        });
        if (copilotRes.ok) {
          const parsed = await copilotRes.json();
          if (parsed.clauses?.length) {
            setDocTitle(file.name.replace(/\.[^.]+$/, ""));
            setClauses(parsed.clauses);
            setSelectedClauseId(parsed.clauses[0].id);
            showToast(
              `Segmented ${file.name} into ${parsed.clauses.length} interactive clauses with AI redline proposals.`
            );
          }
        }
      }
    } catch (err) {
      console.error("Failed to parse contract:", err);
      showToast("Failed to parse uploaded file.");
    }
  };

  // Load a Vault Document into the Interactive Redline Studio
  const loadVaultDocIntoIde = (doc: any) => {
    setDocTitle(doc.title || "Vault Legal Agreement");
    setDisplayId(doc.displayId || "VIGIL-VAULT-DOC");
    const metaSections = doc.metadata?.sections;
    if (Array.isArray(metaSections) && metaSections.length > 0) {
      const mapped: InteractiveClause[] = metaSections.map(
        (s: any, idx: number) => ({
          id: `vault-clause-${idx + 1}`,
          heading: s.heading || `Section ${idx + 1}`,
          category: s.risk_level || "Contract Provision",
          riskSeverity:
            s.risk_level === "CRITICAL" || s.risk_level === "HIGH"
              ? s.risk_level
              : "MEDIUM",
          originalText:
            s.original_text || s.content || "Original baseline provision.",
          proposedText:
            s.revised_text ||
            s.content ||
            "Proposed counsel markup provision.",
          rationale:
            s.rationale || "Loaded from Basalt Vigil Document Vault.",
          status: "PENDING",
        })
      );
      setClauses(mapped);
      setSelectedClauseId(mapped[0].id);
    }
    setWorkspaceMode("ide");
    setMobilePane("canvas");
    showToast(`Loaded "${doc.title}" into Interactive Redlining IDE.`);
  };

  // AI Copilot Q&A
  const handleAskCopilot = async (customQuestion?: string) => {
    const q = customQuestion || aiQuestion;
    if (!q.trim() || !activeClause) return;
    setAiBusy(true);
    setCopilotTab("ai");
    setMobilePane("copilot");
    try {
      const res = await fetch("/api/documents/copilot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "ask",
          clauseHeading: activeClause.heading,
          originalText: activeClause.originalText,
          proposedText: activeClause.proposedText,
          question: q,
        }),
      });
      const data = await res.json();
      setAiAnswer(data.answer || "No response generated.");
    } finally {
      setAiBusy(false);
    }
  };

  // AI Clause Revision
  const handleAiReviseClause = async (presetInstruction?: string) => {
    if (!activeClause) return;
    const instr = presetInstruction || aiInstruction || negotiationPosture;
    setAiBusy(true);
    setCopilotTab("ai");
    setMobilePane("copilot");
    try {
      const res = await fetch("/api/documents/copilot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "revise",
          clauseHeading: activeClause.heading,
          originalText: activeClause.originalText,
          proposedText: activeClause.proposedText,
          posture: negotiationPosture,
          instruction: instr,
        }),
      });
      const data = await res.json();
      if (data.revised_text) {
        setAiSuggestedRevision({
          revised_text: data.revised_text,
          rationale: data.rationale || `Revised per instruction: ${instr}`,
        });
      }
    } finally {
      setAiBusy(false);
    }
  };

  // Adversarial Opposing-Counsel Red-Team Simulation
  const handleRunRedTeam = async () => {
    if (!activeClause) return;
    setRedTeamBusy(true);
    setCopilotTab("redteam");
    setMobilePane("copilot");
    try {
      const res = await fetch("/api/documents/copilot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "redteam",
          clauseHeading: activeClause.heading,
          originalText: activeClause.originalText,
          proposedText: activeClause.proposedText,
        }),
      });
      const data = await res.json();
      setRedTeamResult(data);
    } finally {
      setRedTeamBusy(false);
    }
  };

  // Add Stakeholder Annotation
  const handleAddAnnotation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAnnComment.trim() && !newAnnProposedText.trim()) return;
    const newAnn: ClauseAnnotation = {
      id: `ann-${Date.now()}`,
      clauseId: activeClause.id,
      clauseHeading: activeClause.heading,
      authorName: activeStakeholder.name,
      authorRole: activeStakeholder.role,
      type: newAnnType,
      selectedQuote: selectedQuote || undefined,
      comment:
        newAnnComment.trim() ||
        `${newAnnType.replace("_", " ")} on ${activeClause.heading}`,
      proposedText:
        newAnnType === "REVISION_PROPOSAL" && newAnnProposedText.trim()
          ? newAnnProposedText.trim()
          : undefined,
      internalOnly: newAnnInternalOnly,
      resolved: false,
      createdAt: new Date().toISOString(),
      replies: [],
    };

    setAnnotations((prev) => [newAnn, ...prev]);
    setNewAnnComment("");
    setNewAnnProposedText("");
    setSelectedQuote("");

    if (reviewToken) {
      await fetch("/api/documents/review", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: reviewToken,
          action: "add_annotation",
          ...newAnn,
        }),
      });
    }
    showToast(`Annotation logged by ${activeStakeholder.name}.`);
  };

  // Save & Generate Shareable Stakeholder Review Link
  const handleCreateOrSyncReviewLink = async () => {
    setSavingReview(true);
    try {
      const res = await fetch("/api/documents/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: reviewToken || undefined,
          displayId,
          title: docTitle,
          counterpartyName,
          negotiationPosture,
          hideInternalNotesFromExternal: hideInternalFromExternal,
          clauses,
          stakeholders,
          annotations,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setReviewToken(data.token);
        showToast(
          `Stakeholder review session active: ${window.location.origin}${data.reviewUrl}`
        );
      }
    } finally {
      setSavingReview(false);
    }
  };

  const handleAddStakeholder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStkName.trim()) return;
    const stk: ReviewStakeholder = {
      id: `stk-${Date.now()}`,
      name: newStkName.trim(),
      email: newStkEmail.trim() || "stakeholder@partner.com",
      organization: newStkOrg.trim() || "External Stakeholder",
      role: newStkRole,
      permissions:
        newStkRole === "OBSERVER" ? "COMMENT_ONLY" : "PROPOSE_AND_COMMENT",
      status: "INVITED",
      updatedAt: new Date().toISOString(),
    };
    setStakeholders((prev) => [...prev, stk]);
    setNewStkName("");
    setNewStkEmail("");
    setNewStkOrg("");
    showToast(`Added ${stk.name} (${stk.organization}) to review distribution.`);
  };

  // Compile Fortune 50 Redline PDF + Native Word (.docx) Track Changes OR Clean Execution PDF
  const handleCompileDocument = async (cleanExecutionOnly = false) => {
    setCompiling(true);
    try {
      const payload = cleanExecutionOnly
        ? {
            toolName: "draft_structured_document",
            args: {
              title: `${docTitle} (Clean Execution Version)`,
              layout_style: "corporate_governance",
              sections: clauses.map((c) => ({
                heading: c.heading,
                content:
                  c.status === "REJECTED" ? c.originalText : c.proposedText,
              })),
            },
          }
        : {
            toolName: "redline_document",
            args: {
              title: docTitle,
              counterparty_name: counterpartyName,
              negotiation_summary: `Interactive Counsel & Stakeholder Redline (${negotiationPosture}). Risk Score: ${overallRiskScore}/100. Includes ${annotations.length} stakeholder annotations.`,
              export_docx: true,
              sections: clauses.map((c) => ({
                heading: c.heading,
                original_text: c.originalText,
                revised_text:
                  c.status === "REJECTED" ? c.originalText : c.proposedText,
                rationale: c.rationale,
                risk_level: c.riskSeverity,
              })),
            },
          };

      const res = await fetch("/api/launchpad/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      const out = data.result || {};
      const pdfUrl = out.pdf_file_url || out.file_url;
      const docxUrl = out.docx_file_url;
      if (pdfUrl || docxUrl) {
        setCompiledDeliverable({
          pdfUrl,
          docxUrl,
          title: docTitle,
        });
        showToast(
          cleanExecutionOnly
            ? "Compiled Clean Execution PDF to Vault."
            : "Compiled Fortune 50 Redline PDF + Native Word (.docx) Track Changes!"
        );
      }
    } catch (err) {
      console.error("Compile error:", err);
      showToast("Compilation encountered an error.");
    } finally {
      setCompiling(false);
    }
  };

  // Capture highlighted quote inside clause text
  const handleCaptureSelection = () => {
    if (typeof window === "undefined") return;
    const sel = window.getSelection()?.toString().trim();
    if (sel && sel.length > 3 && sel.length < 280) {
      setSelectedQuote(sel);
    }
  };

  // Determine ordered visible panes for Desktop Modular Layout
  const activeDesktopPanes = useMemo(() => {
    if (maximizedPane) return [maximizedPane];
    return paneOrder.filter((p) => visiblePanes[p]);
  }, [paneOrder, visiblePanes, maximizedPane]);

  // Normalize desktop widths so active panes always sum to 100%
  const normalizedWidths = useMemo(() => {
    const total = activeDesktopPanes.reduce(
      (acc, p) => acc + (paneWidths[p] || 33),
      0
    );
    const map: Record<PaneId, number> = {
      navigator: 25,
      canvas: 50,
      copilot: 25,
    };
    activeDesktopPanes.forEach((p) => {
      map[p] = total > 0 ? ((paneWidths[p] || 33) / total) * 100 : 100;
    });
    return map;
  }, [activeDesktopPanes, paneWidths]);

  // Render functions for the 3 modular windows
  const renderNavigatorWindow = (paneIndex: number) => (
    <div className="h-full flex flex-col bg-[#07090f] border border-white/[0.08] rounded-2xl overflow-hidden shadow-xl">
      {/* Modular Window Header */}
      <div className="px-3.5 py-2.5 border-b border-white/[0.07] bg-[#0b0e17] flex items-center justify-between gap-2 flex-shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <FolderKanban size={14} className="text-red-400 flex-shrink-0" />
          <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-white truncate">
            Clause Heatmap & Vault
          </span>
        </div>
        <div className="hidden lg:flex items-center gap-1">
          <button
            type="button"
            onClick={() => movePaneOrder("navigator", -1)}
            disabled={paneIndex === 0}
            className="p-1 rounded hover:bg-white/10 text-zinc-400 disabled:opacity-30"
            title="Move Window Left"
          >
            <ChevronLeft size={13} />
          </button>
          <button
            type="button"
            onClick={() => movePaneOrder("navigator", 1)}
            disabled={paneIndex === activeDesktopPanes.length - 1}
            className="p-1 rounded hover:bg-white/10 text-zinc-400 disabled:opacity-30"
            title="Move Window Right"
          >
            <ChevronRight size={13} />
          </button>
          <button
            type="button"
            onClick={() =>
              setMaximizedPane(
                maximizedPane === "navigator" ? null : "navigator"
              )
            }
            className="p-1 rounded hover:bg-white/10 text-zinc-400"
            title="Maximize / Restore Window"
          >
            {maximizedPane === "navigator" ? (
              <Minimize2 size={12} />
            ) : (
              <Maximize2 size={12} />
            )}
          </button>
        </div>
      </div>

      {/* Upload & Risk Score Meter */}
      <div className="p-3 border-b border-white/[0.06] bg-black/30 space-y-2.5 flex-shrink-0">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono uppercase text-zinc-400">
            Contract Risk Index
          </span>
          <span
            className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
              overallRiskScore >= 70
                ? "bg-red-500/20 text-red-300 border border-red-500/30"
                : overallRiskScore >= 40
                ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
            }`}
          >
            {overallRiskScore} / 100
          </span>
        </div>
        <div className="w-full h-1.5 rounded-full bg-white/[0.07] overflow-hidden">
          <div
            className={`h-full transition-all duration-500 ${
              overallRiskScore >= 70
                ? "bg-red-500"
                : overallRiskScore >= 40
                ? "bg-amber-500"
                : "bg-emerald-500"
            }`}
            style={{ width: `${overallRiskScore}%` }}
          />
        </div>

        <input
          ref={uploadInputRef}
          type="file"
          accept=".pdf,.docx,.txt,.md"
          onChange={handleContractUpload}
          className="hidden"
        />
        <button
          type="button"
          onClick={() => uploadInputRef.current?.click()}
          className="w-full py-2 px-3 rounded-xl bg-red-600/20 hover:bg-red-600/30 border border-red-500/35 text-xs font-mono font-semibold text-red-100 flex items-center justify-center gap-2 transition-all"
        >
          <Upload size={13} className="text-red-400" />
          <span>Upload Contract (.PDF / .DOCX)</span>
        </button>
      </div>

      {/* Clause List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
        <div className="flex items-center justify-between px-1">
          <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">
            INTERACTIVE CLAUSES ({clauses.length})
          </span>
          <button
            type="button"
            onClick={() => {
              const newId = `clause-${Date.now()}`;
              const newClause: InteractiveClause = {
                id: newId,
                heading: `Section ${clauses.length + 1} — New Custom Provision`,
                category: "Custom Covenant",
                riskSeverity: "LOW",
                originalText:
                  "Counterparty baseline language or silent omission.",
                proposedText:
                  "Insert firm-standard protective covenant here.",
                rationale: "Added by counsel during interactive markup.",
                status: "PENDING",
              };
              setClauses((prev) => [...prev, newClause]);
              setSelectedClauseId(newId);
              setMobilePane("canvas");
            }}
            className="text-[10px] font-mono text-red-400 hover:text-red-300 flex items-center gap-0.5"
          >
            <Plus size={11} /> Add Clause
          </button>
        </div>

        {clauses.map((c) => {
          const isSelected = c.id === activeClause?.id;
          const annCount = annotations.filter(
            (a) => a.clauseId === c.id && !a.resolved
          ).length;
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => {
                setSelectedClauseId(c.id);
                setMobilePane("canvas");
              }}
              className={`w-full text-left p-3 rounded-xl border transition-all ${
                isSelected
                  ? "bg-red-600/15 border-red-500/50 shadow-md"
                  : "bg-white/[0.02] hover:bg-white/[0.04] border-white/[0.06]"
              }`}
            >
              <div className="flex items-center justify-between gap-1.5 mb-1">
                <span
                  className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded uppercase ${
                    c.riskSeverity === "CRITICAL"
                      ? "bg-red-500/25 text-red-300"
                      : c.riskSeverity === "HIGH"
                      ? "bg-orange-500/25 text-orange-300"
                      : c.riskSeverity === "MEDIUM"
                      ? "bg-amber-500/20 text-amber-300"
                      : "bg-emerald-500/20 text-emerald-300"
                  }`}
                >
                  {c.riskSeverity}
                </span>
                <div className="flex items-center gap-1.5">
                  {annCount > 0 && (
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300">
                      💬 {annCount}
                    </span>
                  )}
                  <span
                    className={`text-[9px] font-mono uppercase px-1.5 py-0.5 rounded ${
                      c.status === "ACCEPTED"
                        ? "bg-emerald-500/20 text-emerald-300"
                        : c.status === "REJECTED"
                        ? "bg-zinc-700/50 text-zinc-400"
                        : c.status === "COUNTER_PROPOSED"
                        ? "bg-purple-500/20 text-purple-300"
                        : "bg-white/[0.06] text-zinc-300"
                    }`}
                  >
                    {c.status}
                  </span>
                </div>
              </div>
              <div className="text-xs font-semibold text-white line-clamp-1">
                {c.heading}
              </div>
              <div className="text-[10px] text-zinc-400 mt-0.5">
                {c.category}
              </div>
            </button>
          );
        })}

        {/* Quick Vault Drawer inside Navigator */}
        {vaultDocs.length > 0 && (
          <div className="pt-3 mt-3 border-t border-white/[0.07] space-y-1.5">
            <div className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 px-1">
              RECENT VAULT DELIVERABLES ({vaultDocs.length})
            </div>
            {vaultDocs.slice(0, 6).map((d) => (
              <div
                key={d.id}
                className="p-2.5 rounded-xl bg-white/[0.015] hover:bg-white/[0.04] border border-white/[0.05] flex items-center justify-between gap-2"
              >
                <div className="min-w-0">
                  <div className="text-[11px] font-medium text-zinc-200 truncate">
                    {d.title}
                  </div>
                  <div className="text-[9px] font-mono text-zinc-500">
                    {d.displayId || d.format?.toUpperCase()}
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => loadVaultDocIntoIde(d)}
                    className="px-2 py-1 rounded bg-red-500/15 hover:bg-red-500/30 text-[9px] font-mono text-red-200"
                    title="Load into Redline Canvas"
                  >
                    Redline
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewVaultDoc(d)}
                    className="p-1 rounded bg-white/5 hover:bg-white/10 text-zinc-300"
                    title="Preview PDF"
                  >
                    <Eye size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderCanvasWindow = (paneIndex: number) => (
    <div className="h-full flex flex-col bg-[#080b12] border border-white/[0.09] rounded-2xl overflow-hidden shadow-2xl">
      {/* Modular Window Header */}
      <div className="px-4 py-2.5 border-b border-white/[0.07] bg-[#0c101a] flex flex-wrap items-center justify-between gap-2 flex-shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <FileCheck2 size={15} className="text-red-400 flex-shrink-0" />
          <input
            value={docTitle}
            onChange={(e) => setDocTitle(e.target.value)}
            className="bg-transparent text-xs sm:text-sm font-bold text-white focus:outline-none truncate max-w-[220px] sm:max-w-md"
          />
          <span className="hidden xl:inline-block px-2 py-0.5 rounded bg-white/[0.05] text-[10px] font-mono text-zinc-400">
            {displayId}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {/* View Mode Selector */}
          <div className="flex items-center bg-black/50 p-0.5 rounded-lg border border-white/[0.08]">
            {(
              [
                { id: "track_changes", label: "Redline" },
                { id: "side_by_side", label: "Split" },
                { id: "clean_preview", label: "Clean" },
              ] as const
            ).map((vm) => (
              <button
                key={vm.id}
                type="button"
                onClick={() => setCanvasViewMode(vm.id)}
                className={`px-2 py-1 rounded text-[10px] font-mono uppercase transition-all ${
                  canvasViewMode === vm.id
                    ? "bg-red-600 text-white font-bold"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                {vm.label}
              </button>
            ))}
          </div>

          <div className="hidden lg:flex items-center gap-1 ml-1">
            <button
              type="button"
              onClick={() => movePaneOrder("canvas", -1)}
              disabled={paneIndex === 0}
              className="p-1 rounded hover:bg-white/10 text-zinc-400 disabled:opacity-30"
              title="Move Window Left"
            >
              <ChevronLeft size={13} />
            </button>
            <button
              type="button"
              onClick={() => movePaneOrder("canvas", 1)}
              disabled={paneIndex === activeDesktopPanes.length - 1}
              className="p-1 rounded hover:bg-white/10 text-zinc-400 disabled:opacity-30"
              title="Move Window Right"
            >
              <ChevronRight size={13} />
            </button>
            <button
              type="button"
              onClick={() =>
                setMaximizedPane(maximizedPane === "canvas" ? null : "canvas")
              }
              className="p-1 rounded hover:bg-white/10 text-zinc-400"
              title="Maximize / Restore Window"
            >
              {maximizedPane === "canvas" ? (
                <Minimize2 size={12} />
              ) : (
                <Maximize2 size={12} />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Posture & Quick Deliverable Action Sub-Bar */}
      <div className="px-4 py-2 border-b border-white/[0.06] bg-[#090c14] flex flex-wrap items-center justify-between gap-2 flex-shrink-0">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[10px] font-mono uppercase text-zinc-500">
            POSTURE:
          </span>
          {[
            "Strongly Pro-Buyer",
            "Balanced Mutual",
            "Strongly Pro-Seller",
            "Uncapped IP & Fraud",
          ].map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => {
                setNegotiationPosture(p);
                handleAiReviseClause(p);
              }}
              className={`px-2 py-0.5 rounded-full text-[10px] font-mono transition-colors ${
                negotiationPosture === p
                  ? "bg-red-500/25 text-red-200 border border-red-500/40"
                  : "bg-white/[0.03] text-zinc-400 hover:text-white border border-white/[0.07]"
              }`}
            >
              {p}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            disabled={compiling}
            onClick={() => handleCompileDocument(false)}
            className="px-2.5 py-1 rounded-lg bg-red-600 hover:bg-red-500 disabled:opacity-50 text-[10px] font-mono font-bold text-white flex items-center gap-1.5 shadow-[0_0_15px_rgba(220,38,38,0.25)]"
          >
            <FileCheck2 size={12} />
            <span>
              {compiling ? "Compiling..." : "Export PDF + Word (.docx)"}
            </span>
          </button>
          <button
            type="button"
            disabled={compiling}
            onClick={() => handleCompileDocument(true)}
            className="px-2.5 py-1 rounded-lg bg-white/[0.06] hover:bg-white/10 text-[10px] font-mono text-zinc-200 border border-white/10"
          >
            Clean PDF
          </button>
        </div>
      </div>

      {/* Compiled Deliverable Download Strip */}
      {compiledDeliverable && (
        <div className="px-4 py-2.5 bg-gradient-to-r from-red-950/50 via-blue-950/40 to-[#0c101a] border-b border-red-500/30 flex flex-wrap items-center justify-between gap-2 flex-shrink-0">
          <div className="text-xs font-semibold text-white flex items-center gap-2">
            <CheckCircle2 size={14} className="text-emerald-400" />
            <span>Deliverables Compiled:</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {compiledDeliverable.pdfUrl && (
              <a
                href={compiledDeliverable.pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-2.5 py-1 rounded-lg bg-red-600/30 border border-red-500/50 text-[10px] font-mono font-bold text-red-100 flex items-center gap-1 no-underline"
              >
                <FileText size={11} /> View Redline PDF
              </a>
            )}
            {compiledDeliverable.docxUrl && (
              <a
                href={compiledDeliverable.docxUrl}
                download
                className="px-2.5 py-1 rounded-lg bg-blue-600/30 border border-blue-500/50 text-[10px] font-mono font-bold text-blue-100 flex items-center gap-1 no-underline"
              >
                <Download size={11} /> Download Word (.docx) Track Changes
              </a>
            )}
          </div>
        </div>
      )}

      {/* Highlighted Selection Floating Action Bar */}
      {selectedQuote && (
        <div className="px-4 py-2 bg-blue-950/40 border-b border-blue-500/30 flex flex-wrap items-center justify-between gap-2 flex-shrink-0">
          <div className="text-[11px] text-blue-200 truncate max-w-md">
            Selected: <em className="text-white">"{selectedQuote}"</em>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() =>
                handleAskCopilot(
                  `What is the legal risk of the phrase "${selectedQuote}" and how should we revise it?`
                )
              }
              className="px-2 py-1 rounded bg-red-600/30 border border-red-500/40 text-[10px] font-mono text-red-100"
            >
              Ask AI About Selection
            </button>
            <button
              type="button"
              onClick={() => {
                setCopilotTab("annotations");
                setMobilePane("copilot");
              }}
              className="px-2 py-1 rounded bg-blue-600/30 border border-blue-500/40 text-[10px] font-mono text-blue-100"
            >
              Annotate Selection
            </button>
            <button
              type="button"
              onClick={() => setSelectedQuote("")}
              className="text-zinc-400 hover:text-white"
            >
              <X size={12} />
            </button>
          </div>
        </div>
      )}

      {/* Interactive Clauses Document Stream */}
      <div
        onMouseUp={handleCaptureSelection}
        className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 custom-scrollbar"
      >
        {clauses.map((clause) => {
          const isSelected = clause.id === activeClause?.id;
          const isEditing = editingClauseId === clause.id;
          const tokens = computeWordDiffTokens(
            clause.originalText,
            clause.proposedText
          );
          const clauseAnnotations = annotations.filter(
            (a) => a.clauseId === clause.id
          );

          return (
            <div
              key={clause.id}
              onClick={() => setSelectedClauseId(clause.id)}
              className={`rounded-2xl p-4 sm:p-5 border transition-all ${
                isSelected
                  ? "bg-[#0e1320] border-red-500/50 shadow-[0_0_30px_rgba(220,38,38,0.12)]"
                  : "bg-[#0a0d16] border-white/[0.07] hover:border-white/20"
              }`}
            >
              {/* Clause Top Bar */}
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3 pb-2.5 border-b border-white/[0.06]">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-bold text-white">
                    {clause.heading}
                  </span>
                  <span
                    className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded uppercase ${
                      clause.riskSeverity === "CRITICAL"
                        ? "bg-red-500/20 text-red-300 border border-red-500/30"
                        : clause.riskSeverity === "HIGH"
                        ? "bg-orange-500/20 text-orange-300 border border-orange-500/30"
                        : "bg-emerald-500/20 text-emerald-300"
                    }`}
                  >
                    {clause.riskSeverity} RISK
                  </span>
                  {clause.lastEditedBy && (
                    <span className="text-[10px] font-mono text-zinc-500">
                      • {clause.lastEditedBy}
                    </span>
                  )}
                </div>

                {/* Interactive Accept / Reject / Edit / AI / Red-Team Controls */}
                <div
                  className="flex flex-wrap items-center gap-1.5"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    type="button"
                    onClick={() => updateClauseStatus(clause.id, "ACCEPTED")}
                    className={`px-2 py-1 rounded-lg text-[10px] font-mono font-semibold flex items-center gap-1 border transition-colors ${
                      clause.status === "ACCEPTED"
                        ? "bg-emerald-600 text-white border-emerald-400"
                        : "bg-emerald-500/10 hover:bg-emerald-500/25 text-emerald-300 border-emerald-500/30"
                    }`}
                    title="Accept Proposed Redline"
                  >
                    <Check size={11} /> Accept
                  </button>

                  <button
                    type="button"
                    onClick={() => updateClauseStatus(clause.id, "REJECTED")}
                    className={`px-2 py-1 rounded-lg text-[10px] font-mono font-semibold flex items-center gap-1 border transition-colors ${
                      clause.status === "REJECTED"
                        ? "bg-zinc-700 text-white border-zinc-500"
                        : "bg-white/[0.04] hover:bg-white/10 text-zinc-300 border-white/10"
                    }`}
                    title="Reject Redline & Revert to Original"
                  >
                    <RotateCcw size={11} /> Reject
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setEditingClauseId(isEditing ? null : clause.id)
                    }
                    className="px-2 py-1 rounded-lg bg-blue-500/15 hover:bg-blue-500/25 border border-blue-500/30 text-[10px] font-mono text-blue-200 flex items-center gap-1"
                  >
                    <Edit3 size={11} /> {isEditing ? "Done" : "Edit"}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedClauseId(clause.id);
                      setCopilotTab("ai");
                      setMobilePane("copilot");
                    }}
                    className="px-2 py-1 rounded-lg bg-red-500/15 hover:bg-red-500/25 border border-red-500/30 text-[10px] font-mono text-red-200 flex items-center gap-1"
                  >
                    <Sparkles size={11} /> Ask AI
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedClauseId(clause.id);
                      handleRunRedTeam();
                    }}
                    className="px-2 py-1 rounded-lg bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/30 text-[10px] font-mono text-purple-200 flex items-center gap-1"
                    title="Simulate Opposing Counsel Pushback"
                  >
                    <Swords size={11} /> Red-Team
                  </button>
                </div>
              </div>

              {/* Inline Editor if active */}
              {isEditing ? (
                <div
                  className="space-y-2.5 my-2"
                  onClick={(e) => e.stopPropagation()}
                >
                  <label className="text-[10px] font-mono uppercase text-blue-300">
                    Edit Proposed Redline Language (Live Diff Updates Automatically):
                  </label>
                  <textarea
                    rows={4}
                    value={clause.proposedText}
                    onChange={(e) =>
                      updateClauseProposedText(clause.id, e.target.value)
                    }
                    className="w-full p-3 rounded-xl bg-black/60 border border-blue-500/40 text-xs sm:text-sm text-white focus:outline-none"
                  />
                </div>
              ) : (
                <>
                  {canvasViewMode === "track_changes" && (
                    <div className="text-xs sm:text-sm leading-relaxed text-zinc-200 bg-black/40 p-4 rounded-xl border border-white/[0.05] font-serif">
                      {clause.status === "ACCEPTED" ? (
                        <span>{clause.proposedText}</span>
                      ) : clause.status === "REJECTED" ? (
                        <span>{clause.originalText}</span>
                      ) : (
                        tokens.map((t, idx) =>
                          t.type === "del" ? (
                            <del
                              key={idx}
                              className="bg-red-500/20 text-red-300 line-through px-0.5 rounded decoration-red-400"
                            >
                              {t.text}
                            </del>
                          ) : t.type === "ins" ? (
                            <ins
                              key={idx}
                              className="bg-blue-500/20 text-blue-200 underline decoration-blue-400 px-0.5 rounded font-medium"
                            >
                              {t.text}
                            </ins>
                          ) : (
                            <span key={idx}>{t.text}</span>
                          )
                        )
                      )}
                    </div>
                  )}

                  {canvasViewMode === "side_by_side" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="p-3.5 rounded-xl bg-red-950/15 border border-red-500/20">
                        <div className="text-[10px] font-mono uppercase text-red-300 mb-1.5 font-bold">
                          Counterparty Original
                        </div>
                        <p className="text-xs text-zinc-300 leading-relaxed">
                          {clause.originalText}
                        </p>
                      </div>
                      <div className="p-3.5 rounded-xl bg-blue-950/15 border border-blue-500/25">
                        <div className="text-[10px] font-mono uppercase text-blue-300 mb-1.5 font-bold">
                          Vigil Counsel Markup
                        </div>
                        <p className="text-xs text-zinc-100 leading-relaxed">
                          {clause.proposedText}
                        </p>
                      </div>
                    </div>
                  )}

                  {canvasViewMode === "clean_preview" && (
                    <div className="text-xs sm:text-sm leading-relaxed text-zinc-100 bg-black/40 p-4 rounded-xl border border-white/[0.05] font-serif">
                      {clause.status === "REJECTED"
                        ? clause.originalText
                        : clause.proposedText}
                    </div>
                  )}
                </>
              )}

              {/* Counsel Rationale & Margin Annotation Badges */}
              <div className="mt-3 pt-2.5 border-t border-white/[0.05] flex flex-wrap items-center justify-between gap-2 text-[11px]">
                <div className="text-zinc-400 flex-1 min-w-[200px]">
                  <span className="font-mono uppercase text-[10px] text-amber-400 mr-1.5">
                    [COUNSEL RATIONALE]:
                  </span>
                  {clause.rationale}
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedClauseId(clause.id);
                    setCopilotTab("annotations");
                    setMobilePane("copilot");
                  }}
                  className="px-2.5 py-1 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-[10px] font-mono text-zinc-200 flex items-center gap-1.5"
                >
                  <MessageSquare size={11} className="text-blue-400" />
                  <span>
                    {clauseAnnotations.length} Annotation
                    {clauseAnnotations.length === 1 ? "" : "s"}
                  </span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderCopilotWindow = (paneIndex: number) => (
    <div className="h-full flex flex-col bg-[#07090f] border border-white/[0.08] rounded-2xl overflow-hidden shadow-xl">
      {/* Modular Window Header */}
      <div className="px-3.5 py-2.5 border-b border-white/[0.07] bg-[#0b0e17] flex items-center justify-between gap-2 flex-shrink-0">
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
          {(
            [
              {
                id: "annotations",
                label: `Notes (${annotations.length})`,
                icon: MessageSquare,
              },
              { id: "ai", label: "AI Copilot", icon: Sparkles },
              { id: "redteam", label: "Red-Team", icon: Swords },
              { id: "clausebank", label: "Clause Bank", icon: BookOpen },
            ] as const
          ).map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setCopilotTab(t.id)}
                className={`px-2 py-1 rounded-lg text-[10px] font-mono uppercase flex items-center gap-1 flex-shrink-0 transition-all ${
                  copilotTab === t.id
                    ? "bg-red-600/25 text-white border border-red-500/40 font-bold"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                <Icon size={11} className="text-red-400" />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>

        <div className="hidden lg:flex items-center gap-1 flex-shrink-0">
          <button
            type="button"
            onClick={() => movePaneOrder("copilot", -1)}
            disabled={paneIndex === 0}
            className="p-1 rounded hover:bg-white/10 text-zinc-400 disabled:opacity-30"
            title="Move Window Left"
          >
            <ChevronLeft size={13} />
          </button>
          <button
            type="button"
            onClick={() => movePaneOrder("copilot", 1)}
            disabled={paneIndex === activeDesktopPanes.length - 1}
            className="p-1 rounded hover:bg-white/10 text-zinc-400 disabled:opacity-30"
            title="Move Window Right"
          >
            <ChevronRight size={13} />
          </button>
          <button
            type="button"
            onClick={() =>
              setMaximizedPane(maximizedPane === "copilot" ? null : "copilot")
            }
            className="p-1 rounded hover:bg-white/10 text-zinc-400"
            title="Maximize / Restore Window"
          >
            {maximizedPane === "copilot" ? (
              <Minimize2 size={12} />
            ) : (
              <Maximize2 size={12} />
            )}
          </button>
        </div>
      </div>

      {/* Active Clause Scoped Banner */}
      <div className="px-3.5 py-2 border-b border-white/[0.06] bg-black/40 flex items-center justify-between gap-2 flex-shrink-0">
        <div className="min-w-0">
          <div className="text-[9px] font-mono uppercase text-zinc-500">
            SCOPED TO CLAUSE:
          </div>
          <div className="text-xs font-semibold text-white truncate">
            {activeClause?.heading}
          </div>
        </div>
        <select
          value={activeStakeholderId}
          onChange={(e) => setActiveStakeholderId(e.target.value)}
          className="bg-[#0d111a] border border-white/10 rounded-lg px-2 py-1 text-[10px] font-mono text-zinc-200 max-w-[150px] truncate"
          title="Switch Active Stakeholder Identity"
        >
          {stakeholders.map((s) => (
            <option key={s.id} value={s.id}>
              As: {s.name} ({s.role.split("_")[0]})
            </option>
          ))}
        </select>
      </div>

      {/* TAB 1: STAKEHOLDER ANNOTATIONS & REVIEW THREADS */}
      {copilotTab === "annotations" && (
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
          <form
            onSubmit={handleAddAnnotation}
            className="p-3 border-b border-white/[0.07] space-y-2 bg-[#0a0d15] flex-shrink-0"
          >
            <div className="grid grid-cols-4 gap-1">
              {(
                [
                  { id: "QUESTION", label: "Question" },
                  { id: "REVISION_PROPOSAL", label: "Propose Edit" },
                  { id: "RISK_FLAG", label: "Risk Flag" },
                  { id: "APPROVAL_NOTE", label: "Sign-Off" },
                ] as const
              ).map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => {
                    setNewAnnType(t.id);
                    if (t.id === "REVISION_PROPOSAL" && activeClause) {
                      setNewAnnProposedText(activeClause.proposedText);
                    }
                  }}
                  className={`py-1 px-1.5 rounded text-[9px] font-mono uppercase border ${
                    newAnnType === t.id
                      ? "bg-red-600/25 border-red-500/50 text-white font-bold"
                      : "bg-white/[0.02] border-white/10 text-zinc-400"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <textarea
              rows={2}
              value={newAnnComment}
              onChange={(e) => setNewAnnComment(e.target.value)}
              placeholder={`Add annotation as ${activeStakeholder.name}...`}
              className="w-full px-2.5 py-1.5 rounded-lg bg-black/50 border border-white/10 text-xs text-white focus:outline-none focus:border-red-500/50"
            />

            {newAnnType === "REVISION_PROPOSAL" && (
              <textarea
                rows={3}
                value={newAnnProposedText}
                onChange={(e) => setNewAnnProposedText(e.target.value)}
                placeholder="Enter proposed counter-redline text for this clause..."
                className="w-full px-2.5 py-1.5 rounded-lg bg-blue-950/25 border border-blue-500/35 text-xs text-blue-100 focus:outline-none"
              />
            )}

            <div className="flex items-center justify-between gap-2">
              <label className="flex items-center gap-1.5 text-[10px] text-zinc-400 cursor-pointer">
                <input
                  type="checkbox"
                  checked={newAnnInternalOnly}
                  onChange={(e) => setNewAnnInternalOnly(e.target.checked)}
                />
                <Lock size={10} className="text-amber-400" />
                <span>Internal Counsel Only</span>
              </label>

              <button
                type="submit"
                className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-[10px] font-mono font-bold uppercase text-white flex items-center gap-1"
              >
                <Send size={11} /> Post Note
              </button>
            </div>
          </form>

          <div className="flex-1 overflow-y-auto p-3 space-y-2.5 custom-scrollbar">
            {annotations.map((ann) => (
              <div
                key={ann.id}
                className={`p-3 rounded-xl border space-y-2 ${
                  ann.resolved
                    ? "bg-white/[0.01] border-white/[0.04] opacity-60"
                    : ann.internalOnly
                    ? "bg-amber-950/15 border-amber-500/30"
                    : "bg-[#0c1018] border-white/[0.09]"
                }`}
              >
                <div className="flex items-center justify-between gap-1.5">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="text-xs font-bold text-white truncate">
                      {ann.authorName}
                    </span>
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-white/[0.06] text-zinc-300 uppercase">
                      {ann.authorRole.replace("_", " ")}
                    </span>
                    {ann.internalOnly && (
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300">
                        INTERNAL
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setAnnotations((prev) =>
                        prev.map((a) =>
                          a.id === ann.id ? { ...a, resolved: !a.resolved } : a
                        )
                      )
                    }
                    className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-white/[0.05] hover:bg-white/10 text-zinc-300"
                  >
                    {ann.resolved ? "Reopen" : "✓ Resolve"}
                  </button>
                </div>

                <div
                  onClick={() => setSelectedClauseId(ann.clauseId)}
                  className="text-[10px] font-mono text-red-300 hover:underline cursor-pointer truncate"
                >
                  § {ann.clauseHeading}
                </div>

                {ann.selectedQuote && (
                  <div className="pl-2 border-l-2 border-blue-400 text-[11px] italic text-zinc-400">
                    "{ann.selectedQuote}"
                  </div>
                )}

                <p className="text-xs text-zinc-200 leading-relaxed">
                  {ann.comment}
                </p>

                {ann.proposedText && (
                  <div className="p-2.5 rounded-lg bg-blue-950/30 border border-blue-500/30 space-y-2">
                    <div className="text-[9px] font-mono uppercase text-blue-300">
                      Stakeholder Proposed Counter-Redline:
                    </div>
                    <p className="text-[11px] text-blue-100 leading-relaxed">
                      {ann.proposedText}
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        updateClauseProposedText(
                          ann.clauseId,
                          ann.proposedText!
                        );
                        showToast(
                          `Applied ${ann.authorName}'s counter-proposal to ${ann.clauseHeading}.`
                        );
                      }}
                      className="w-full py-1 rounded bg-blue-600 hover:bg-blue-500 text-[10px] font-mono font-bold text-white"
                    >
                      ✓ Apply Counter-Proposal to Clause
                    </button>
                  </div>
                )}

                {ann.replies?.length > 0 && (
                  <div className="pl-2.5 border-l border-white/10 space-y-1">
                    {ann.replies.map((r) => (
                      <div key={r.id} className="text-[11px] text-zinc-300">
                        <strong className="text-white">{r.authorName}: </strong>
                        {r.content}
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex items-center gap-1 pt-1">
                  <input
                    value={replyDrafts[ann.id] || ""}
                    onChange={(e) =>
                      setReplyDrafts((prev) => ({
                        ...prev,
                        [ann.id]: e.target.value,
                      }))
                    }
                    placeholder="Reply..."
                    className="flex-1 px-2 py-1 rounded bg-black/40 border border-white/10 text-[11px] text-white"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const txt = replyDrafts[ann.id]?.trim();
                      if (!txt) return;
                      setAnnotations((prev) =>
                        prev.map((a) =>
                          a.id === ann.id
                            ? {
                                ...a,
                                replies: [
                                  ...a.replies,
                                  {
                                    id: `rep-${Date.now()}`,
                                    authorName: activeStakeholder.name,
                                    authorRole: activeStakeholder.role,
                                    content: txt,
                                    createdAt: new Date().toISOString(),
                                  },
                                ],
                              }
                            : a
                        )
                      );
                      setReplyDrafts((prev) => ({ ...prev, [ann.id]: "" }));
                    }}
                    className="px-2 py-1 rounded bg-white/[0.06] hover:bg-white/10 text-[10px] font-mono text-zinc-200"
                  >
                    Reply
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: AI CLAUSE COPILOT (ASK & REVISE) */}
      {copilotTab === "ai" && (
        <div className="flex-1 overflow-y-auto p-3.5 space-y-4 custom-scrollbar">
          {/* Ask a Question about the Clause */}
          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.08] space-y-2.5">
            <div className="text-[10px] font-mono uppercase tracking-wider text-red-400 font-bold">
              1. INTERROGATE CLAUSE RISK & ENFORCEABILITY
            </div>
            <textarea
              rows={2}
              value={aiQuestion}
              onChange={(e) => setAiQuestion(e.target.value)}
              placeholder="e.g., Is this 10% liability cap enforceable under Delaware law if there is reckless misrepresentation?"
              className="w-full p-2.5 rounded-lg bg-black/50 border border-white/10 text-xs text-white focus:outline-none"
            />
            <div className="flex flex-wrap gap-1">
              {[
                "What hidden risks exist for our side?",
                "How does Delaware Chancery treat this?",
                "What market carve-outs are missing?",
              ].map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => {
                    setAiQuestion(q);
                    handleAskCopilot(q);
                  }}
                  className="px-2 py-0.5 rounded bg-white/[0.04] hover:bg-white/10 text-[10px] text-zinc-300"
                >
                  {q}
                </button>
              ))}
            </div>
            <button
              type="button"
              disabled={aiBusy}
              onClick={() => handleAskCopilot()}
              className="w-full py-2 rounded-lg bg-red-600 hover:bg-red-500 text-xs font-mono font-bold text-white"
            >
              {aiBusy ? "Analyzing Clause..." : "Ask Counsel AI Copilot"}
            </button>
          </div>

          {aiAnswer && (
            <div className="p-3.5 rounded-xl bg-[#0c101b] border border-red-500/30 text-xs text-zinc-200 leading-relaxed whitespace-pre-wrap">
              {aiAnswer}
            </div>
          )}

          {/* Instruct AI to Rewrite Clause */}
          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.08] space-y-2.5">
            <div className="text-[10px] font-mono uppercase tracking-wider text-blue-400 font-bold">
              2. AI CLAUSE REWRITER & FALLBACK GENERATOR
            </div>
            <input
              value={aiInstruction}
              onChange={(e) => setAiInstruction(e.target.value)}
              placeholder="e.g., Make mutual, cap at 2x fees, carve out IP & data breach..."
              className="w-full px-2.5 py-2 rounded-lg bg-black/50 border border-white/10 text-xs text-white focus:outline-none"
            />
            <button
              type="button"
              disabled={aiBusy}
              onClick={() => handleAiReviseClause()}
              className="w-full py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-xs font-mono font-bold text-white"
            >
              {aiBusy ? "Drafting Redline..." : "✨ Generate AI Clause Revision"}
            </button>
          </div>

          {aiSuggestedRevision && activeClause && (
            <div className="p-3.5 rounded-xl bg-blue-950/25 border border-blue-500/40 space-y-2.5">
              <div className="text-[10px] font-mono uppercase text-blue-300 font-bold">
                AI PROPOSED CLAUSE MARKUP
              </div>
              <p className="text-xs text-zinc-100 leading-relaxed">
                {aiSuggestedRevision.revised_text}
              </p>
              <div className="text-[11px] text-zinc-400 italic">
                Rationale: {aiSuggestedRevision.rationale}
              </div>
              <button
                type="button"
                onClick={() => {
                  updateClauseProposedText(
                    activeClause.id,
                    aiSuggestedRevision.revised_text
                  );
                  showToast("Applied AI revision to active clause.");
                }}
                className="w-full py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-mono font-bold text-white"
              >
                ✓ Apply Revision to Redline Canvas
              </button>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: ADVERSARIAL OPPOSING-COUNSEL SIMULATOR ("RED-TEAM WAR ROOM") */}
      {copilotTab === "redteam" && (
        <div className="flex-1 overflow-y-auto p-3.5 space-y-3 custom-scrollbar">
          <div className="p-3 rounded-xl bg-gradient-to-br from-purple-950/30 to-[#0b0e17] border border-purple-500/35 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold uppercase text-purple-300">
                ⚔️ ADVERSARIAL OPPOSING-COUNSEL SIMULATOR
              </span>
              <button
                type="button"
                disabled={redTeamBusy}
                onClick={handleRunRedTeam}
                className="px-2.5 py-1 rounded bg-purple-600 hover:bg-purple-500 text-[10px] font-mono font-bold text-white"
              >
                {redTeamBusy ? "Simulating..." : "Run Simulation"}
              </button>
            </div>
            <p className="text-[11px] text-zinc-400">
              Predicts how counterparty counsel will attack your redline on{" "}
              <strong className="text-white">{activeClause?.heading}</strong>{" "}
              and pre-builds your Tier-1 Opening, Tier-2 Compromise Fallback,
              and Walk-Away floor.
            </p>
          </div>

          {redTeamResult && activeClause && (
            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-red-950/20 border border-red-500/30 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase text-red-300 font-bold">
                    COUNTERPARTY PUSHBACK PROBABILITY
                  </span>
                  <span className="text-xs font-mono font-bold text-red-400">
                    {redTeamResult.pushback_probability}%
                  </span>
                </div>
                <p className="text-xs text-zinc-200 leading-relaxed">
                  {redTeamResult.opposing_counsel_critique}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-blue-950/25 border border-blue-500/35 space-y-2">
                <div className="text-[10px] font-mono uppercase text-blue-300 font-bold">
                  TIER 2: COMMERCIAL COMPROMISE FALLBACK CLAUSE
                </div>
                <p className="text-xs text-zinc-100 leading-relaxed">
                  {redTeamResult.tier2_fallback}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    updateClauseProposedText(
                      activeClause.id,
                      redTeamResult.tier2_fallback
                    );
                    showToast(
                      "Applied Tier-2 Commercial Fallback to active clause."
                    );
                  }}
                  className="w-full py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-[10px] font-mono font-bold text-white"
                >
                  ✓ Apply Tier-2 Fallback to Clause
                </button>
              </div>

              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/10 space-y-1.5">
                <div className="text-[10px] font-mono uppercase text-amber-300 font-bold">
                  TIER 3: WALK-AWAY DEALBREAKER FLOOR
                </div>
                <p className="text-xs text-zinc-300">
                  {redTeamResult.tier3_walkaway}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/10 space-y-1.5">
                <div className="text-[10px] font-mono uppercase text-emerald-300 font-bold">
                  PARTNER CALL TALKING POINTS
                </div>
                <ul className="space-y-1.5 text-xs text-zinc-300 list-disc pl-4">
                  {(redTeamResult.negotiation_script || []).map((pt, i) => (
                    <li key={i}>{pt}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: FIRM CLAUSE & PRECEDENT BANK */}
      {copilotTab === "clausebank" && (
        <div className="flex-1 overflow-y-auto p-3.5 space-y-2.5 custom-scrollbar">
          <div className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">
            PRE-APPROVED AMLAW 10 PRECEDENT CLAUSES
          </div>
          {FIRM_CLAUSE_BANK.map((cb) => (
            <div
              key={cb.id}
              className="p-3 rounded-xl bg-[#0c1018] border border-white/[0.08] space-y-2"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold text-white">{cb.title}</span>
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-red-500/15 text-red-300">
                  {cb.posture}
                </span>
              </div>
              <p className="text-[11px] text-zinc-300 leading-relaxed">
                {cb.text}
              </p>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    if (activeClause) {
                      updateClauseProposedText(activeClause.id, cb.text);
                      showToast(
                        `Replaced ${activeClause.heading} markup with "${cb.title}".`
                      );
                    }
                  }}
                  className="flex-1 py-1.5 rounded-lg bg-red-600/25 hover:bg-red-600/40 border border-red-500/40 text-[10px] font-mono font-semibold text-red-100"
                >
                  Apply to Selected Clause
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const newId = `clause-${Date.now()}`;
                    setClauses((prev) => [
                      ...prev,
                      {
                        id: newId,
                        heading: `Section ${prev.length + 1} — ${cb.title}`,
                        category: cb.category,
                        riskSeverity: "LOW",
                        originalText: "[Counterparty Omission — New Provision]",
                        proposedText: cb.text,
                        rationale: `Inserted from Firm Clause Bank (${cb.posture}).`,
                        status: "PENDING",
                      },
                    ]);
                    setSelectedClauseId(newId);
                    showToast(`Appended "${cb.title}" as a new section.`);
                  }}
                  className="py-1.5 px-2.5 rounded-lg bg-white/[0.06] hover:bg-white/10 text-[10px] font-mono text-zinc-200"
                >
                  + Append
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderPaneById = (paneId: PaneId, index: number) => {
    if (paneId === "navigator") return renderNavigatorWindow(index);
    if (paneId === "canvas") return renderCanvasWindow(index);
    return renderCopilotWindow(index);
  };

  return (
    <div className="h-full flex flex-col bg-[#040507] text-zinc-100 overflow-hidden">
      {/* TOP COMMAND HEADER */}
      <header className="px-4 sm:px-6 py-2.5 border-b border-white/[0.08] bg-[#080a0f]/95 backdrop-blur-xl flex flex-wrap items-center justify-between gap-3 flex-shrink-0 z-30">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-red-600/20 border border-red-500/40 flex items-center justify-center">
              <Scale size={16} className="text-red-400" />
            </div>
            <div>
              <h1 className="text-sm sm:text-base font-bold text-white tracking-tight">
                LEGAL DOCUMENT & REDLINING HARNESS
              </h1>
              <p className="text-[10px] font-mono text-zinc-400 hidden sm:block">
                Modular Multi-Window IDE • Stakeholder Review • Deal Room Matrix
              </p>
            </div>
          </div>

          {/* Primary Workspace Mode Switcher */}
          <div className="flex items-center bg-black/50 p-0.5 rounded-xl border border-white/[0.08]">
            {(
              [
                {
                  id: "ide",
                  label: "Interactive Redline IDE",
                  icon: FileCheck2,
                },
                {
                  id: "matrix",
                  label: "Deal Room Matrix",
                  icon: Table2,
                },
                {
                  id: "vault",
                  label: `Vault (${vaultDocs.length})`,
                  icon: FolderKanban,
                },
              ] as const
            ).map((m) => {
              const Icon = m.icon;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setWorkspaceMode(m.id)}
                  className={`px-2.5 py-1.5 rounded-lg text-[10px] font-mono uppercase flex items-center gap-1.5 transition-all ${
                    workspaceMode === m.id
                      ? "bg-red-600 text-white font-bold shadow"
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  <Icon size={12} />
                  <span className="hidden md:inline">{m.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Modular Window Toggles + Send Out for Stakeholder Review */}
        <div className="flex items-center gap-2 flex-wrap">
          {workspaceMode === "ide" && (
            <div className="hidden lg:flex items-center gap-1 bg-white/[0.03] px-2 py-1 rounded-xl border border-white/[0.07]">
              <Columns size={12} className="text-zinc-400 mr-1" />
              {(
                [
                  { id: "navigator", label: "Clauses" },
                  { id: "canvas", label: "Canvas" },
                  { id: "copilot", label: "Copilot & Notes" },
                ] as const
              ).map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => {
                    setMaximizedPane(null);
                    setVisiblePanes((prev) => {
                      const next = { ...prev, [p.id]: !prev[p.id] };
                      if (!next.navigator && !next.canvas && !next.copilot) {
                        return prev;
                      }
                      return next;
                    });
                  }}
                  className={`px-2 py-0.5 rounded text-[10px] font-mono transition-colors ${
                    visiblePanes[p.id]
                      ? "bg-red-500/20 text-red-200 border border-red-500/40"
                      : "text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  {p.label}
                </button>
              ))}
              <button
                type="button"
                onClick={resetPaneLayout}
                className="px-1.5 py-0.5 text-[10px] font-mono text-zinc-400 hover:text-white"
                title="Reset Window Sizes & Order"
              >
                Reset
              </button>
            </div>
          )}

          {/* SEND OUT FOR STAKEHOLDER REVIEW BUTTON */}
          <button
            type="button"
            onClick={() => {
              setShowShareModal(true);
              if (!reviewToken) {
                handleCreateOrSyncReviewLink();
              }
            }}
            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-xs font-mono font-bold text-white flex items-center gap-1.5 shadow-[0_0_20px_rgba(220,38,38,0.3)]"
          >
            <Share2 size={13} />
            <span>Send for Review</span>
            <span className="px-1.5 py-0.2 rounded-full bg-black/30 text-[10px]">
              {stakeholders.length}
            </span>
          </button>
        </div>
      </header>

      {/* TOAST NOTIFICATION */}
      {toastMessage && (
        <div className="px-4 py-2 bg-emerald-950/80 border-b border-emerald-500/40 text-emerald-200 text-xs font-mono flex items-center justify-between flex-shrink-0">
          <span>✓ {toastMessage}</span>
          <button onClick={() => setToastMessage(null)}>
            <X size={13} />
          </button>
        </div>
      )}

      {/* MAIN WORKSPACE BODY */}
      <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
        {workspaceMode === "ide" && (
          <>
            {/* DESKTOP MODULAR RESIZABLE & REARRANGEABLE MULTI-WINDOW WORKSPACE (lg+) */}
            <div
              ref={containerRef}
              className="hidden lg:flex flex-1 min-h-0 p-3 gap-0 overflow-hidden"
            >
              {activeDesktopPanes.map((paneId, idx) => {
                const widthPct = normalizedWidths[paneId];
                const nextPaneId = activeDesktopPanes[idx + 1];
                return (
                  <React.Fragment key={paneId}>
                    <div
                      style={{ width: `${widthPct}%` }}
                      className="h-full min-w-[220px] flex flex-col transition-[width] duration-75"
                    >
                      {renderPaneById(paneId, idx)}
                    </div>

                    {nextPaneId && (
                      <div
                        onMouseDown={(e) => startResize(e, paneId, nextPaneId)}
                        onDoubleClick={resetPaneLayout}
                        title="Drag to resize windows (Double-click to reset)"
                        className="w-2.5 hover:w-3 flex-shrink-0 cursor-col-resize flex items-center justify-center group select-none"
                      >
                        <div className="w-0.5 h-16 rounded-full bg-white/10 group-hover:bg-red-500 transition-colors" />
                      </div>
                    )}
                  </React.Fragment>
                );
              })}
            </div>

            {/* MOBILE & TABLET RESPONSIVE VIEWPORT (< lg) */}
            <div className="flex lg:hidden flex-1 min-h-0 overflow-hidden p-2">
              {mobilePane === "navigator" && (
                <div className="w-full h-full">{renderNavigatorWindow(0)}</div>
              )}
              {mobilePane === "canvas" && (
                <div className="w-full h-full">{renderCanvasWindow(1)}</div>
              )}
              {mobilePane === "copilot" && (
                <div className="w-full h-full">{renderCopilotWindow(2)}</div>
              )}
            </div>
          </>
        )}

        {/* MODE 2: MULTI-DOCUMENT DEAL ROOM & TABULAR DILIGENCE MATRIX */}
        {workspaceMode === "matrix" && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 custom-scrollbar">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-white">
                  Multi-Document M&A Deal Room & Clause Extraction Matrix
                </h2>
                <p className="text-xs text-zinc-400">
                  Side-by-side tabular comparison of key risk provisions across
                  data room contracts.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setDealMatrix((prev) => [
                      ...prev,
                      {
                        id: `dm-${Date.now()}`,
                        docName: docTitle,
                        counterparty: counterpartyName,
                        liabilityCap: "100% Cap + Uncapped IP/Fraud (Redlined)",
                        indemnitySurvival: "24 Months + Statutory",
                        changeOfControl: "Free M&A Assignment",
                        aiDataTraining: "Prohibited",
                        governingLaw: "Delaware",
                        riskScore: overallRiskScore,
                        status:
                          overallRiskScore > 60
                            ? "DEVIATION_REQUIRES_REDLINE"
                            : "PLAYBOOK_COMPLIANT",
                      },
                    ]);
                    showToast(`Added "${docTitle}" to Deal Room Matrix.`);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/10 border border-white/15 text-xs font-mono text-white"
                >
                  + Add Active Contract to Matrix
                </button>
                <button
                  type="button"
                  onClick={() =>
                    router.push(
                      `/chat?prompt=${encodeURIComponent(
                        `Generate an Executive M&A Due Diligence Red-Flag Report PDF synthesizing our ${dealMatrix.length}-contract Deal Room Matrix.`
                      )}`
                    )
                  }
                  className="px-3.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-xs font-mono font-bold text-white"
                >
                  Compile Diligence Report in Swarm →
                </button>
              </div>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-white/10 bg-[#080b12]">
              <table className="min-w-full text-left text-xs">
                <thead className="bg-[#0d111c] border-b border-white/10 text-[10px] font-mono uppercase text-zinc-400">
                  <tr>
                    <th className="p-3.5">Agreement / Document</th>
                    <th className="p-3.5">Counterparty</th>
                    <th className="p-3.5">Liability Cap</th>
                    <th className="p-3.5">Indemnity Survival</th>
                    <th className="p-3.5">Change of Control</th>
                    <th className="p-3.5">AI Training Rights</th>
                    <th className="p-3.5">Law</th>
                    <th className="p-3.5">Risk</th>
                    <th className="p-3.5">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.06]">
                  {dealMatrix.map((row) => (
                    <tr key={row.id} className="hover:bg-white/[0.02]">
                      <td className="p-3.5 font-semibold text-white">
                        {row.docName}
                      </td>
                      <td className="p-3.5 text-zinc-300">{row.counterparty}</td>
                      <td className="p-3.5 text-zinc-300">{row.liabilityCap}</td>
                      <td className="p-3.5 text-zinc-300">
                        {row.indemnitySurvival}
                      </td>
                      <td className="p-3.5 text-zinc-300">
                        {row.changeOfControl}
                      </td>
                      <td className="p-3.5 text-zinc-300">
                        {row.aiDataTraining}
                      </td>
                      <td className="p-3.5 font-mono text-zinc-300">
                        {row.governingLaw}
                      </td>
                      <td className="p-3.5">
                        <span
                          className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold ${
                            row.riskScore >= 70
                              ? "bg-red-500/20 text-red-300"
                              : row.riskScore >= 45
                              ? "bg-amber-500/20 text-amber-300"
                              : "bg-emerald-500/20 text-emerald-300"
                          }`}
                        >
                          {row.riskScore}/100
                        </span>
                      </td>
                      <td className="p-3.5">
                        <button
                          type="button"
                          onClick={() => {
                            setDocTitle(row.docName);
                            setCounterpartyName(row.counterparty);
                            setWorkspaceMode("ide");
                          }}
                          className="px-2.5 py-1 rounded bg-red-600/20 hover:bg-red-600/35 border border-red-500/30 text-[10px] font-mono text-red-200"
                        >
                          Open in IDE
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* MODE 3: FULL DOCUMENT VAULT REPOSITORY */}
        {workspaceMode === "vault" && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 custom-scrollbar">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="relative flex-1 max-w-md">
                <Search
                  size={15}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"
                />
                <input
                  value={vaultSearch}
                  onChange={(e) => setVaultSearch(e.target.value)}
                  placeholder="Search Vault by title, displayId, or type..."
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#0b0e17] border border-white/10 text-xs text-white focus:outline-none"
                />
              </div>
            </div>

            {vaultLoading ? (
              <div className="text-center py-12 text-zinc-500 text-xs font-mono">
                Loading Document Vault...
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {vaultDocs
                  .filter((d) =>
                    `${d.title} ${d.displayId} ${d.documentType}`
                      .toLowerCase()
                      .includes(vaultSearch.toLowerCase())
                  )
                  .map((doc) => (
                    <div
                      key={doc.id}
                      className="p-4 rounded-2xl bg-[#090c14] border border-white/[0.08] hover:border-red-500/40 transition-all flex flex-col justify-between gap-3"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-red-500/15 text-red-300 border border-red-500/30">
                            {doc.displayId || "VIGIL-DOC"}
                          </span>
                          <span className="text-[10px] font-mono uppercase text-zinc-400">
                            {doc.format || "PDF"}
                          </span>
                        </div>
                        <h3 className="text-sm font-bold text-white line-clamp-1">
                          {doc.title}
                        </h3>
                        <p className="text-[11px] text-zinc-500 mt-1">
                          Created by {doc.createdBy || "Keyes"} •{" "}
                          {new Date(doc.createdAt).toLocaleDateString()}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 pt-2 border-t border-white/[0.06]">
                        <button
                          type="button"
                          onClick={() => loadVaultDocIntoIde(doc)}
                          className="flex-1 py-1.5 rounded-lg bg-red-600/20 hover:bg-red-600/35 border border-red-500/30 text-[10px] font-mono font-bold text-red-100"
                        >
                          Open in Redline IDE
                        </button>
                        <button
                          type="button"
                          onClick={() => setPreviewVaultDoc(doc)}
                          className="p-1.5 rounded-lg bg-white/[0.05] hover:bg-white/10 text-zinc-200"
                          title="Preview"
                        >
                          <Eye size={14} />
                        </button>
                        {doc.filePath && (
                          <a
                            href={doc.filePath}
                            download
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-lg bg-white/[0.05] hover:bg-white/10 text-zinc-200"
                          >
                            <Download size={14} />
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* MOBILE STICKY BOTTOM DOCK (< lg) */}
      <nav className="lg:hidden flex items-center justify-around border-t border-white/[0.08] bg-[#080a10] py-2 px-1 flex-shrink-0 z-30">
        {(
          [
            {
              id: "navigator",
              label: "Clauses",
              icon: FolderKanban,
              mode: "ide" as const,
            },
            {
              id: "canvas",
              label: "Redline",
              icon: FileCheck2,
              mode: "ide" as const,
            },
            {
              id: "copilot",
              label: `AI & Notes (${annotations.length})`,
              icon: Sparkles,
              mode: "ide" as const,
            },
            {
              id: "matrix",
              label: "Matrix",
              icon: Table2,
              mode: "matrix" as const,
            },
            {
              id: "vault",
              label: "Vault",
              icon: Eye,
              mode: "vault" as const,
            },
          ] as const
        ).map((item) => {
          const Icon = item.icon;
          const active =
            (workspaceMode === "ide" && mobilePane === item.id) ||
            (workspaceMode !== "ide" && workspaceMode === item.mode);
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                setWorkspaceMode(item.mode);
                setMobilePane(item.id);
              }}
              className={`flex flex-col items-center gap-0.5 px-2.5 py-1 rounded-lg text-[10px] font-mono ${
                active ? "text-red-400 font-bold" : "text-zinc-400"
              }`}
            >
              <Icon size={15} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* SEND OUT FOR STAKEHOLDER REVIEW MODAL */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-2xl max-h-[90vh] rounded-2xl bg-[#090c14] border border-white/15 flex flex-col overflow-hidden shadow-2xl">
            <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Share2 size={18} className="text-red-400" />
                <div>
                  <h3 className="text-base font-bold text-white">
                    Send Out for Stakeholder Review & Collaborative Annotation
                  </h3>
                  <p className="text-[11px] text-zinc-400">
                    Invite clients, co-counsel, or counterparty counsel to
                    contribute annotations & counter-redlines.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowShareModal(false)}
                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-5 custom-scrollbar">
              {/* Shareable Stakeholder Review Link Box */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-red-950/35 to-[#0d121d] border border-red-500/35 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-red-300">
                    CRYPTOGRAPHIC STAKEHOLDER REVIEW PORTAL LINK
                  </span>
                  <button
                    type="button"
                    disabled={savingReview}
                    onClick={handleCreateOrSyncReviewLink}
                    className="text-[10px] font-mono text-emerald-300 hover:underline"
                  >
                    {savingReview ? "Syncing..." : "↻ Sync Latest Changes"}
                  </button>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <input
                    readOnly
                    value={
                      reviewToken && typeof window !== "undefined"
                        ? `${window.location.origin}/review/${reviewToken}`
                        : "Generating review link..."
                    }
                    className="flex-1 px-3 py-2 rounded-lg bg-black/60 border border-white/15 text-xs font-mono text-zinc-200"
                  />
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        if (!reviewToken) return;
                        navigator.clipboard.writeText(
                          `${window.location.origin}/review/${reviewToken}`
                        );
                        showToast("Copied Stakeholder Review Link to clipboard!");
                      }}
                      className="px-3 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-xs font-mono font-bold text-white flex items-center gap-1.5"
                    >
                      <Copy size={13} /> Copy Link
                    </button>
                    {reviewToken && (
                      <a
                        href={`/review/${reviewToken}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-2 rounded-lg bg-white/10 hover:bg-white/15 text-xs font-mono text-white flex items-center gap-1.5 no-underline"
                      >
                        <ExternalLink size={13} /> Open Portal
                      </a>
                    )}
                  </div>
                </div>

                <label className="flex items-center gap-2 text-xs text-zinc-300 cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={hideInternalFromExternal}
                    onChange={(e) =>
                      setHideInternalFromExternal(e.target.checked)
                    }
                  />
                  <span>
                    <strong>Confidentiality Shield:</strong> Automatically hide{" "}
                    <code className="text-amber-300">INTERNAL</code> counsel
                    risk notes & Red-Team strategy from external viewers on{" "}
                    <code>/review/{reviewToken || "..."}</code>
                  </span>
                </label>
              </div>

              {/* Add Stakeholder Form */}
              <form
                onSubmit={handleAddStakeholder}
                className="p-4 rounded-xl bg-white/[0.02] border border-white/10 space-y-3"
              >
                <div className="text-xs font-mono font-bold uppercase text-zinc-300">
                  Invite Stakeholder to Review Packet
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <input
                    value={newStkName}
                    onChange={(e) => setNewStkName(e.target.value)}
                    placeholder="Full Name (e.g., Sarah Jenkins)"
                    className="px-3 py-2 rounded-lg bg-black/50 border border-white/10 text-xs text-white"
                  />
                  <input
                    value={newStkEmail}
                    onChange={(e) => setNewStkEmail(e.target.value)}
                    placeholder="Email (e.g., sjenkins@client.com)"
                    className="px-3 py-2 rounded-lg bg-black/50 border border-white/10 text-xs text-white"
                  />
                  <input
                    value={newStkOrg}
                    onChange={(e) => setNewStkOrg(e.target.value)}
                    placeholder="Organization (e.g., Skadden / Counterparty)"
                    className="px-3 py-2 rounded-lg bg-black/50 border border-white/10 text-xs text-white"
                  />
                  <select
                    value={newStkRole}
                    onChange={(e) =>
                      setNewStkRole(
                        e.target.value as ReviewStakeholder["role"]
                      )
                    }
                    className="px-3 py-2 rounded-lg bg-[#0d111a] border border-white/10 text-xs text-white"
                  >
                    <option value="CLIENT_EXECUTIVE">
                      Client Executive / CFO (Sign-Off & Comment)
                    </option>
                    <option value="COUNTERPARTY_COUNSEL">
                      Counterparty Counsel (Propose Counter-Redlines)
                    </option>
                    <option value="SPECIALIST_PARTNER">
                      Co-Counsel / Specialist Partner (Full Edit)
                    </option>
                    <option value="OBSERVER">
                      Board Observer / Auditor (Comment Only)
                    </option>
                  </select>
                </div>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/15 border border-white/15 text-xs font-mono font-semibold text-white"
                >
                  + Add Stakeholder to Review Roster
                </button>
              </form>

              {/* Stakeholder Roster & Sign-Off Ledger */}
              <div className="space-y-2">
                <div className="text-xs font-mono uppercase text-zinc-400">
                  ACTIVE STAKEHOLDER ROSTER & SIGN-OFF STATUS (
                  {stakeholders.length})
                </div>
                {stakeholders.map((stk) => (
                  <div
                    key={stk.id}
                    className="p-3 rounded-xl bg-[#0d111a] border border-white/[0.08] flex flex-wrap items-center justify-between gap-2"
                  >
                    <div>
                      <div className="text-xs font-bold text-white">
                        {stk.name}{" "}
                        <span className="text-zinc-400 font-normal">
                          — {stk.organization}
                        </span>
                      </div>
                      <div className="text-[10px] font-mono text-zinc-500">
                        {stk.email} • {stk.role.replace("_", " ")} (
                        {stk.permissions})
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <select
                        value={stk.status}
                        onChange={(e) => {
                          const status = e.target
                            .value as ReviewStakeholder["status"];
                          setStakeholders((prev) =>
                            prev.map((s) =>
                              s.id === stk.id ? { ...s, status } : s
                            )
                          );
                        }}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold uppercase border ${
                          stk.status === "APPROVED"
                            ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-300"
                            : stk.status === "CHANGES_REQUESTED"
                            ? "bg-amber-500/20 border-amber-500/40 text-amber-300"
                            : "bg-white/[0.05] border-white/10 text-zinc-300"
                        }`}
                      >
                        <option value="INVITED">INVITED</option>
                        <option value="VIEWED">VIEWED</option>
                        <option value="CHANGES_REQUESTED">
                          CHANGES REQUESTED
                        </option>
                        <option value="APPROVED">APPROVED</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VAULT PDF PREVIEW MODAL */}
      {previewVaultDoc && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-4xl h-[85vh] rounded-2xl bg-[#090c14] border border-white/15 flex flex-col overflow-hidden">
            <div className="px-5 py-3.5 border-b border-white/10 flex items-center justify-between">
              <div className="text-sm font-bold text-white">
                {previewVaultDoc.title}
              </div>
              <button
                onClick={() => setPreviewVaultDoc(null)}
                className="p-1.5 rounded bg-white/5 text-zinc-400 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>
            <div className="flex-1 bg-black">
              {previewVaultDoc.filePath?.endsWith(".pdf") ? (
                <iframe
                  src={previewVaultDoc.filePath}
                  className="w-full h-full border-0"
                  title={previewVaultDoc.title}
                />
              ) : (
                <div className="p-6 text-xs font-mono text-zinc-300 whitespace-pre-wrap overflow-y-auto h-full">
                  {JSON.stringify(previewVaultDoc.metadata || {}, null, 2)}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

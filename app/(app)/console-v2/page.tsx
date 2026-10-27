"use client";

import React, { useState, useEffect, useRef } from "react";
import { useChat } from "@ai-sdk/react";
import ConstellationGraphV2, {
  SWARM_ROSTERS,
  AgentMeta,
} from "../../components/ConstellationGraphV2";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Mermaid from "../../components/Mermaid";
import { useConversation, Message } from "@/app/contexts/ConversationContext";
import {
  FileText,
  ListChecks,
  BookOpen,
  File,
  ExternalLink,
  Download,
  X,
  PanelLeftOpen,
  PanelLeftClose,
  Sparkles,
  Scale,
  ShieldAlert,
  FileCheck2,
  PieChart,
  Gavel,
  Landmark,
  Receipt,
  FolderClock,
  Plus,
  Paperclip,
  Send,
  Square,
  ChevronDown,
  ChevronRight,
  Eye,
  Cpu,
  Users,
  ArrowUpRight,
  CheckCircle2,
} from "lucide-react";
import Link from "next/link";

interface ArtifactModalState {
  isOpen: boolean;
  path: string | null;
  title: string;
  content: string;
  fileType: "markdown" | "pdf" | "latex" | "image" | "text";
  pdfPath: string | null;
  isLoading: boolean;
  error: string | null;
}

interface ReasoningEntry {
  timestamp: number;
  agent: string;
  action: string;
  message: string;
  formatted_time?: string;
  artifact_type?: string;
  path?: string;
  title?: string;
  icon?: string;
  tool?: string;
  details?: any;
}

interface FormField {
  key: string;
  label: string;
  type: string;
  options?: string[];
  required?: boolean;
}

interface HumanInteractionRequest {
  request_id: string;
  agent: string;
  question: string;
  options?: string[];
  fields?: FormField[];
  context?: any;
}

interface SwarmInfo {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
}

const EXECUTIVE_WORKFLOWS = [
  {
    id: "redline",
    title: "Redline & Blackline Contract",
    badge: "PDF + WORD .DOCX",
    accent: "#ef4444",
    icon: FileCheck2,
    description:
      "Execute token-level LCS diffing and generate both a Fortune 50 Redline PDF and native Microsoft Word (.docx) Track Changes file.",
    prompt:
      "Please redline the following indemnification and limitation of liability clause to make it strongly pro-Buyer (uncapped fraud/IP indemnity, 24-month survival, and mutual consequential damages waiver), and compile both the Redline Comparison PDF and Word (.docx) Track Changes deliverable:\n\nORIGINAL CLAUSE:\n\"Seller's aggregate liability under this Agreement for all claims shall not exceed 10% of the Purchase Price, and all representations and warranties shall survive for 6 months following the Closing Date. In no event shall Seller be liable for any consequential or punitive damages.\"",
  },
  {
    id: "diligence",
    title: "Playbook & M&A Diligence Audit",
    badge: "RISK SCORING",
    accent: "#f97316",
    icon: ShieldAlert,
    description:
      "Audit agreement clauses against firm playbook positions, score severity (0-100), and compile an Executive Red-Flag Diligence Report.",
    prompt:
      "Evaluate a standard SaaS Enterprise Master Services Agreement with a 1-month termination convenience clause for the vendor, uncapped customer indemnification, and unilateral price increases of 15% per year against our Corporate Playbook, and generate a formal Due Diligence Red-Flag Report PDF.",
  },
  {
    id: "captable",
    title: "Cap Table & Liquidation Waterfall",
    badge: "FINANCE ENGINE",
    accent: "#a855f7",
    icon: PieChart,
    description:
      "Model SAFE/convertible note conversions, option pool top-ups, and multi-tier preferred liquidation waterfalls across exit valuations.",
    prompt:
      "Model a Series A financing round and liquidation waterfall: Founders hold 8,000,000 shares, existing Seed SAFE of $2,000,000 at a $10M valuation cap (20% discount), new Series A investment of $5,000,000 at a $20,000,000 pre-money valuation with a 10% post-money option pool top-up and 1x non-participating preferred liquidation preference. Calculate dilution and model exit waterfalls at $15M, $40M, and $100M.",
  },
  {
    id: "litigation",
    title: "Bluebook Audit & Privilege Log",
    badge: "FRCP / LITIGATION",
    accent: "#3b82f6",
    icon: Gavel,
    description:
      "Verify and format legal citations to Bluebook 21st Ed., calculate FRCP statutory deadlines, or generate a Rule 26(b)(5) Privilege Log.",
    prompt:
      "Verify and format the following citations to strict Bluebook 21st Edition standards, and calculate key federal litigation deadlines (Rule 12(b) response, Rule 26(f) conference, initial disclosures) from a complaint served on 2025-05-01:\n1. Pennoyer v Neff 95 US 714 (1878)\n2. Ashcroft v. Iqbal, 556 U.S. 662, 678 (2009)\n3. 42 U.S.C. section 1983\n4. Rule 12(b)(6) of the Federal Rules of Civil Procedure",
  },
  {
    id: "securities",
    title: "SEC Form D, Blue Sky & FinCEN CTA",
    badge: "REGULATORY",
    accent: "#10b981",
    icon: Landmark,
    description:
      "Prepare Regulation D (506(b)/506(c)) Form D filings, state Blue Sky notice schedules, and FinCEN Beneficial Ownership (BOI) audits.",
    prompt:
      "Prepare an SEC Form D and State Blue Sky filing schedule for a Delaware C-Corp raising $8,500,000 under Rule 506(c) from 18 accredited investors located in NY, CA, TX, and FL, and run a FinCEN Corporate Transparency Act (CTA) & AML/KYC beneficial ownership audit.",
  },
  {
    id: "billing",
    title: "LEDES 1998B Invoice & E-Sign Packet",
    badge: "FIRM OPS",
    accent: "#eab308",
    icon: Receipt,
    description:
      "Compile UTBMS task-coded legal invoices with LEDES 1998B export strings and stage multi-signatory execution packets.",
    prompt:
      "Generate an itemized legal invoice with UTBMS task codes, LEDES 1998B export, and value-based ROI summary for our Series A financing matter (Partner Keyes: 6.5 hrs @ $1,150/hr on L120 Analysis/Strategy; Specialist O'Hara: 11.0 hrs @ $895/hr on L140 Document Drafting; Specialist Cairo: 4.5 hrs @ $850/hr on Cap Table Modeling).",
  },
];

const getAgentHexColor = (agent: string): string => {
  const coordinators = [
    "Keyes",
    "Holmes",
    "Bennet",
    "Polo",
    "Earp",
    "Selznick",
    "House",
  ];
  if (coordinators.includes(agent)) return "#ef4444";
  if (agent === "System") return "#71717a";
  let hash = 0;
  for (let i = 0; i < agent.length; i++)
    hash = agent.charCodeAt(i) + ((hash << 5) - hash);
  const hue = ((hash % 360) + 360) % 360;
  return `hsl(${hue}, 72%, 65%)`;
};

const getAgentInitials = (agent: string): string =>
  agent.replace(/[^a-zA-Z]/g, "").substring(0, 2).toUpperCase();

function SwarmTelemetryTimeline({
  logs,
  isActive,
}: {
  logs: ReasoningEntry[];
  isActive: boolean;
}) {
  const [isOpen, setIsOpen] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isActive && isOpen && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs, isActive, isOpen]);

  return (
    <div className="mb-5 rounded-xl border border-white/[0.08] bg-[#0b0d13]/90 overflow-hidden shadow-lg">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-2.5 flex items-center justify-between bg-white/[0.02] hover:bg-white/[0.04] transition-colors text-left"
      >
        <div className="flex items-center gap-2.5">
          <span
            className={`w-2 h-2 rounded-full ${
              isActive
                ? "bg-red-500 animate-ping"
                : "bg-emerald-500 shadow-[0_0_8px_#10b981]"
            }`}
          />
          <span className="text-[11px] font-mono font-bold tracking-[0.16em] uppercase text-zinc-200">
            SWARM TELEMETRY & REASONING LEDGER
          </span>
          {isActive && (
            <span className="text-[10px] font-mono text-red-400 animate-pulse">
              • EXECUTING
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/[0.05] text-zinc-400">
            {logs?.length || 0} OPS
          </span>
          {isOpen ? (
            <ChevronDown size={14} className="text-zinc-400" />
          ) : (
            <ChevronRight size={14} className="text-zinc-400" />
          )}
        </div>
      </button>

      {isOpen && (
        <div
          ref={scrollRef}
          className="p-3.5 max-h-64 overflow-y-auto custom-scrollbar space-y-2 border-t border-white/[0.05] font-mono text-xs"
        >
          {!logs || logs.length === 0 ? (
            <div className="text-zinc-500 text-[11px] py-2 flex items-center gap-2">
              <Cpu size={13} className="text-red-400 animate-spin" />
              Synchronizing specialist swarm protocols...
            </div>
          ) : (
            logs.map((log, i) => {
              const color = getAgentHexColor(log.agent || "Keyes");
              return (
                <div
                  key={i}
                  className="flex items-start gap-3 py-1.5 px-2.5 rounded-lg bg-white/[0.015] border border-white/[0.04]"
                >
                  <span
                    className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider flex-shrink-0 mt-0.5"
                    style={{
                      backgroundColor: `${color}1f`,
                      color,
                      border: `1px solid ${color}40`,
                    }}
                  >
                    {log.agent}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="text-zinc-300 text-[11px] leading-relaxed break-words">
                      {log.message}
                    </div>
                    {log.tool && (
                      <span className="inline-block mt-1 px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[10px]">
                        ◊ {log.tool}
                      </span>
                    )}
                  </div>
                  <span className="text-[9px] text-zinc-600 flex-shrink-0">
                    {new Date(log.timestamp).toLocaleTimeString([], {
                      hour12: false,
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                    })}
                  </span>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}

export default function ConsoleV2Page() {
  const {
    conversationId,
    messages: contextMessages,
    loadConversation,
    createNewConversation,
  } = useConversation();

  const [activeAgents, setActiveAgents] = useState<string[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<string>("connected");
  const [showLeftPanel, setShowLeftPanel] = useState(false);
  const [leftTab, setLeftTab] = useState<"constellation" | "roster">("constellation");

  const [showRecentModal, setShowRecentModal] = useState(false);
  const [recentCases, setRecentCases] = useState<any[]>([]);
  const [humanRequest, setHumanRequest] = useState<HumanInteractionRequest | null>(null);

  const [swarms, setSwarms] = useState<SwarmInfo[]>([]);
  const [selectedSwarm, setSelectedSwarm] = useState<string>("corporate");
  const [jurisdiction, setJurisdiction] = useState<string>("Delaware / US Federal");
  const [matterType, setMatterType] = useState<string>("M&A / Corporate");

  const [artifactModal, setArtifactModal] = useState<ArtifactModalState>({
    isOpen: false,
    path: null,
    title: "",
    content: "",
    fileType: "text",
    pdfPath: null,
    isLoading: false,
    error: null,
  });

  const [localMessages, setLocalMessages] = useState<any[]>([]);
  const [extraReasoningLogs, setExtraReasoningLogs] = useState<any[]>([]);
  const [input, setInput] = useState<string>("");
  const [attachments, setAttachments] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    messages: aiMessages,
    setMessages: setAiMessages,
    sendMessage,
    stop: handleStop,
    status,
  } = useChat({
    id: conversationId || undefined,
    body: {
      swarm_id: selectedSwarm,
      context: { jurisdiction, matter_type: matterType },
      conversation_id: conversationId,
    },
  } as any);

  const isTaskRunning = status === "streaming" || status === "submitted";

  const currentRoster =
    SWARM_ROSTERS[selectedSwarm] || SWARM_ROSTERS.corporate;
  const orchestratorName = currentRoster.coordinator.name;

  // Sync loaded conversation history
  useEffect(() => {
    if (contextMessages.length > 0) {
      setLocalMessages(contextMessages);
      const initialAi = contextMessages.flatMap((m) => {
        const msgs = [];
        if (m.user)
          msgs.push({
            id: `history-${m.id}-user`,
            role: "user",
            content: m.user,
          });
        if (m.response)
          msgs.push({
            id: `history-${m.id}-response`,
            role: "assistant",
            content: m.response,
          });
        return msgs;
      });
      setAiMessages(initialAi as any);
      setExtraReasoningLogs([]);
    } else if (conversationId) {
      setLocalMessages([]);
      setAiMessages([]);
      setExtraReasoningLogs([]);
    }
  }, [conversationId, contextMessages, setAiMessages]);

  // Initialize conversation & fetch recent cases + swarms
  useEffect(() => {
    if (!conversationId) {
      createNewConversation();
    }
  }, [conversationId, createNewConversation]);

  useEffect(() => {
    fetch("/api/conversations/_/recent?limit=12")
      .then((r) => r.json())
      .then((d) => setRecentCases(d.conversations || []))
      .catch(console.error);

    fetch("/api/swarms")
      .then((r) => r.json())
      .then((d) => {
        if (d.swarms) setSwarms(d.swarms);
      })
      .catch(console.error);
  }, []);

  // Bridge streaming state to ConstellationGraphV2
  const prevStatusRef = useRef(status);
  useEffect(() => {
    if (status === "streaming" && prevStatusRef.current !== "streaming") {
      setActiveAgents([orchestratorName]);
      window.dispatchEvent(
        new CustomEvent("basalt-agent-state-change", {
          detail: {
            agent: orchestratorName,
            action: "thinking",
            message: "Analyzing legal matter...",
          },
        })
      );

      setLocalMessages((prev) => {
        if (prev.length > 0 && prev[prev.length - 1].is_swarm_think) return prev;
        return [
          ...prev,
          {
            id: `swarm-think-${Date.now()}`,
            user: "",
            response: "",
            timestamp: new Date().toISOString(),
            is_swarm_think: true,
            reasoning_logs: [
              {
                timestamp: Date.now(),
                agent: orchestratorName,
                action: "thinking",
                message: `${orchestratorName} is orchestrating the ${currentRoster.name}...`,
              },
            ],
          },
        ];
      });
    }

    if (status === "ready" && prevStatusRef.current === "streaming") {
      setActiveAgents([]);
      window.dispatchEvent(
        new CustomEvent("basalt-agent-state-change", {
          detail: {
            agent: orchestratorName,
            action: "completed",
            message: "Deliverable complete.",
          },
        })
      );
    }
    prevStatusRef.current = status;
  }, [status, orchestratorName, currentRoster.name]);

  // Watch tool calls in AI SDK v5 parts and bridge to Constellation + SwarmTelemetryTimeline
  const processedToolKeysRef = useRef<Set<string>>(new Set());
  useEffect(() => {
    const lastMsg = aiMessages[aiMessages.length - 1];
    if (!lastMsg || lastMsg.role !== "assistant") return;
    const toolParts = (lastMsg.parts || []).filter((p: any) =>
      p.type?.startsWith("tool-")
    );

    toolParts.forEach((part: any, idx: number) => {
      const partKey = `${lastMsg.id}-${part.type}-${idx}-${part.state}`;
      if (processedToolKeysRef.current.has(partKey)) return;
      processedToolKeysRef.current.add(partKey);

      const toolName = part.type.replace("tool-", "");
      const args = part.input || part.args || {};

      window.dispatchEvent(
        new CustomEvent("basalt-agent-state-change", {
          detail: {
            agent: orchestratorName,
            action: "tool_call",
            message: `Executing ${toolName}`,
            tool: toolName,
            target: args.agent_name,
          },
        })
      );

      if (toolName === "handoff_to_agent" && args.agent_name) {
        setActiveAgents((prev) =>
          Array.from(new Set([...prev, orchestratorName, args.agent_name]))
        );
        window.dispatchEvent(
          new CustomEvent("basalt-agent-state-change", {
            detail: {
              agent: args.agent_name,
              action: "thinking",
              message: args.next_task || `Assigned by ${orchestratorName}`,
              tool: toolName,
            },
          })
        );
      }

      if (
        part.state === "input-available" ||
        part.state === "output-available"
      ) {
        setLocalMessages((prev) => {
          const next = [...prev];
          for (let i = next.length - 1; i >= 0; i--) {
            if (next[i].is_swarm_think) {
              const t = { ...next[i] };
              t.reasoning_logs = [
                ...(t.reasoning_logs || []),
                {
                  timestamp: Date.now(),
                  agent: args.agent_name || orchestratorName,
                  action: "tool_call",
                  message:
                    toolName === "handoff_to_agent"
                      ? `Handoff to ${args.agent_name}: ${args.next_task || "Specialist execution"}`
                      : `Executing specialist tool: ${toolName}`,
                  tool: toolName,
                },
              ];
              next[i] = t;
              break;
            }
          }
          return next;
        });
      }

      if (
        toolName === "ask_human" &&
        (part.state === "input-available" || part.state === "output-available")
      ) {
        const data =
          part.args || part.input || part.toolInput || part.parameters || part;
        const question = data?.question || data?.parameters?.question;
        const fields = data?.fields || data?.parameters?.fields;
        if (question && fields) {
          setHumanRequest({
            agent: orchestratorName,
            question,
            fields,
            request_id:
              part.toolCallId || part.id || `ask-human-${Date.now()}`,
          });
        }
      }
    });
  }, [aiMessages, orchestratorName]);

  // Connect to SSE activity stream
  useEffect(() => {
    const es = new EventSource("/api/activity-stream");
    es.onopen = () => setConnectionStatus("connected");
    es.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.agent || data.agent_name) {
          const agent = data.agent || data.agent_name;
          window.dispatchEvent(
            new CustomEvent("basalt-agent-state-change", {
              detail: {
                agent,
                action: data.action,
                message: data.message,
                tool: data.tool,
                target: data.details?.target || data.target,
              },
            })
          );
        }
      } catch {
        // ignore heartbeat parse issues
      }
    };
    es.onerror = () => setConnectionStatus("reconnecting");
    return () => es.close();
  }, []);

  const getMessageText = (m: any) => {
    if (typeof m.content === "string") return m.content;
    if (m.parts) {
      return m.parts
        .filter((p: any) => p.type === "text" && !p.type?.includes("reasoning"))
        .map((p: any) => p.text)
        .join("\n\n");
    }
    return "";
  };

  const getThinkingText = (m: any) => {
    if (!m.parts) return "";
    const r = m.parts.filter(
      (p: any) => p.type === "reasoning" || p.type === "thinking"
    );
    if (r.length > 0) return r.map((p: any) => p.text || p.reasoning || "").join("\n");
    return "";
  };

  const getResponseWithoutThinking = (m: any) => {
    const raw = getMessageText(m);
    return raw.replace(/^Thinking:\s*[\s\S]*?(?:\n\n)/, "").trim();
  };

  const mappedAiMessages: any[] = aiMessages
    .filter((m) => !m.id.startsWith("history-"))
    .filter((m) => {
      if (m.role === "assistant") {
        const text = getResponseWithoutThinking(m);
        if (!text || !text.trim()) return false;
      }
      if (m.role === "user") {
        const stripped = getMessageText(m)
          .split("\n\n[The following documents were uploaded")[0]
          .trim();
        if (!stripped) return false;
      }
      return true;
    })
    .map((m) => ({
      id: m.id,
      user:
        m.role === "user"
          ? getMessageText(m)
              .split("\n\n[The following documents were uploaded")[0]
              .trim()
          : "",
      response: m.role !== "user" ? getResponseWithoutThinking(m) : "",
      timestamp: new Date().toISOString(),
      agent_name: m.role === "assistant" ? orchestratorName : undefined,
      thinking_text: m.role === "assistant" ? getThinkingText(m) : "",
      ...((m as any).metadata || {}),
    }));

  const messages = [...mappedAiMessages, ...localMessages].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  const messagesContainerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop =
        messagesContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const openArtifact = async (path: string, title: string) => {
    const ext = path.split(".").pop()?.toLowerCase();
    let fileType: ArtifactModalState["fileType"] = "text";
    let pdfPath = null;
    if (ext === "md") fileType = "markdown";
    else if (ext === "pdf") fileType = "pdf";
    else if (ext === "tex") {
      fileType = "latex";
      pdfPath = path.replace(/\.tex$/i, ".pdf");
    } else if (["png", "jpg", "jpeg", "gif"].includes(ext || ""))
      fileType = "image";

    setArtifactModal({
      isOpen: true,
      path,
      title,
      content: "",
      fileType,
      pdfPath,
      isLoading: fileType !== "pdf" && fileType !== "image",
      error: null,
    });

    if (fileType === "pdf" || fileType === "image") return;

    try {
      const res = await fetch(
        `/api/artifacts/content?path=${encodeURIComponent(path)}`
      );
      if (res.ok) {
        const data = await res.json();
        setArtifactModal((prev) => ({
          ...prev,
          content: data.content,
          isLoading: false,
        }));
      } else {
        setArtifactModal((prev) => ({
          ...prev,
          error: "Failed to load artifact content",
          isLoading: false,
        }));
      }
    } catch {
      setArtifactModal((prev) => ({
        ...prev,
        error: "Failed to load artifact content",
        isLoading: false,
      }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      setAttachments((prev) => [...prev, ...files]);
    }
    e.target.value = "";
  };

  const handleSend = async (
    e?: React.FormEvent | null,
    filesOverride?: File[],
    promptOverride?: string
  ) => {
    if (e && e.preventDefault) e.preventDefault();
    const textToUse = promptOverride !== undefined ? promptOverride : input;
    const filesToProcess = filesOverride || attachments;
    if (!textToUse?.trim() && filesToProcess.length === 0) return;

    let activeConvId = conversationId;
    if (!activeConvId) {
      activeConvId = await createNewConversation();
    }

    window.dispatchEvent(new CustomEvent("basalt-task-start"));

    const fileContents: string[] = [];
    if (filesToProcess.length > 0) {
      for (const file of filesToProcess) {
        const isText =
          file.type.startsWith("text/") ||
          /\.(md|txt|csv|json|xml|html|rtf)$/i.test(file.name);
        if (isText) {
          const textContent = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onload = (ev) => resolve(ev.target?.result as string);
            reader.readAsText(file);
          });
          fileContents.push(
            `\n\n--- BEGIN FILE: ${file.name} ---\n${textContent}\n--- END FILE: ${file.name} ---`
          );
        } else if (
          file.name.toLowerCase().endsWith(".pdf") ||
          file.name.toLowerCase().endsWith(".docx")
        ) {
          const formData = new FormData();
          formData.append("file", file);
          try {
            const res = await fetch("/api/parse", {
              method: "POST",
              body: formData,
            });
            if (res.ok) {
              const data = await res.json();
              fileContents.push(
                `\n\n--- BEGIN EXTRACTED TEXT FROM: ${file.name} ---\n${data.markdown}\n--- END EXTRACTED TEXT ---`
              );
            }
          } catch {
            fileContents.push(`\n\n[Uploaded file: ${file.name}]`);
          }
        }
      }
    }

    const fullText =
      (textToUse || "").trim() +
      (fileContents.length > 0
        ? "\n\n[The following documents were uploaded by the user for analysis:]" +
          fileContents.join("")
        : "");

    if (fullText.trim()) {
      sendMessage(
        { text: fullText },
        {
          body: {
            swarm_id: selectedSwarm,
            context: { jurisdiction, matter_type: matterType },
            conversation_id: activeConvId,
          },
        }
      );
    }

    if (promptOverride === undefined) setInput("");
    setAttachments([]);
  };

  return (
    <div className="h-full flex flex-col bg-[#040507] text-zinc-100 overflow-hidden">
      {/* 1. TOP EXECUTIVE COMMAND & TELEMETRY HEADER */}
      <header className="flex-shrink-0 px-4 py-2.5 border-b border-white/[0.07] bg-[#080a0f]/90 backdrop-blur-xl flex flex-wrap items-center justify-between gap-3 z-30">
        <div className="flex items-center gap-3">
          {/* Mobile Swarm Toggle */}
          <button
            type="button"
            onClick={() => setShowLeftPanel(!showLeftPanel)}
            className="lg:hidden p-2 rounded-lg bg-white/[0.04] border border-white/10 text-zinc-300 hover:text-white"
          >
            {showLeftPanel ? <PanelLeftClose size={16} /> : <PanelLeftOpen size={16} />}
          </button>

          {/* Practice Swarm Selector */}
          <div className="flex items-center gap-2 bg-white/[0.03] border border-white/[0.09] rounded-lg px-2.5 py-1.5">
            <Scale size={14} className="text-red-500 flex-shrink-0" />
            <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 hidden sm:inline">
              SWARM:
            </span>
            <select
              value={selectedSwarm}
              onChange={(e) => setSelectedSwarm(e.target.value)}
              disabled={isTaskRunning}
              className="bg-transparent text-xs font-semibold text-white focus:outline-none cursor-pointer pr-2"
            >
              {Object.entries(SWARM_ROSTERS).map(([id, r]) => (
                <option key={id} value={id} className="bg-[#090b10] text-white">
                  {r.name} ({r.coordinator.name})
                </option>
              ))}
            </select>
          </div>

          {/* Jurisdiction Pill */}
          <div className="hidden md:flex items-center gap-2 bg-white/[0.02] border border-white/[0.07] rounded-lg px-2.5 py-1.5">
            <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">
              JURISDICTION:
            </span>
            <input
              type="text"
              value={jurisdiction}
              onChange={(e) => setJurisdiction(e.target.value)}
              className="bg-transparent text-xs text-zinc-200 focus:outline-none w-36 font-medium"
              placeholder="e.g. Delaware / SDNY"
            />
          </div>

          {/* Matter Type Pill */}
          <div className="hidden xl:flex items-center gap-2 bg-white/[0.02] border border-white/[0.07] rounded-lg px-2.5 py-1.5">
            <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">
              MATTER:
            </span>
            <select
              value={matterType}
              onChange={(e) => setMatterType(e.target.value)}
              className="bg-transparent text-xs text-zinc-200 focus:outline-none cursor-pointer"
            >
              <option value="M&A / Corporate" className="bg-[#090b10]">M&A / Corporate</option>
              <option value="Contract Redline" className="bg-[#090b10]">Contract Redline</option>
              <option value="Venture / Cap Table" className="bg-[#090b10]">Venture / Cap Table</option>
              <option value="Securities / Form D" className="bg-[#090b10]">Securities / Form D</option>
              <option value="Commercial Litigation" className="bg-[#090b10]">Commercial Litigation</option>
              <option value="IP & Patent Audit" className="bg-[#090b10]">IP & Patent Audit</option>
            </select>
          </div>
        </div>

        {/* Right Matter Controls & Adjacent Preview Switcher */}
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-[10px] font-mono text-emerald-300">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            PLAYBOOK ACTIVE
          </div>

          <button
            type="button"
            onClick={() => setShowRecentModal(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.08] text-xs text-zinc-300 transition-colors"
          >
            <FolderClock size={13} className="text-zinc-400" />
            <span className="hidden sm:inline">Matters</span>
          </button>

          <button
            type="button"
            onClick={() => createNewConversation()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600/20 hover:bg-red-600/30 border border-red-500/40 text-xs font-semibold text-red-100 transition-colors"
          >
            <Plus size={13} />
            <span>New Matter</span>
          </button>

          <Link
            href="/chat"
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.1] border border-white/10 text-[11px] font-mono text-zinc-400 hover:text-white transition-colors"
            title="Switch back to original Console (/chat) for side-by-side comparison"
          >
            <span>Classic UI</span>
            <ArrowUpRight size={12} />
          </Link>
        </div>
      </header>

      {/* 2. MAIN SPLIT-SCREEN COMMAND WORKSPACE */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* LEFT PANE: Upgraded ConstellationGraphV2 + Specialist Roster */}
        <aside
          className={`fixed lg:relative inset-y-0 left-0 z-40 lg:z-10 w-[88vw] sm:w-[420px] lg:w-[44%] xl:w-[42%] flex-shrink-0 flex flex-col border-r border-white/[0.07] bg-[#06070b] transition-transform duration-300 ${
            showLeftPanel ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          }`}
        >
          {/* Sub-header view switcher (Constellation Radar vs Specialist Roster Matrix) */}
          <div className="flex items-center justify-between px-3 py-2 border-b border-white/[0.06] bg-[#090b10]">
            <div className="flex items-center gap-1 bg-black/40 p-0.5 rounded-lg border border-white/[0.06]">
              <button
                type="button"
                onClick={() => setLeftTab("constellation")}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-mono uppercase tracking-wider transition-all ${
                  leftTab === "constellation"
                    ? "bg-red-600/25 text-white border border-red-500/40"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                <Sparkles size={11} className="text-red-400" />
                Swarm Constellation
              </button>
              <button
                type="button"
                onClick={() => setLeftTab("roster")}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-mono uppercase tracking-wider transition-all ${
                  leftTab === "roster"
                    ? "bg-red-600/25 text-white border border-red-500/40"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                <Users size={11} className="text-red-400" />
                Specialist Roster ({currentRoster.specialists.length + 1})
              </button>
            </div>

            <button
              type="button"
              onClick={() => setShowLeftPanel(false)}
              className="lg:hidden p-1 text-zinc-400 hover:text-white"
            >
              <X size={16} />
            </button>
          </div>

          {/* Left Pane Body */}
          <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
            {leftTab === "constellation" ? (
              <ConstellationGraphV2
                swarmId={selectedSwarm}
                activeAgents={activeAgents}
                onTriggerQuickPrompt={(promptText) => setInput(promptText)}
              />
            ) : (
              <div className="flex-1 overflow-y-auto p-3.5 space-y-2.5 custom-scrollbar">
                {/* Coordinator Card */}
                {[currentRoster.coordinator, ...currentRoster.specialists].map(
                  (agent: AgentMeta) => (
                    <div
                      key={agent.id}
                      className="p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.04] border border-white/[0.07] transition-all"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center font-mono font-bold text-xs border"
                            style={{
                              backgroundColor: `${agent.accent}18`,
                              borderColor: `${agent.accent}55`,
                              color: agent.accent,
                            }}
                          >
                            {agent.name.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-white uppercase tracking-wider">
                                {agent.name}
                              </span>
                              <span
                                className="text-[9px] font-mono px-1.5 py-0.5 rounded uppercase"
                                style={{
                                  backgroundColor: `${agent.accent}20`,
                                  color: agent.accent,
                                }}
                              >
                                {agent.division}
                              </span>
                            </div>
                            <div className="text-[11px] text-zinc-400">
                              {agent.role}
                            </div>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            setInput(
                              `@${agent.name} — Please assist with ${agent.role.toLowerCase()} using ${agent.tools[0]}:`
                            );
                          }}
                          className="px-2 py-1 rounded bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-[10px] font-mono text-zinc-300"
                        >
                          Assign →
                        </button>
                      </div>

                      <div className="mt-2 flex flex-wrap gap-1">
                        {agent.tools.map((t) => (
                          <span
                            key={t}
                            className="px-1.5 py-0.5 rounded bg-black/40 border border-white/[0.06] text-[9px] font-mono text-zinc-400"
                          >
                            ◊ {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  )
                )}
              </div>
            )}
          </div>
        </aside>

        {/* RIGHT PANE: Executive Legal Workspace & Prompt Composer */}
        <section className="flex-1 flex flex-col min-w-0 min-h-0 bg-[#07090e]">
          {/* Scrollable Conversation & Command Deck Container */}
          <div
            ref={messagesContainerRef}
            className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar min-h-0"
          >
            {messages.length === 0 ? (
              /* EXECUTIVE WELCOME COMMAND DECK */
              <div className="max-w-4xl mx-auto py-4 animate-fade-in">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 mb-6 border-b border-white/[0.07]">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-600/25 to-red-950/40 border border-red-500/30 flex items-center justify-center shadow-[0_0_30px_rgba(220,38,38,0.2)]">
                      <img
                        src="/Vigil.png"
                        alt="Vigil"
                        className="w-9 h-9 object-contain"
                      />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h1 className="text-2xl font-bold tracking-tight text-white font-vox">
                          BASALT VIGIL
                        </h1>
                        <span className="px-2 py-0.5 rounded-full bg-red-500/15 border border-red-500/30 text-[10px] font-mono font-semibold text-red-300 uppercase tracking-widest">
                          AMLAW 10 SUITE V2
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-zinc-400 mt-0.5">
                        Orchestrated by{" "}
                        <strong className="text-white">{orchestratorName}</strong>{" "}
                        • {currentRoster.specialists.length} Practice Specialists Ready
                      </p>
                    </div>
                  </div>

                  {recentCases.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setShowRecentModal(true)}
                      className="self-start sm:self-auto px-3.5 py-2 rounded-xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/10 text-xs text-zinc-300 flex items-center gap-2 transition-colors"
                    >
                      <FolderClock size={14} className="text-red-400" />
                      <span>Resume Recent Matter ({recentCases.length})</span>
                    </button>
                  )}
                </div>

                {/* 6 AmLaw 10 Partner Workflow Cards */}
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-[11px] font-mono uppercase tracking-[0.16em] text-zinc-400 font-semibold">
                    EXECUTIVE WORKFLOW LAUNCHPADS
                  </span>
                  <span className="text-[10px] font-mono text-zinc-500">
                    Click any card to launch or customize prompt
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {EXECUTIVE_WORKFLOWS.map((wf) => {
                    const Icon = wf.icon;
                    return (
                      <div
                        key={wf.id}
                        className="group relative rounded-xl p-4 bg-[#0b0e16] hover:bg-[#101420] border border-white/[0.07] hover:border-white/[0.18] transition-all flex flex-col justify-between shadow-lg"
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-2.5">
                            <div className="flex items-center gap-2.5">
                              <div
                                className="w-8 h-8 rounded-lg flex items-center justify-center border"
                                style={{
                                  backgroundColor: `${wf.accent}18`,
                                  borderColor: `${wf.accent}45`,
                                  color: wf.accent,
                                }}
                              >
                                <Icon size={16} />
                              </div>
                              <h3 className="text-sm font-semibold text-white group-hover:text-red-200 transition-colors">
                                {wf.title}
                              </h3>
                            </div>
                            <span
                              className="text-[9px] font-mono font-bold px-2 py-0.5 rounded uppercase tracking-wider"
                              style={{
                                backgroundColor: `${wf.accent}1a`,
                                color: wf.accent,
                              }}
                            >
                              {wf.badge}
                            </span>
                          </div>
                          <p className="text-xs text-zinc-400 leading-relaxed mb-3.5">
                            {wf.description}
                          </p>
                        </div>

                        <div className="flex items-center gap-2 pt-2.5 border-t border-white/[0.05]">
                          <button
                            type="button"
                            onClick={() => setInput(wf.prompt)}
                            className="flex-1 py-1.5 px-2.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.09] text-[11px] font-mono text-zinc-300 hover:text-white transition-colors text-center"
                          >
                            Load into Composer
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSend(null, [], wf.prompt)}
                            className="py-1.5 px-3 rounded-lg bg-red-600/25 hover:bg-red-600/40 border border-red-500/40 text-[11px] font-mono font-semibold text-red-100 transition-colors flex items-center gap-1"
                          >
                            <span>Execute</span>
                            <ArrowUpRight size={12} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              /* CONVERSATION STREAM */
              <div className="max-w-4xl mx-auto space-y-4">
                {messages.map((msg, i) => (
                  <div key={msg.id} className="animate-slide-up">
                    {msg.is_swarm_think && (
                      <SwarmTelemetryTimeline
                        logs={msg.reasoning_logs || []}
                        isActive={isTaskRunning && i >= messages.length - 2}
                      />
                    )}

                    {!msg.is_swarm_think && !msg.is_handoff_divider && (
                      <div
                        className={`rounded-2xl border p-5 transition-all ${
                          msg.user
                            ? "bg-gradient-to-br from-red-950/20 to-[#0c0e14] border-red-500/25"
                            : "bg-[#0b0e15] border-white/[0.08] shadow-xl"
                        }`}
                      >
                        {/* Header */}
                        <div className="flex items-center justify-between gap-3 mb-3 pb-2.5 border-b border-white/[0.05]">
                          <div className="flex items-center gap-2.5">
                            <div
                              className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-mono font-bold"
                              style={
                                msg.user
                                  ? {
                                      backgroundColor: "#dc2626",
                                      color: "#ffffff",
                                    }
                                  : {
                                      backgroundColor: `${getAgentHexColor(
                                        msg.agent_name || orchestratorName
                                      )}22`,
                                      color: getAgentHexColor(
                                        msg.agent_name || orchestratorName
                                      ),
                                      border: `1px solid ${getAgentHexColor(
                                        msg.agent_name || orchestratorName
                                      )}55`,
                                    }
                              }
                            >
                              {msg.user
                                ? "U"
                                : getAgentInitials(
                                    msg.agent_name || orchestratorName
                                  )}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold tracking-wider uppercase text-white">
                                  {msg.user
                                    ? "COUNSEL / USER"
                                    : msg.agent_name || orchestratorName}
                                </span>
                                {!msg.user && (
                                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-white/[0.05] text-zinc-400 uppercase">
                                    {currentRoster.name}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          <span className="text-[10px] font-mono text-zinc-500">
                            {new Date(msg.timestamp).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                              second: "2-digit",
                            })}
                          </span>
                        </div>

                        {/* Body */}
                        {msg.user ? (
                          <div className="text-sm text-zinc-200 leading-relaxed whitespace-pre-wrap">
                            {msg.user}
                          </div>
                        ) : (
                          <div className="prose prose-sm prose-invert max-w-none">
                            <ReactMarkdown
                              remarkPlugins={[remarkGfm]}
                              components={{
                                p: ({ children }) => (
                                  <div className="text-sm leading-relaxed mb-2.5 text-zinc-300 whitespace-pre-wrap">
                                    {children}
                                  </div>
                                ),
                                h1: ({ children }) => (
                                  <h1 className="text-lg font-bold text-white mt-4 mb-2 border-b border-white/10 pb-1.5">
                                    {children}
                                  </h1>
                                ),
                                h2: ({ children }) => (
                                  <h2 className="text-base font-semibold text-zinc-100 mt-3.5 mb-1.5">
                                    {children}
                                  </h2>
                                ),
                                h3: ({ children }) => (
                                  <h3 className="text-sm font-semibold text-zinc-200 mt-2.5 mb-1">
                                    {children}
                                  </h3>
                                ),
                                table: ({ children }) => (
                                  <div className="overflow-x-auto my-3 border border-white/10 rounded-xl">
                                    <table className="min-w-full text-left text-xs text-zinc-300">
                                      {children}
                                    </table>
                                  </div>
                                ),
                                thead: ({ children }) => (
                                  <thead className="bg-white/[0.04] border-b border-white/10 text-[10px] font-mono uppercase text-zinc-400">
                                    {children}
                                  </thead>
                                ),
                                th: ({ children }) => (
                                  <th className="px-3.5 py-2.5 font-semibold">
                                    {children}
                                  </th>
                                ),
                                td: ({ children }) => (
                                  <td className="px-3.5 py-2 border-b border-white/[0.04]">
                                    {children}
                                  </td>
                                ),
                                code: ({ className, children, ...props }: any) => {
                                  const match = /language-mermaid/.exec(
                                    className || ""
                                  );
                                  if (match) {
                                    return (
                                      <Mermaid
                                        chart={String(children).replace(/\n$/, "")}
                                      />
                                    );
                                  }
                                  const isInline = !className;
                                  return (
                                    <code
                                      className={`${className} ${
                                        isInline
                                          ? "bg-white/10 px-1.5 py-0.5 rounded text-red-200"
                                          : "block bg-black/60 p-3.5 rounded-xl border border-white/10 my-2.5 overflow-x-auto"
                                      } font-mono text-xs`}
                                      {...props}
                                    >
                                      {children}
                                    </code>
                                  );
                                },
                                a: ({ href, children }) => {
                                  if (href?.toLowerCase().endsWith(".pdf")) {
                                    return (
                                      <div
                                        onClick={(e) => {
                                          e.preventDefault();
                                          openArtifact(
                                            href,
                                            String(children || "Legal PDF Deliverable")
                                          );
                                        }}
                                        className="cursor-pointer my-3 p-3.5 rounded-xl bg-gradient-to-r from-red-950/35 to-[#0f131d] border border-red-500/35 hover:border-red-400/60 transition-all flex items-center justify-between gap-4 max-w-md shadow-lg"
                                      >
                                        <div className="flex items-center gap-3 min-w-0">
                                          <div className="p-2.5 rounded-lg bg-red-500/20 text-red-400">
                                            <FileText size={20} />
                                          </div>
                                          <div className="min-w-0">
                                            <div className="text-xs font-semibold text-white truncate">
                                              {children || "View Compiled PDF"}
                                            </div>
                                            <div className="text-[10px] font-mono text-red-300/80 uppercase tracking-wider mt-0.5">
                                              FORTUNE 50 PDF DELIVERABLE
                                            </div>
                                          </div>
                                        </div>
                                        <div className="flex items-center gap-1.5 flex-shrink-0">
                                          <span className="p-1.5 rounded-lg bg-white/[0.05] text-zinc-300 hover:text-white">
                                            <Eye size={15} />
                                          </span>
                                          <a
                                            href={
                                              href.startsWith("http")
                                                ? href
                                                : `/api/artifacts/file?path=${encodeURIComponent(
                                                    href
                                                  )}`
                                            }
                                            download
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            onClick={(e) => e.stopPropagation()}
                                            className="p-1.5 rounded-lg bg-red-500/20 text-red-300 hover:bg-red-500/35"
                                          >
                                            <Download size={15} />
                                          </a>
                                        </div>
                                      </div>
                                    );
                                  }

                                  if (href?.toLowerCase().endsWith(".docx")) {
                                    const downloadUrl = href.startsWith("http")
                                      ? href
                                      : `/api/artifacts/file?path=${encodeURIComponent(
                                          href
                                        )}`;
                                    return (
                                      <a
                                        href={downloadUrl}
                                        download
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="my-3 p-3.5 rounded-xl bg-gradient-to-r from-blue-950/40 to-[#0f131d] border border-blue-500/35 hover:border-blue-400/60 transition-all flex items-center justify-between gap-4 max-w-md no-underline shadow-lg"
                                      >
                                        <div className="flex items-center gap-3 min-w-0">
                                          <div className="p-2.5 rounded-lg bg-blue-500/20 text-blue-400">
                                            <Download size={20} />
                                          </div>
                                          <div className="min-w-0">
                                            <div className="text-xs font-semibold text-white truncate">
                                              {children ||
                                                "Download Word (.docx) Redline"}
                                            </div>
                                            <div className="text-[10px] font-mono text-blue-300/80 uppercase tracking-wider mt-0.5">
                                              NATIVE WORD TRACK CHANGES (.DOCX)
                                            </div>
                                          </div>
                                        </div>
                                      </a>
                                    );
                                  }

                                  return (
                                    <a
                                      href={href}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-red-300 hover:underline"
                                    >
                                      {children}
                                    </a>
                                  );
                                },
                              }}
                            >
                              {msg.response}
                            </ReactMarkdown>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 3. EXECUTIVE COMPOSER & QUICK-ACTION TOOL STRIP */}
          <div className="flex-shrink-0 p-3.5 sm:px-6 border-t border-white/[0.07] bg-[#080a10]">
            <div className="max-w-4xl mx-auto">
              {/* Quick Tool Preset Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-2.5 no-scrollbar">
                <span className="text-[9px] font-mono uppercase tracking-wider text-zinc-500 mr-1 flex-shrink-0">
                  QUICK TOOLS:
                </span>
                {EXECUTIVE_WORKFLOWS.map((wf) => (
                  <button
                    key={wf.id}
                    type="button"
                    onClick={() => setInput(wf.prompt)}
                    className="px-2.5 py-1 rounded-full bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.07] text-[10px] font-mono text-zinc-300 hover:text-white flex-shrink-0 transition-colors"
                  >
                    ◊ {wf.title}
                  </button>
                ))}
              </div>

              {/* Attachment Pills */}
              {attachments.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-2.5">
                  {attachments.map((file, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 px-3 py-1 rounded-lg bg-red-950/30 border border-red-500/30 text-xs text-red-100"
                    >
                      <FileText size={12} className="text-red-400" />
                      <span className="truncate max-w-[180px]">{file.name}</span>
                      <button
                        type="button"
                        onClick={() =>
                          setAttachments((prev) =>
                            prev.filter((_, i) => i !== idx)
                          )
                        }
                        className="text-zinc-400 hover:text-white"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Prompt Input Form */}
              <form
                onSubmit={(e) => handleSend(e)}
                className="flex items-center gap-2 bg-[#0d1018] border border-white/[0.11] focus-within:border-red-500/50 rounded-xl p-1.5 shadow-inner transition-colors"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  className="hidden"
                  onChange={handleFileChange}
                  accept="image/*,application/pdf,text/plain,.docx,.md,.csv,.json,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isTaskRunning}
                  className="p-2.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/[0.05] transition-colors flex-shrink-0"
                  title="Attach Contract or Evidence (.PDF, .DOCX, .MD, .TXT)"
                >
                  <Paperclip size={17} />
                </button>

                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  disabled={isTaskRunning}
                  placeholder={`Instruct ${orchestratorName} & the ${currentRoster.name} (or drop a .PDF / .DOCX to redline)...`}
                  className="flex-1 bg-transparent text-sm text-white placeholder-zinc-500 focus:outline-none px-2"
                />

                {isTaskRunning ? (
                  <button
                    type="button"
                    onClick={handleStop}
                    className="px-4 py-2 rounded-lg bg-red-600/20 hover:bg-red-600/35 border border-red-500/40 text-xs font-mono font-bold text-red-300 flex items-center gap-1.5"
                  >
                    <Square size={13} />
                    <span>STOP</span>
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={!input.trim() && attachments.length === 0}
                    className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 disabled:opacity-40 text-xs font-mono font-bold tracking-wider text-white flex items-center gap-1.5 transition-all shadow-[0_0_20px_rgba(220,38,38,0.3)]"
                  >
                    <span>DISPATCH</span>
                    <Send size={13} />
                  </button>
                )}
              </form>
            </div>
          </div>
        </section>
      </div>

      {/* ARTIFACT SPLIT-SCREEN MODAL */}
      {artifactModal.isOpen && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center backdrop-blur-md p-4">
          <div className="w-full max-w-5xl h-[88vh] rounded-2xl bg-[#090b10] border border-white/15 flex flex-col overflow-hidden shadow-2xl">
            <div className="px-5 py-3.5 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileText size={18} className="text-red-400" />
                <h3 className="text-sm font-bold text-white truncate">
                  {artifactModal.title}
                </h3>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-white/10 text-zinc-300">
                  {artifactModal.fileType}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {artifactModal.path && (
                  <a
                    href={
                      artifactModal.path.startsWith("http")
                        ? artifactModal.path
                        : `/api/artifacts/file?path=${encodeURIComponent(
                            artifactModal.path
                          )}`
                    }
                    download
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-lg bg-red-600/20 border border-red-500/40 text-xs text-red-200 flex items-center gap-1.5 no-underline"
                  >
                    <Download size={13} /> Download
                  </a>
                )}
                <button
                  type="button"
                  onClick={() =>
                    setArtifactModal((prev) => ({ ...prev, isOpen: false }))
                  }
                  className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-hidden flex">
              {artifactModal.fileType === "pdf" ? (
                <iframe
                  src={
                    artifactModal.path?.startsWith("http")
                      ? artifactModal.path
                      : `/api/artifacts/file?path=${encodeURIComponent(
                          artifactModal.path!
                        )}`
                  }
                  className="w-full h-full border-0"
                  title="PDF Deliverable Preview"
                />
              ) : (
                <div className="flex-1 overflow-y-auto p-6 font-mono text-xs text-zinc-300 whitespace-pre-wrap">
                  {artifactModal.content}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* RECENT MATTERS MODAL */}
      {showRecentModal && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center backdrop-blur-md p-4">
          <div className="w-full max-w-xl max-h-[75vh] rounded-2xl bg-[#090b10] border border-white/15 flex flex-col overflow-hidden shadow-2xl">
            <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FolderClock size={18} className="text-red-400" />
                <h3 className="text-base font-bold text-white">
                  Recent Legal Matters
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowRecentModal(false)}
                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-1.5 custom-scrollbar">
              {recentCases.length === 0 ? (
                <div className="text-center py-12 text-zinc-500 text-sm">
                  No recent matters recorded yet.
                </div>
              ) : (
                recentCases.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => {
                      loadConversation(c.id);
                      setShowRecentModal(false);
                    }}
                    className="w-full p-3.5 rounded-xl bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.06] flex items-center justify-between text-left transition-all"
                  >
                    <div className="min-w-0 pr-3">
                      <div className="text-sm font-semibold text-white truncate">
                        {c.title || "Untitled Legal Matter"}
                      </div>
                      <div className="text-[11px] text-zinc-500 mt-0.5">
                        {new Date(
                          c.updatedAt || c.updated_at
                        ).toLocaleDateString()}{" "}
                        • {c.message_count || 0} messages
                      </div>
                    </div>
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-red-500/15 text-red-300 border border-red-500/30">
                      Load →
                    </span>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* HUMAN INTERACTION (ask_human) MODAL */}
      {humanRequest && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center backdrop-blur-md p-4">
          <div className="w-full max-w-lg rounded-2xl bg-[#090b10] border border-red-500/40 p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-mono font-bold uppercase tracking-widest text-red-400">
                PARTNER SIGN-OFF REQUIRED • {humanRequest.agent}
              </span>
              <button
                type="button"
                onClick={() => setHumanRequest(null)}
                className="text-zinc-400 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>
            <p className="text-sm text-zinc-200 mb-4">{humanRequest.question}</p>
            {humanRequest.fields && (
              <form
                className="space-y-3"
                onSubmit={(e) => {
                  e.preventDefault();
                  const fd = new FormData(e.currentTarget);
                  const data: Record<string, any> = {};
                  humanRequest.fields?.forEach((f) => {
                    data[f.key] =
                      f.type === "checkbox"
                        ? fd.get(f.key) === "on"
                        : fd.get(f.key);
                  });
                  sendMessage({
                    text: `[Human Response to ${humanRequest.agent}]: ${JSON.stringify(
                      data
                    )}`,
                  });
                  setHumanRequest(null);
                }}
              >
                {humanRequest.fields.map((f) => (
                  <div key={f.key} className="flex flex-col gap-1">
                    <label className="text-xs text-zinc-400">{f.label}</label>
                    <input
                      name={f.key}
                      required={f.required}
                      className="px-3 py-2 rounded-lg bg-black/60 border border-white/15 text-sm text-white"
                    />
                  </div>
                ))}
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-lg bg-red-600 hover:bg-red-500 text-xs font-mono font-bold text-white uppercase tracking-wider mt-2"
                >
                  Confirm & Dispatch to Swarm
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

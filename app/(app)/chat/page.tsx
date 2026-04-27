"use client";
import { useState, useEffect, useRef } from "react";
import { useChat } from "@ai-sdk/react";
import ConstellationGraph from "../../components/ConstellationGraph";
import ResizablePanel from "../../components/ResizablePanel";
import ConversationHUD from "../../components/ConversationHUD";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm"; // Table support
import Mermaid from "../../components/Mermaid"; // Mermaid support
import CaseConfigPanel from "../../components/CaseConfigPanel";
import { useConversation, Message } from "@/app/contexts/ConversationContext";
import { FileText, ListChecks, BookOpen, FileOutput, File, ExternalLink, Download, X, PanelLeftOpen, PanelLeftClose } from "lucide-react";

interface ArtifactModalState {
  isOpen: boolean;
  path: string | null;
  title: string;
  content: string;
  fileType: 'markdown' | 'pdf' | 'latex' | 'image' | 'text';
  pdfPath: string | null; // For split view
  isLoading: boolean;
  error: string | null;
}

interface ReasoningEntry {
  timestamp: number;
  agent: string;
  action: string;
  message: string;
  formatted_time: string;
  artifact_type?: string;
  path?: string;
  title?: string;
  icon?: string;
  tool?: string; // Added for tool call tracking
  details?: any; // Rich details from backend
}

interface StatusUpdate {
  type: string;
  active_agents: string[];
  timestamp: number;
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

const getAgentColor = (agent: string) => {
  // Coordinator agents across all swarms get bold white
  const coordinators = ['Keyes', 'Holmes', 'Bennet', 'Polo', 'Earp', 'Selznick', 'House'];
  if (coordinators.includes(agent)) return 'text-white font-bold';

  // Specialist agents by swarm
  const agentColors: { [key: string]: string } = {
    // System
    'System': 'text-gray-500',
    // Corporate
    'Bannister': 'text-gray-300', 'OHara': 'text-gray-300', 'Neff': 'text-gray-400',
    'Gittes': 'text-gray-400', 'Spade': 'text-gray-400', 'Marlowe': 'text-gray-400',
    'Archer': 'text-zinc-500', 'Cairo': 'text-zinc-500', 'Gutman': 'text-zinc-400',
    'Vance': 'text-zinc-400', 'Queen': 'text-zinc-500', 'Hammer': 'text-zinc-500',
    // Criminal
    'Poirot': 'text-gray-300', 'Marple': 'text-gray-300', 'Columbo': 'text-gray-400',
    'Perry': 'text-gray-400', 'McCoy': 'text-gray-400', 'Wolfe': 'text-zinc-400',
    'Morse': 'text-zinc-500', 'Chan': 'text-zinc-400', 'Dupin': 'text-zinc-400',
    'Brown': 'text-zinc-500',
    // Family
    'Eyre': 'text-gray-300', 'Earnshaw': 'text-gray-300', 'Dashwood': 'text-gray-400',
    'March': 'text-gray-400', 'Rochester': 'text-gray-400', 'Woodhouse': 'text-zinc-400',
    'Darcy': 'text-zinc-500', 'Knightley': 'text-zinc-400', 'Ferrars': 'text-zinc-400',
    'Brandon': 'text-zinc-500', 'Tilney': 'text-zinc-500',
    // Immigration
    'Magellan': 'text-gray-300', 'Columbus': 'text-gray-300', 'Darwin': 'text-gray-400',
    'Earhart': 'text-gray-400', 'Shackleton': 'text-gray-400', 'Cook': 'text-zinc-400',
    'Vespucci': 'text-zinc-500', 'Drake': 'text-zinc-400', 'Livingstone': 'text-zinc-400',
    'Hudson': 'text-zinc-500', 'Lewis': 'text-zinc-500',
    // Real Estate
    'Hickok': 'text-gray-300', 'Oakley': 'text-gray-300', 'Cody': 'text-gray-400',
    'Cassidy': 'text-gray-400', 'Holliday': 'text-gray-400', 'Masterson': 'text-zinc-400',
    'Garrett': 'text-zinc-500', 'Horn': 'text-zinc-400', 'Starr': 'text-zinc-400',
    'James': 'text-zinc-500', 'Younger': 'text-zinc-500',
    // IP & Entertainment
    'Goldwyn': 'text-gray-300', 'Mayer': 'text-gray-300', 'Zanuck': 'text-gray-400',
    'Warner': 'text-gray-400', 'Thalberg': 'text-gray-400', 'Cohn': 'text-zinc-400',
    'Laemmle': 'text-zinc-500', 'Zukor': 'text-zinc-400', 'Fox': 'text-zinc-400',
    'Disney': 'text-zinc-500', 'Universal': 'text-zinc-500',
    // Personal Injury
    'Grey': 'text-gray-300', 'Welby': 'text-gray-300', 'Quincy': 'text-gray-400',
    'Trapper': 'text-gray-400', 'Kildare': 'text-gray-400', 'Pierce': 'text-zinc-400',
    'Carter': 'text-zinc-500', 'Ross': 'text-zinc-400', 'Shepherd': 'text-zinc-400',
    'Kovac': 'text-zinc-500', 'Greene': 'text-zinc-500',
    // Utility agents
    'CodeExpert': 'text-gray-400', 'WebResearcher': 'text-gray-400',
    'FileAnalyst': 'text-gray-400', 'ToolSpecialist': 'text-gray-400',
    'VisualAnalyst': 'text-gray-400',
  };
  return agentColors[agent] || 'text-gray-400';
};

// Hex color for chat avatars and borders — unique per agent
const getAgentHexColor = (agent: string): string => {
  const coordinators = ['Keyes', 'Holmes', 'Bennet', 'Polo', 'Earp', 'Selznick', 'House'];
  if (coordinators.includes(agent)) return '#cc0000'; // Vigil Red for coordinators
  if (agent === 'System') return '#6b7280'; // Gray
  // Deterministic hue from name hash
  let hash = 0;
  for (let i = 0; i < agent.length; i++) hash = agent.charCodeAt(i) + ((hash << 5) - hash);
  const hue = ((hash % 360) + 360) % 360;
  return `hsl(${hue}, 70%, 65%)`;
};

// Get agent initials (first 2 letters uppercase)
const getAgentInitials = (agent: string): string => {
  return agent.substring(0, 2).toUpperCase();
};

const getActionIcon = (action: string) => {
  const icons: { [key: string]: string } = {
    'task_started': '▸',
    'thinking': '◌',
    'responding': '◉',
    'collaborating': '◈',
    'completed': '◆',
    'task_completed': '◇',
    'error': '⬡',
    'handoff': '⬢',
    'tool_call': '◊',
    'working': '◉',
    'message': '◈',
  };
  return icons[action] || '•';
};

interface SwarmThinkProps {
  logs: ReasoningEntry[];
  isActive: boolean;
}

function SwarmThink({ logs, isActive }: SwarmThinkProps) {
  const [isOpen, setIsOpen] = useState(isActive);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll when active and open
  useEffect(() => {
    if (isActive && isOpen && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs, isActive, isOpen]);

  // Auto-expand if active
  useEffect(() => {
    if (isActive) setIsOpen(true);
  }, [isActive]);

  return (
    <div className="mb-6 animate-slide-up">
      {/* Header/Toggle */}
      <div className="mb-2 flex items-center gap-2 cursor-pointer select-none group" onClick={() => setIsOpen(!isOpen)}>
        <div className={`p-1 rounded glass-panel border border-red-700/30 group-hover:border-red-600/60 transition-colors ${isActive ? 'animate-pulse' : ''}`}>
          <span className="text-red-500 text-xs">
            {isOpen ? '▼' : '▶'}
          </span>
        </div>
        <span className="microtext font-bold text-red-500 tracking-wider font-vox">SWARM REASONING ENGINE</span>
        {isActive && <span className="text-xs text-gray-500 animate-pulse">• Processing...</span>}
        <span className="text-xs text-gray-600 ml-auto">{logs?.length || 0} OPS</span>
      </div>

      {/* Content */}
      {isOpen && (
        <div className="glass-panel bg-black/40 border-red-700/20 p-4 rounded max-h-96 overflow-y-auto font-mono text-xs custom-scrollbar" ref={scrollRef}>
          {!logs || logs.length === 0 ? (
            <div className="text-gray-500 italic p-2 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-600/50 animate-ping"></span>
              Initializing swarm protocols...
            </div>
          ) : (
            <div className="space-y-3">
              {logs.map((log, i) => {
                const isMessage = log.action === 'message' || log.action === 'agent_message' || log.action === 'human_interaction';
                const isTool = log.action === 'tool_call' || log.action === 'tool_use';

                return (
                  <div key={i} className={`flex gap-3 ${isMessage ? 'pl-2' : ''}`}>
                    <div className="flex flex-col items-end w-24 flex-shrink-0">
                      <span className={`font-bold truncate ${getAgentColor(log.agent)}`}>{log.agent.toUpperCase()}</span>
                      <span className="text-gray-700 text-[9px]">{new Date(log.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                    </div>

                    <div className={`flex-1 break-words min-w-0 ${isMessage ? 'bg-white/5 p-2 rounded-r-lg rounded-bl-lg border border-white/10' : ''}`}>
                      {!isMessage && <span className="mr-2 text-red-600/70 opacity-70 inline-block w-4">{getActionIcon(log.action)}</span>}

                      {isMessage ? (
                        <div className="text-gray-200 italic">
                          {log.message ? `"${log.message}"` : <span className="opacity-50 not-italic">Processing...</span>}
                        </div>
                      ) : (
                        <span className="text-gray-400">{log.message}</span>
                      )}

                      {/* Reasoning/Thinking content */}
                      {log.details?.content && (log.action === 'thinking' || log.action === 'agent_thinking') && (
                        <div className="mt-1.5 text-[11px] text-gray-300 leading-relaxed whitespace-pre-wrap bg-red-950/10 p-2 rounded border border-red-700/10 max-h-48 overflow-y-auto custom-scrollbar">
                          {log.details.content}
                        </div>
                      )}

                      {log.details && Object.keys(log.details).length > 0 && (log.action === 'tool_call' || log.action === 'tool_use') && (
                        <div className="mt-1 text-[10px] text-gray-500 font-mono break-all bg-black/20 p-1 rounded border border-white/5">
                          {JSON.stringify(log.details.arguments || log.details).slice(0, 200) + (JSON.stringify(log.details.arguments || log.details).length > 200 ? '...' : '')}
                        </div>
                      )}

                      {log.tool && !log.details?.tool_name && (
                        <div className="mt-1">
                          <span className="px-1.5 py-0.5 rounded bg-red-900/20 text-red-400 text-[10px] border border-red-700/30 font-semibold tracking-wide">
                            TOOL: {log.tool}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

interface WelcomeScreenProps {
  onStartNew: () => void;
  onOpenRecent: () => void;
  onLoadCase: (id: string) => void;
  recentCases: any[];
}

function WelcomeScreen({ onStartNew, onOpenRecent, onLoadCase, recentCases }: WelcomeScreenProps) {
  return (
    <div className="h-full flex flex-col items-center justify-center text-center p-8 animate-fade-in">
      <div className="w-28 h-28 mb-8 flex items-center justify-center drop-shadow-[0_0_40px_rgba(204,0,0,0.3)]">
        <img src="/Vigil.png" alt="Vigil Shield" className="w-full h-full object-contain" />
      </div>

      <h1 className="text-4xl font-bold text-white mb-2 tracking-tight font-vox">BASALT VIGIL</h1>
      <p className="text-gray-400 mb-12 max-w-md text-lg">Advanced Legal Swarm Intelligence System</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl w-full">
        <button
          onClick={onStartNew}
          className="group relative overflow-hidden p-8 rounded-xl glass-panel border border-white/10 hover:border-red-700/60 transition-all hover:bg-red-950/10 text-left"
        >
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <FileText size={64} />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2 flex items-center gap-2">
            Start New Case
            <span className="opacity-0 group-hover:opacity-100 transition-opacity text-red-500">→</span>
          </h3>
          <p className="text-sm text-gray-400">Initialize a new legal matter with a dedicated agent swarm.</p>
        </button>

        <button
          onClick={onOpenRecent}
          className="group relative overflow-hidden p-8 rounded-xl glass-panel border border-white/10 hover:border-red-700/60 transition-all hover:bg-red-950/10 text-left"
        >
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <BookOpen size={64} />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2 flex items-center gap-2">
            Open Recent Case
            <span className="opacity-0 group-hover:opacity-100 transition-opacity text-red-500">→</span>
          </h3>
          <p className="text-sm text-gray-400">Continue working on an existing matter or review past analysis.</p>
        </button>
      </div>

      {recentCases.length > 0 && (
        <div className="mt-12 w-full max-w-lg">
          <h4 className="text-xs uppercase tracking-wider text-gray-500 mb-4 text-left font-semibold">Recently Active</h4>
          <div className="space-y-2">
            {recentCases.slice(0, 3).map((c, i) => (
              <div
                key={i}
                onClick={() => onLoadCase(c.id)}
                className="flex items-center justify-between p-3 rounded glass-panel hover:bg-white/5 transition-colors cursor-pointer border border-transparent hover:border-white/10"
              >
                <div className="flex flex-col items-start">
                  <span className="text-sm text-gray-300 font-medium">{c.title || 'Untitled Case'}</span>
                  <span className="text-xs text-gray-500">{new Date(c.updatedAt || c.updated_at).toLocaleDateString()}</span>
                </div>
                <span className="text-xs bg-white/5 px-2 py-1 rounded text-gray-400">{c.status}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function RecentCasesModal({ isOpen, onClose, onLoadCase }: { isOpen: boolean, onClose: () => void, onLoadCase: (id: string) => void }) {
  const [cases, setCases] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      fetch('/api/conversations/_/recent?limit=50')
        .then(res => res.json())
        .then(data => {
          setCases(data.conversations || []);
          setLoading(false);
        })
        .catch(err => {
          console.error("Failed to load cases", err);
          setLoading(false);
        });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 bg-black/80 z-50 flex items-center justify-center backdrop-blur-sm animate-fade-in">
      <div className="glass-panel w-full max-w-2xl max-h-[80vh] flex flex-col rounded-xl border border-white/20 shadow-2xl">
        <div className="p-6 border-b border-white/10 flex justify-between items-center">
          <h2 className="text-xl font-bold text-white">Recent Cases</h2>
          <button onClick={onClose} className="glass-button p-2 hover:bg-white/10 rounded-full">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          {loading ? (
            <div className="flex items-center justify-center h-40">
              <span className="text-gray-400 animate-pulse">Loading cases...</span>
            </div>
          ) : cases.length === 0 ? (
            <div className="text-center py-12 text-gray-500">No recent cases found.</div>
          ) : (
            <div className="space-y-1">
              {cases.map(c => (
                <div
                  key={c.id}
                  onClick={() => onLoadCase(c.id)}
                  className="p-4 hover:bg-white/5 rounded-lg cursor-pointer group transition-all border border-transparent hover:border-white/10 flex items-center gap-4"
                >
                  <div className="w-10 h-10 rounded-full bg-red-950/20 flex items-center justify-center text-red-500 border border-red-700/20 group-hover:border-red-600/50">
                    <FileText size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-medium truncate group-hover:text-red-400 transition-colors">{c.title || 'Untitled Case'}</h3>
                    <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                      <span>{new Date(c.updatedAt || c.updated_at).toLocaleDateString()} {new Date(c.updatedAt || c.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      <span>•</span>
                      <span>{c.message_count} messages</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`text-xs px-2 py-1 rounded uppercase tracking-wide font-semibold ${c.status === 'completed' ? 'bg-green-500/10 text-green-400' :
                      c.status === 'active' ? 'bg-red-900/10 text-red-400' : 'bg-gray-800 text-gray-400'
                      }`}>
                      {c.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const { conversationId, messages: contextMessages, loadConversation, createNewConversation } = useConversation();
  const [feedOpen, setFeedOpen] = useState(true);
  const [activeAgents, setActiveAgents] = useState<string[]>([]);
    const [isPaused, setIsPaused] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<string>("disconnected");
  const [showLeftPanel, setShowLeftPanel] = useState(false);

  // New States for Welcome Screen
  const [showRecentModal, setShowRecentModal] = useState(false);
  const [recentCasesSummary, setRecentCasesSummary] = useState<any[]>([]);

  const [humanRequest, setHumanRequest] = useState<HumanInteractionRequest | null>(null);
  const [showStillThere, setShowStillThere] = useState(false);
  const [stillThereData, setStillThereData] = useState<HumanInteractionRequest | null>(null);
  const [swarms, setSwarms] = useState<SwarmInfo[]>([]);
  const [selectedSwarm, setSelectedSwarm] = useState<string>("corporate");
  const [jurisdiction, setJurisdiction] = useState<string>("");
  const [matterType, setMatterType] = useState<string>("");
  const [artifactModal, setArtifactModal] = useState<ArtifactModalState>({
    isOpen: false,
    path: null,
    title: '',
    content: '',
    fileType: 'text',
    pdfPath: null,
    isLoading: false,
    error: null
  });

  const [localMessages, setLocalMessages] = useState<any[]>([]);
  const [extraReasoningLogs, setExtraReasoningLogs] = useState<any[]>([]);
  const [input, setInput] = useState<string>('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const handleInputChange = (e: any) => setInput(e.target?.value || '');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      const isNewChat = aiMessages.length === 0 && localMessages.length === 0;
      
      if (isNewChat && !input.trim()) {
        handleSend(null, files);
      } else {
        setAttachments(prev => [...prev, ...files]);
      }
    }
    e.target.value = ''; // Reset input
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const { messages: aiMessages, setMessages: setAiMessages, sendMessage, stop: handleStop, status } = useChat({
    id: conversationId || undefined,
    body: {
      swarm_id: selectedSwarm,
      context: { jurisdiction, matter_type: matterType },
      conversation_id: conversationId
    }
  } as any);

  // Sync loaded history into UI state
  useEffect(() => {
    if (contextMessages.length > 0) {
      setLocalMessages(contextMessages);
      
      // Seed the Vercel AI SDK with the historical context so the agent retains memory.
      // We prefix IDs with 'history-' so we can filter them out from the UI rendering
      // to prevent duplicating the rich metadata messages already present in localMessages.
      const initialAi = contextMessages.flatMap(m => {
        const msgs = [];
        if (m.user) msgs.push({ id: `history-${m.id}-user`, role: 'user', content: m.user });
        if (m.response) msgs.push({ id: `history-${m.id}-response`, role: 'assistant', content: m.response });
        return msgs;
      });
      setAiMessages(initialAi as any);
      
      setExtraReasoningLogs([]);
    } else if (conversationId) {
      // Just a clear triggered
      setLocalMessages([]);
      setAiMessages([]);
      setExtraReasoningLogs([]);
    }
  }, [conversationId, contextMessages, setAiMessages]);

  const isTaskRunning = status === 'streaming' || status === 'submitted';

  const orchestrators: Record<string, string> = {
    corporate: 'Keyes',
    criminal: 'Holmes',
    family: 'Bennet',
    immigration: 'Polo',
    ip_entertainment: 'Selznick',
    personal_injury: 'House',
    real_estate: 'Earp',
  };
  const orchestratorName = selectedSwarm ? (orchestrators[selectedSwarm] || 'Keyes') : 'Keyes';

  const reasoningFeed = aiMessages.flatMap(m => 
    (m.parts?.filter((p: any) => p.type?.startsWith('tool-')) || []).map((p: any) => {
      const toolName = p.type.replace('tool-', '');
      const args = p.input || p.args || {};
      let message = `Executing ${toolName}...`;
      if (toolName === 'handoff_to_agent' && args.agent_name) {
        message = `Routing execution to ${args.agent_name.toUpperCase()} for specialist review. Task: ${args.next_task || 'Evaluate case document'}`;
      }
      return {
        timestamp: Date.now(),
        agent: orchestratorName,
        action: 'tool_call',
        message,
        tool: toolName,
        details: args
      };
    })
  );

  const fullReasoningFeed = [...reasoningFeed, ...extraReasoningLogs].sort((a, b) => a.timestamp - b.timestamp);

  // Bridge AI SDK streaming events → constellation + reasoning UI
  const prevAiMsgCountRef = useRef(0);
  const prevStatusRef = useRef(status);
  
  useEffect(() => {
    // When streaming starts, emit agent thinking event + create SwarmThink entry
    if (status === 'streaming' && prevStatusRef.current !== 'streaming') {
      setActiveAgents([orchestratorName]);
      
      // Emit constellation event — agent is thinking
      window.dispatchEvent(new CustomEvent('basalt-agent-state-change', {
        detail: { agent: orchestratorName, action: 'thinking', message: 'Processing request...' }
      }));
      window.dispatchEvent(new CustomEvent('basalt-agents-update', {
        detail: { activeAgents: [orchestratorName] }
      }));
      
      // Create SwarmThink message for reasoning panel
      setLocalMessages(prev => {
        // Prevent duplicate consecutive SwarmThink messages
        if (prev.length > 0 && prev[prev.length - 1].is_swarm_think) {
          return prev;
        }
        const thinkMsg = {
          id: `swarm-think-${Date.now()}`,
          user: "", response: "",
          timestamp: new Date().toISOString(),
          is_swarm_think: true,
          reasoning_logs: [{
            timestamp: Date.now(),
            agent: orchestratorName,
            action: 'thinking',
            message: `${orchestratorName} is analyzing your request...`
          }]
        };
        return [...prev, thinkMsg];
      });
    }

    // When streaming completes
    if (status === 'ready' && prevStatusRef.current === 'streaming') {
      setActiveAgents([]);
      window.dispatchEvent(new CustomEvent('basalt-agent-state-change', {
        detail: { agent: orchestratorName, action: 'completed', message: 'Response complete.' }
      }));
      window.dispatchEvent(new CustomEvent('basalt-agents-update', {
        detail: { activeAgents: [] }
      }));
    }

    prevStatusRef.current = status;
  }, [status, orchestratorName]);

  // Watch for tool calls in AI messages and bridge to UI
  const processedToolKeysRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    const lastMsg = aiMessages[aiMessages.length - 1];
    if (!lastMsg || lastMsg.role !== 'assistant') return;

    const allParts = lastMsg.parts || [];

    // AI SDK v5: tool parts have type "tool-{toolName}" (e.g. "tool-ask_human")
    // States: input-streaming → input-available → output-available
    const toolParts = allParts.filter((p: any) => p.type?.startsWith('tool-'));

    toolParts.forEach((part: any, idx: number) => {
      // Deduplicate: only process each part+state combo once
      const partKey = `${lastMsg.id}-${part.type}-${idx}-${part.state}`;
      if (processedToolKeysRef.current.has(partKey)) return;
      processedToolKeysRef.current.add(partKey);

      // Extract tool name from type: "tool-ask_human" → "ask_human"
      const toolName = part.type.replace('tool-', '');
      const args = part.input || part.args || {};
      
      // Emit constellation event for tool calls with tool-specific actions
      const constellationAction = toolName === 'ask_human' ? 'collaborating' 
        : toolName.includes('search') ? 'thinking'
        : toolName.includes('document') || toolName.includes('compile') ? 'processing_document'
        : 'tool_call';
      window.dispatchEvent(new CustomEvent('basalt-agent-state-change', {
        detail: { agent: orchestratorName, action: constellationAction, message: `Calling ${toolName}`, tool: toolName }
      }));

      // If it's a handoff, explicitly light up the target agent in the constellation!
      if (toolName === 'handoff_to_agent' && args.agent_name) {
        setActiveAgents(prev => Array.from(new Set([...prev, orchestratorName, args.agent_name])));
        window.dispatchEvent(new CustomEvent('basalt-agents-update', {
          detail: { activeAgents: [orchestratorName, args.agent_name] }
        }));
        window.dispatchEvent(new CustomEvent('basalt-agent-state-change', {
          detail: { agent: args.agent_name, action: 'thinking', message: `Analyzing task from ${orchestratorName}...` }
        }));
      }

      // Update SwarmThink with tool call info (only on first detection of this tool)
      if (part.state === 'input-available' || part.state === 'output-available') {
        setLocalMessages(prev => {
          const newMsgs = [...prev];
          for (let i = newMsgs.length - 1; i >= 0; i--) {
            if (newMsgs[i].is_swarm_think) {
              const think = { ...newMsgs[i] };
              think.reasoning_logs = [...(think.reasoning_logs || []), {
                timestamp: Date.now(),
                agent: orchestratorName,
                action: 'tool_call',
                message: `Executing tool: ${toolName}`,
                tool: toolName
              }];
              newMsgs[i] = think;
              break;
            }
          }
          return newMsgs;
        });
      }

      // Detect ask_human → show form
      if (toolName === 'ask_human') {
        console.log('[Bridge] ask_human tool detected. state:', part.state);
        console.log('[Bridge] part keys:', Object.keys(part));
        console.log('[Bridge] part dump:', JSON.stringify(part, null, 2));
      }

      if (toolName === 'ask_human' && (part.state === 'input-available' || part.state === 'output-available')) {
        const data = part.args || part.input || part.toolInput || part.parameters || part;
        const question = data?.question || data?.parameters?.question;
        const fields = data?.fields || data?.parameters?.fields;
        if (question && fields) {
          setHumanRequest({
            agent: orchestratorName,
            question,
            fields,
            request_id: part.toolCallId || part.id || `ask-human-${Date.now()}`
          });
        }
      }
    });
  }, [aiMessages, orchestratorName]);

  const getMessageText = (m: any) => {
    if (typeof m.content === 'string') return m.content;
    if (m.parts) {
      // Only get final response text — exclude reasoning/thinking parts
      return m.parts
        .filter((p: any) => p.type === 'text' && !p.type?.includes('reasoning'))
        .map((p: any) => p.text)
        .join('\n\n');
    }
    return '';
  };

  const getThinkingText = (m: any) => {
    if (!m.parts) return '';
    // AI SDK stores reasoning as parts with type 'reasoning' or 'thinking'
    const reasoningParts = m.parts.filter((p: any) => p.type === 'reasoning' || p.type === 'thinking');
    if (reasoningParts.length > 0) {
      return reasoningParts.map((p: any) => p.text || p.reasoning || '').join('\n');
    }
    // Fallback: check if text starts with "Thinking:" pattern and split it
    const textParts = m.parts.filter((p: any) => p.type === 'text');
    if (textParts.length === 1) {
      const text = textParts[0].text || '';
      const thinkMatch = text.match(/^Thinking:\s*(.*?)(?:\n\n|(?=\n[A-Z]))/s);
      if (thinkMatch) {
        return thinkMatch[1].trim();
      }
    }
    return '';
  };

  const getResponseWithoutThinking = (m: any) => {
    if (typeof m.content === 'string') {
      // Strip "Thinking: ..." prefix if present
      return m.content.replace(/^Thinking:\s*.*?(?:\n\n)/s, '').trim();
    }
    if (m.parts) {
      const reasoningParts = m.parts.filter((p: any) => p.type === 'reasoning' || p.type === 'thinking');
      if (reasoningParts.length > 0) {
        // Has explicit reasoning parts — only return text parts
        return m.parts
          .filter((p: any) => p.type === 'text')
          .map((p: any) => p.text)
          .join('\n\n');
      }
      // Fallback: strip "Thinking:" prefix from text parts
      const allText = m.parts
        .filter((p: any) => p.type === 'text')
        .map((p: any) => p.text)
        .join('\n\n');
      return allText.replace(/^Thinking:\s*.*?(?:\n\n)/s, '').trim();
    }
    return '';
  };

  // Map active AI SDK messages to our custom UI format (filtering out the seeded history)
  const mappedAiMessages: any[] = aiMessages
    .filter(m => !m.id.startsWith('history-'))
    .filter(m => {
      // Filter out empty assistant messages (tool-only steps with no text)
      if (m.role === 'assistant') {
        const text = getResponseWithoutThinking(m);
        if (!text || !text.trim()) return false;
      }
      // Filter out user messages that only contain the injected document text
      if (m.role === 'user') {
        const stripped = getMessageText(m).split('\n\n[The following documents were uploaded')[0].trim();
        if (!stripped) return false;
      }
      return true;
    })
    .map(m => ({
      id: m.id,
      user: m.role === 'user' ? getMessageText(m).split('\n\n[The following documents were uploaded')[0].trim() : "",
      response: m.role !== 'user' ? getResponseWithoutThinking(m) : "",
      timestamp: new Date().toISOString(),
      agent_name: m.role === 'assistant' ? orchestratorName : undefined,
      is_thinking: false,
      thinking_text: m.role === 'assistant' ? getThinkingText(m) : "",
      // Include tool activity indicators for the reasoning feed
      has_tool_activity: (m.parts || []).some((p: any) => p.type?.startsWith('tool-')),
      ...((m as any).metadata || {})
    }));

  const messages = [...mappedAiMessages, ...localMessages].sort((a, b) => 
    new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  const handleHumanResponse = (requestId: string, response: string) => {
    if (humanRequest) {
      sendMessage({ text: `[Human Response to ${humanRequest.agent}]: ${response}` });
      setHumanRequest(null);
    }
  };

  const openArtifact = async (path: string, title: string) => {
    const ext = path.split('.').pop()?.toLowerCase();
    let fileType: ArtifactModalState['fileType'] = 'text';
    let pdfPath = null;

    if (ext === 'md') fileType = 'markdown';
    else if (ext === 'pdf') fileType = 'pdf';
    else if (ext === 'tex') {
      fileType = 'latex';
      // Assume PDF is in same location with .pdf extension
      pdfPath = path.replace(/\.tex$/i, '.pdf');
    }
    else if (['png', 'jpg', 'jpeg', 'gif'].includes(ext || '')) fileType = 'image';

    setArtifactModal({
      isOpen: true,
      path,
      title,
      content: '',
      fileType,
      pdfPath,
      isLoading: true,
      error: null
    });

    if (fileType === 'pdf' || fileType === 'image') {
      // Binary files don't need text content loading
      setArtifactModal(prev => ({ ...prev, isLoading: false }));
      return;
    }

    try {
      const res = await fetch(`/api/artifacts/content?path=${encodeURIComponent(path)}`);
      if (res.ok) {
        const data = await res.json();
        setArtifactModal(prev => ({ ...prev, content: data.content, isLoading: false }));
      } else {
        setArtifactModal(prev => ({ ...prev, error: 'Failed to load artifact content', isLoading: false }));
      }
    } catch (error) {
      setArtifactModal(prev => ({ ...prev, error: 'Failed to load artifact content', isLoading: false }));
    }
  };

  const eventSourceRef = useRef<EventSource | null>(null);
  const reasoningRef = useRef<HTMLDivElement>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);

  // Initialize conversation if needed

  useEffect(() => {
    if (!conversationId) {
      createNewConversation();
    }
  }, [conversationId, createNewConversation]);

  // Fetch recent cases for welcome screen
  useEffect(() => {
    fetch('/api/conversations/_/recent?limit=3')
      .then(res => res.json())
      .then(data => setRecentCasesSummary(data.conversations || []))
      .catch(console.error);
  }, []);



  // Fetch available swarms on mount
  useEffect(() => {
    const fetchSwarms = async () => {
      try {
        const res = await fetch('/api/swarms');
        if (res.ok) {
          const data = await res.json();
          setSwarms(data.swarms || []);
          if (data.default_swarm) {
            setSelectedSwarm(data.default_swarm);
          }
        }
      } catch (error) {
        console.error('Failed to fetch swarms:', error);
      }
    };
    fetchSwarms();
  }, []);

  // Function to connect to EventSource with reconnection logic
  const connectEventSource = () => {
    // Clean up existing connection
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }

    console.log('Setting up EventSource connection...');
    setConnectionStatus("connecting");

    const eventSource = new EventSource('/api/activity-stream');
    eventSourceRef.current = eventSource;

    let isConnected = false;
    let lastHeartbeat = Date.now();

    // Monitor heartbeats
    const heartbeatInterval = setInterval(() => {
      const timeSinceLastHeartbeat = Date.now() - lastHeartbeat;
      if (timeSinceLastHeartbeat > 30000) { // 30 seconds without heartbeat
        console.log('No heartbeat received for 30 seconds, reconnecting...');
        clearInterval(heartbeatInterval);
        eventSource.close();
        handleReconnect();
      }
    }, 5000);

    eventSource.onopen = (event) => {
      console.log('EventSource connection opened:', event);
      setConnectionStatus("connected");
      reconnectAttemptsRef.current = 0; // Reset reconnect attempts on successful connection
      isConnected = true;
      lastHeartbeat = Date.now();
    };

    eventSource.onmessage = (event) => {
      try {
        // console.log('EventSource message received:', event.data);
        const data = JSON.parse(event.data);

        // Update heartbeat timestamp
        if (data.type === 'heartbeat') {
          lastHeartbeat = Date.now();
          // console.log('Heartbeat received');
        }

        // If we receive a message, we're connected
        if (!isConnected) {
          setConnectionStatus("connected");
          isConnected = true;
        }

        // Handle different message types
        if (data.type === 'connected') {
          console.log('Activity stream connected:', data.message);
          setConnectionStatus("connected");
        } else if (data.type === 'error') {
          console.error('Activity stream error:', data.message);
        } else if (data.type === 'status') {
          // Update active agents status
          const newActive = data.active_agents || [];
          setActiveAgents(newActive);

          // Update constellation
          const customEvent = new CustomEvent('basalt-agents-update', {
            detail: { activeAgents: newActive }
          });
          window.dispatchEvent(customEvent);
        } else if (data.agent || data.agent_name) {
          // This is an agent activity
          // Normalize agent name
          data.agent = data.agent || data.agent_name;

          console.log('Agent activity:', data);

          if (data.action === 'human_interaction_request') {
            setHumanRequest(data.details);
            // Also store for still-there re-display
            setStillThereData(data.details);
            setShowStillThere(false);
            // Log to feed as well so user knows what's happening
            setExtraReasoningLogs(prev => [...prev, {
              ...data,
              message: `Waiting for human input: ${data.details.question}`
            }]);

            // Update SwarmThink message for Human Input
            setLocalMessages(prev => {
              const newMessages = [...prev];
              let thinkMsgIndex = -1;
              for (let i = newMessages.length - 1; i >= 0; i--) {
                if (newMessages[i].is_swarm_think) {
                  thinkMsgIndex = i;
                  break;
                }
              }
              if (thinkMsgIndex !== -1) {
                const thinkMsg = { ...newMessages[thinkMsgIndex] };
                const customLog = {
                  ...data,
                  message: `Waiting for human input: ${data.details.question}`,
                  action: 'human_interaction'
                };
                thinkMsg.reasoning_logs = [...(thinkMsg.reasoning_logs || []), customLog];
                newMessages[thinkMsgIndex] = thinkMsg;
              }
              return newMessages;
            });
            return;
          }

          // "Still there?" nudge — backend initial timeout elapsed, show a modal
          if (data.action === 'still_there_check') {
            // Only show if the form isn't already visible
            if (!humanRequest) {
              setShowStillThere(true);
              // Update stored data with latest from backend (may have re-parsed fields)
              if (data.details) {
                setStillThereData(data.details);
              }
            }
            return;
          }

          // Update agent activities
          setExtraReasoningLogs(prev => [...prev, data]);

          // Update SwarmThink message in chat
          setLocalMessages(prev => {
            const newMessages = [...prev];
            // Find the last swarm think message
            let thinkMsgIndex = -1;
            for (let i = newMessages.length - 1; i >= 0; i--) {
              if (newMessages[i].is_swarm_think) {
                thinkMsgIndex = i;
                break;
              }
            }

            if (thinkMsgIndex !== -1) {
              const thinkMsg = { ...newMessages[thinkMsgIndex] };
              thinkMsg.reasoning_logs = [...(thinkMsg.reasoning_logs || []), data];
              newMessages[thinkMsgIndex] = thinkMsg;
            }
            return newMessages;
          });

          // Emit custom event for constellation graph
          const stateChangeEvent = new CustomEvent('basalt-agent-state-change', {
            detail: {
              agent: data.agent,
              action: data.action,
              message: data.message,
              tool: data.tool,
              target: data.details?.target || data.target
            }
          });
          window.dispatchEvent(stateChangeEvent);

          // If this is an artifact creation, also add it to the main chat messages so it's visible
          if (data.action === 'artifact_created') {
            // Use path as part of the ID to deduplicate
            const artifactId = `artifact-${data.path || Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

            setLocalMessages(prev => {
              // Check if we already have this artifact (by path) to prevent duplicates
              const existingArtifact = prev.find(m => m.action === 'artifact_created' && m.path === data.path);
              if (existingArtifact) {
                return prev; // Don't add duplicate
              }

              const artifactMsg: Message = {
                id: artifactId,
                user: "", // Empty user indicates system/agent message
                response: "", // Empty response, card will render based on action
                timestamp: new Date().toISOString(),
                agents_involved: [data.agent],
                action: 'artifact_created',
                artifact_type: data.artifact_type,
                title: data.title,
                path: data.path,
                icon: data.icon
              };
              return [...prev, artifactMsg];
            });
          }

          // Update active agents based on activity
          setActiveAgents(prev => {
            const newActive = new Set(prev);
            if (data.action === 'thinking' || data.action === 'responding' || data.action === 'working' || data.action === 'tool_call') {
              newActive.add(data.agent);
            } else if (data.action === 'completed') {
              newActive.delete(data.agent);
            }

            const newActiveArray = Array.from(newActive);

            const customEvent = new CustomEvent('basalt-agents-update', {
              detail: { activeAgents: newActiveArray }
            });
            window.dispatchEvent(customEvent);

            return newActiveArray;
          });

          // Auto-scroll reasoning feed
          setTimeout(() => {
            if (reasoningRef.current) {
              reasoningRef.current.scrollTop = reasoningRef.current.scrollHeight;
            }
          }, 100);
        }
      } catch (error) {
        console.error('Failed to parse event data:', error, 'Raw data:', event.data);
      }
    };

    eventSource.onerror = (error) => {
      console.error('EventSource error:', error);
      console.log('ReadyState:', eventSource.readyState);
      clearInterval(heartbeatInterval);

      // Only reconnect if we were previously connected
      if (eventSource.readyState === EventSource.CLOSED) {
        setConnectionStatus("reconnecting");
        isConnected = false;
        handleReconnect();
      }
    };

    // Clean up on unmount
    return () => {
      clearInterval(heartbeatInterval);
      eventSource.close();
    };
  };

  // Handle reconnection with exponential backoff
  const handleReconnect = () => {
    // Clear any existing reconnect timeout
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }

    // Calculate backoff delay: 1s, 2s, 4s, 8s, 16s, max 30s
    const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 30000);
    reconnectAttemptsRef.current++;

    console.log(`Reconnecting in ${delay}ms (attempt ${reconnectAttemptsRef.current})`);

    reconnectTimeoutRef.current = setTimeout(() => {
      connectEventSource();
    }, delay);
  };

  // Set up EventSource for real-time agent activity
  useEffect(() => {
    const cleanup = connectEventSource();

    return () => {
      console.log('Closing EventSource connection');
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      setConnectionStatus("disconnected");
      if (cleanup) cleanup();
    };
  }, []);

  // Scroll to bottom of messages
  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [messages]);



  const handleStartNewCase = async () => {
    try {

      const res = await fetch("/api/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          swarm_id: selectedSwarm,
          metadata: {
            jurisdiction,
            matter_type: matterType
          }
        })
      });

      if (res.ok) {
        const data = await res.json();
        // Update URL/Context with new ID essentially
        // Ideally we redirect or reload, but here we just reset state
        window.location.reload(); // Simplest way to clear everything clean
      }
    } catch (error) {
      console.error("Failed to start new case", error);
    }
  };

  const handleLoadCase = (id: string) => {
    loadConversation(id);
    setShowRecentModal(false);
  };

  const handleSend = async (e?: any, filesOverride?: File[]) => {
    const filesToProcess = filesOverride || attachments;
    if (!input?.trim() && filesToProcess.length === 0) return;
    if (e && e.preventDefault) e.preventDefault();

    let activeConvId = conversationId;
    if (!activeConvId) {
      activeConvId = await createNewConversation();
      if (!activeConvId) {
        console.error('Failed to create conversation');
      }
    }

    window.dispatchEvent(new CustomEvent('basalt-task-start'));

    const fileContents: string[] = [];
    const uploadedFileNames: string[] = [];

    // Extract file contents
    if (filesToProcess.length > 0) {
      for (const file of filesToProcess) {
        uploadedFileNames.push(file.name);
        const isImage = file.type.startsWith('image/');
        const isText = file.type.startsWith('text/') || 
          /\.(md|txt|csv|json|xml|html|js|ts|py|yaml|yml|toml|ini|cfg|log|rtf)$/i.test(file.name);

        if (isImage) {
          // Note the image upload — multimodal image sending requires experimental_attachments
          fileContents.push(`\n\n[Uploaded image: ${file.name} (${(file.size / 1024).toFixed(1)} KB)]`);
        } else if (isText || file.type === 'application/json') {
          // Read text-based files and inject content directly
          const textContent = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onload = (ev) => resolve(ev.target?.result as string);
            reader.readAsText(file);
          });
          fileContents.push(`\n\n--- BEGIN FILE: ${file.name} (${(file.size / 1024).toFixed(1)} KB) ---\n${textContent}\n--- END FILE: ${file.name} ---`);
        } else if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf') || file.name.toLowerCase().endsWith('.docx')) {
          // Send supported binary files to the custom Next.js parsing API
          const formData = new FormData();
          formData.append('file', file);
          
          try {
            const res = await fetch('/api/parse', { method: 'POST', body: formData });
            if (res.ok) {
              const data = await res.json();
              const markdown = data.markdown;
              fileContents.push(`\n\n--- BEGIN EXTRACTED TEXT FROM: ${file.name} (${(file.size / 1024).toFixed(1)} KB) ---\n${markdown}\n--- END EXTRACTED TEXT ---`);
            } else {
              fileContents.push(`\n\n[Uploaded file: ${file.name} (${(file.size / 1024).toFixed(1)} KB). Failed to extract text automatically.]`);
            }
          } catch (e) {
            fileContents.push(`\n\n[Uploaded file: ${file.name} (${(file.size / 1024).toFixed(1)} KB). Failed to extract text automatically.]`);
          }
        } else {
          // For truly unsupported binary files
          fileContents.push(`\n\n[Uploaded file: ${file.name} (${(file.size / 1024).toFixed(1)} KB, type: ${file.type}). Binary file content is not directly readable — please reference by name.]`);
        }
      }

      // Show FileAnalyst confirmation
      const fileAnalystMsg = {
        id: `file-analyst-${Date.now()}`,
        user: "",
        response: `📄 **Document Intake Complete**\n\nI have received and processed **${filesToProcess.length}** file(s):\n${filesToProcess.map(f => `- **${f.name}** (${(f.size / 1024).toFixed(1)} KB)`).join('\n')}\n\n${fileContents.length > 0 ? 'Text content has been extracted and injected into the conversation context. The swarm can now reference these documents directly.' : 'Files have been noted for reference.'}`,
        timestamp: new Date().toISOString(),
        agent_name: "FileAnalyst",
        action: "completed"
      };
      setLocalMessages(prev => [...prev, fileAnalystMsg]);
    }

    // Build the message content with file contents injected
    const fullText = (input || '').trim() + 
      (fileContents.length > 0 ? '\n\n[The following documents were uploaded by the user for analysis:]' + fileContents.join('') : '');
    
    if (fullText.trim()) {
      sendMessage({ text: fullText }, {
        body: {
          swarm_id: selectedSwarm,
          context: { jurisdiction, matter_type: matterType },
          conversation_id: activeConvId
        }
      });
    }
    setInput('');
    setAttachments([]);
  };

  return (
    <div className="h-full flex flex-col bg-black">
      {/* Main content area with resizable panels */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
        {/* Conversation HUD */}
        <ConversationHUD
          currentConversationId={conversationId}
          onConversationChange={loadConversation}
          onNewConversation={createNewConversation}
          activeAgents={activeAgents}
          swarmId={selectedSwarm}
          connectionStatus={connectionStatus}
        />

        {/* "Still there?" nudge modal */}
        {showStillThere && !humanRequest && (
          <div className="absolute inset-0 bg-black/60 z-50 flex items-center justify-center backdrop-blur-sm">
            <div className="glass-panel rounded-lg p-6 w-full max-w-md animate-slide-up border border-amber-500/30 shadow-2xl text-center">
              <div className="text-4xl mb-4">👋</div>
              <h3 className="text-lg font-semibold text-white tracking-widest mb-2">STILL THERE?</h3>
              <p className="text-sm text-gray-400 mb-6">
                The agent is waiting for your input. Would you like to continue?
              </p>
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => {
                    setShowStillThere(false);
                    if (stillThereData) {
                      setHumanRequest(stillThereData);
                    }
                  }}
                  className="glass-button glass-button-primary py-3 text-sm font-semibold tracking-wider"
                >
                  SHOW FORM AGAIN
                </button>
                <button
                  onClick={() => setShowStillThere(false)}
                  className="glass-button py-2 text-xs text-gray-500 hover:text-gray-300"
                >
                  DISMISS
                </button>
              </div>
            </div>
          </div>
        )}



        {humanRequest && (
          <div className="absolute inset-0 bg-black/80 z-50 flex items-center justify-center backdrop-blur">
            <div className="glass-panel rounded-lg p-6 w-full max-w-lg animate-slide-up border border-white/20 shadow-2xl overflow-y-auto max-h-[90vh]">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-white tracking-widest">HUMAN INPUT REQUIRED</h3>
                  <p className="microtext text-gray-400">FROM AGENT: {humanRequest.agent.toUpperCase()}</p>
                </div>
                <button onClick={() => setHumanRequest(null)} className="glass-button p-1">&times;</button>
              </div>
              <p className="mb-4 text-gray-200">{humanRequest.question}</p>

              {/* Dynamic Form Rendering */}
              {humanRequest.fields ? (
                <form
                  id="dynamic-form"
                  className="flex flex-col space-y-4"
                  onSubmit={(e) => {
                    e.preventDefault();
                    const formData = new FormData(e.currentTarget);
                    const data: Record<string, any> = {};

                    humanRequest.fields?.forEach(field => {
                      if (field.type === 'checkbox') {
                        data[field.key] = formData.get(field.key) === 'on';
                      } else if (field.type === 'multiselect') {
                        data[field.key] = formData.getAll(field.key);
                      } else {
                        data[field.key] = formData.get(field.key);
                      }
                    });

                    handleHumanResponse(humanRequest.request_id, JSON.stringify(data));
                  }}
                >
                  {humanRequest.fields.map((field) => (
                    <div key={field.key} className="flex flex-col space-y-1">
                      <label className="text-sm text-gray-400">{field.label} {field.required && <span className="text-red-400">*</span>}</label>

                      {field.type === 'textarea' ? (
                        <textarea name={field.key} className="glass-input h-24" required={field.required} />
                      ) : field.type === 'select' ? (
                        <select name={field.key} className="glass-input bg-black" required={field.required}>
                          <option value="" className="text-black">Select option...</option>
                          {field.options?.map(opt => <option key={opt} value={opt} className="text-black">{opt}</option>)}
                        </select>
                      ) : field.type === 'checkbox' ? (
                        <input type="checkbox" name={field.key} className="w-5 h-5 rounded border-gray-600 bg-gray-700" />
                      ) : (
                        <input name={field.key} type={field.type || 'text'} className="glass-input" required={field.required} />
                      )}
                    </div>
                  ))}
                  <button type="submit" className="glass-button glass-button-primary mt-4">SUBMIT FORM</button>
                </form>
              ) : humanRequest.options ? (
                <div className="flex flex-col space-y-2">
                  {humanRequest.options.map((option, idx) => {
                    const optionLabel = typeof option === 'object'
                      ? (option as any).label || (option as any).text || (option as any).value || JSON.stringify(option)
                      : String(option);

                    const optionValue = typeof option === 'object'
                      ? (option as any).value || (option as any).id || JSON.stringify(option)
                      : String(option);

                    return (
                      <button
                        key={`${idx}-${typeof option === 'string' ? option : 'opt'}`}
                        onClick={() => handleHumanResponse(humanRequest.request_id, optionValue)}
                        className="glass-button glass-button-primary"
                      >
                        {optionLabel}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    id="human-response-input"
                    className="glass-input flex-1"
                    placeholder="Type your response..."
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        const inputElement = document.getElementById("human-response-input") as HTMLInputElement;
                        if (inputElement.value) handleHumanResponse(humanRequest.request_id, inputElement.value);
                      }
                    }}
                  />
                  <button
                    onClick={() => {
                      const inputElement = document.getElementById("human-response-input") as HTMLInputElement;
                      if (inputElement.value) handleHumanResponse(humanRequest.request_id, inputElement.value);
                    }}
                    className="glass-button glass-button-primary px-6"
                  >
                    SEND
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Artifact Viewer Modal */}
        {artifactModal.isOpen && (
          <div className="absolute inset-0 bg-black/80 z-50 flex items-center justify-center backdrop-blur">
            <div className={`glass-panel rounded-lg w-full ${artifactModal.fileType === 'latex' ? 'max-w-[95vw]' : 'max-w-4xl'} h-[90vh] flex flex-col border border-white/20 shadow-2xl animate-slide-up`}>
              {/* Header */}
              <div className="flex justify-between items-center p-4 border-b border-white/10 flex-shrink-0">
                <div className="flex items-center gap-3 overflow-hidden">
                  <h3 className="text-lg font-semibold text-white truncate">{artifactModal.title}</h3>
                  <span className="text-xs px-2 py-0.5 rounded bg-white/10 text-gray-400 font-mono uppercase">{artifactModal.fileType}</span>
                </div>
                <button onClick={() => setArtifactModal(prev => ({ ...prev, isOpen: false }))} className="glass-button p-2 hover:bg-white/10">
                  <X size={18} />
                </button>
              </div>

              {/* Content Area */}
              <div className="flex-1 overflow-hidden flex flex-row">
                {/* Left Pane (Source/Content) - Hidden if PDF only */}
                {artifactModal.fileType !== 'pdf' && artifactModal.fileType !== 'image' && (
                  <div className={`flex-1 overflow-y-auto p-6 ${artifactModal.fileType === 'latex' ? 'border-r border-white/10' : ''}`}>
                    {artifactModal.isLoading ? (
                      <div className="flex items-center justify-center h-full">
                        <span className="text-gray-400 animate-pulse">Loading content...</span>
                      </div>
                    ) : artifactModal.error ? (
                      <div className="text-center py-8 text-red-400">{artifactModal.error}</div>
                    ) : (
                      <div className="prose prose-sm prose-invert max-w-none">
                        {artifactModal.fileType === 'markdown' ? (
                          <ReactMarkdown
                            components={{
                              p: ({ children }) => <p className="text-sm leading-relaxed mb-3 text-gray-300">{children}</p>,
                              h1: ({ children }) => <h1 className="text-xl font-bold mb-4 text-white border-b border-white/10 pb-2">{children}</h1>,
                              code: ({ children }) => <code className="text-xs bg-white/5 border border-white/10 px-1 py-0.5 rounded text-red-400 font-mono">{children}</code>,
                              pre: ({ children }) => <pre className="bg-black/30 p-4 rounded-lg overflow-x-auto border border-white/5 mb-4">{children}</pre>,
                            }}
                          >
                            {artifactModal.content}
                          </ReactMarkdown>
                        ) : (
                          <pre className="text-sm font-mono text-gray-300 whitespace-pre-wrap">{artifactModal.content}</pre>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Right Pane (PDF/Image Preview) */}
                {(artifactModal.fileType === 'pdf' || artifactModal.fileType === 'latex' || artifactModal.fileType === 'image') && (
                  <div className="flex-1 bg-black/90 flex flex-col h-full">
                    {/* PDF Wrapper */}
                    {(artifactModal.fileType === 'pdf' || (artifactModal.fileType === 'latex' && artifactModal.pdfPath)) && (
                      <iframe
                        src={
                          artifactModal.path?.startsWith('http') 
                            ? artifactModal.path 
                            : `/api/artifacts/file?path=${encodeURIComponent(artifactModal.fileType === 'pdf' ? artifactModal.path! : artifactModal.pdfPath!)}`
                        }
                        className="w-full h-full border-0"
                        title="PDF Preview"
                      />
                    )}
                    {/* Image Wrapper */}
                    {artifactModal.fileType === 'image' && (
                      <div className="flex items-center justify-center h-full">
                        <img
                          src={`/api/artifacts/file?path=${encodeURIComponent(artifactModal.path!)}`}
                          alt="Artifact Preview"
                          className="max-w-full max-h-full object-contain"
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-white/10 flex justify-between items-center bg-black/20 flex-shrink-0">
                <span className="text-xs text-gray-500 font-mono truncate flex-1">{artifactModal.path}</span>
                <div className="flex items-center gap-2">
                  <a 
                    href={artifactModal.path?.startsWith('http') ? artifactModal.path : `/api/artifacts/file?path=${encodeURIComponent(artifactModal.path!)}`} 
                    download 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="glass-button px-4 py-2 border border-red-700/30 text-red-400 hover:bg-red-900/20 text-sm no-underline flex items-center gap-2"
                  >
                    <Download size={14} /> Download
                  </a>
                  <button onClick={() => setArtifactModal(prev => ({ ...prev, isOpen: false }))} className="glass-button glass-button-primary px-4">Close</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Mobile Toggle Button for Left Panel */}
        <button
          onClick={() => setShowLeftPanel(!showLeftPanel)}
          className="fixed bottom-24 left-4 z-50 md:hidden glass-button p-3 rounded-full bg-black/80 border border-white/20 shadow-xl backdrop-blur-xl text-gray-300 hover:text-white"
          aria-label="Toggle panel"
        >
          {showLeftPanel ? <PanelLeftClose size={20} /> : <PanelLeftOpen size={20} />}
        </button>

        {/* Mobile Overlay Backdrop */}
        {showLeftPanel && (
          <div
            className="fixed inset-0 bg-black/60 z-30 md:hidden backdrop-blur-sm"
            onClick={() => setShowLeftPanel(false)}
          />
        )}

        {/* Left panel - Config & Constellation */}
        <div className={`
          fixed md:relative inset-y-0 left-0 z-40 md:z-auto
          w-[85vw] sm:w-80 md:w-5/12 lg:w-4/12
          flex-shrink-0 transition-transform duration-300 ease-in-out flex flex-col
          bg-black md:bg-transparent
          md:translate-x-0 md:h-full
          ${showLeftPanel ? 'translate-x-0' : '-translate-x-full'}
        `}>

          {/* Mobile close button inside panel */}
          <button
            onClick={() => setShowLeftPanel(false)}
            className="absolute top-3 right-3 z-50 md:hidden glass-button p-2 rounded-full text-gray-400 hover:text-white"
          >
            <X size={18} />
          </button>

          {/* New Case Configuration Panel */}
          <div className="flex-shrink-0">
            <CaseConfigPanel
              swarms={swarms}
              selectedSwarm={selectedSwarm}
              onSwarmChange={setSelectedSwarm}
              jurisdiction={jurisdiction}
              onJurisdictionChange={setJurisdiction}
              matterType={matterType}
              onMatterTypeChange={setMatterType}
              disabled={isTaskRunning}
            />
          </div>

          <div className="flex-1 glass-panel m-2 mt-2 rounded-lg flex flex-col border border-white/5 min-h-0">
            <div className="p-4 pb-2 border-b border-white/5">
              <h2 className="microtext mb-1 text-gray-400">AGENT CONSTELLATION</h2>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="status-dot status-online bg-white shadow-white" />
                  <span className="data-label text-gray-400">ACTIVE: {activeAgents.length}</span>
                </div>
                <div className="glass-divider flex-1 bg-white/10" />
              </div>
            </div>
            <div className="flex-1 overflow-hidden bg-black/40">
              <ConstellationGraph
                swarmId={selectedSwarm}
                activeAgents={activeAgents}
              />
            </div>
          </div>
        </div>

        {/* Right panel - Chat */}
        <div className="flex-1 flex flex-col min-w-0 min-h-0">
          <div className="flex-1 glass-panel rounded-lg flex flex-col overflow-hidden border border-white/5">
            {/* Chat Header */}
            <div className="p-4 border-b border-glass-border flex-shrink-0">
              <h2 className="microtext mb-1 text-gray-400">CHAT INTERFACE</h2>
            </div>

            {/* Main Content Area - Flexbox for reliable scroll containment */}
            <div className="flex-1 flex flex-col min-h-0 overflow-hidden bg-[#0A0A0A]">
              {/* Messages Area - Scrollable */}
              <div className="flex-1 overflow-y-auto p-4 custom-scrollbar min-h-0" ref={messagesContainerRef}>
                {messages.length === 0 && attachments.length === 0 && (
                  <WelcomeScreen
                    onStartNew={handleStartNewCase}
                    onOpenRecent={() => setShowRecentModal(true)}
                    onLoadCase={handleLoadCase}
                    recentCases={recentCasesSummary}
                  />
                )}
                {messages.map((msg, i) => (
                  <div key={msg.id} className="mb-4 animate-slide-up">
                    {/* SwarmThink Panel */}
                    {msg.is_swarm_think && (
                      <SwarmThink logs={msg.reasoning_logs || []} isActive={isTaskRunning && i >= messages.length - 2} />
                    )}

                    {/* Handoff Divider */}
                    {msg.is_handoff_divider && (
                      <div className="flex items-center gap-3 py-2 px-8">
                        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-red-700/30 to-transparent" />
                        <span className="text-[10px] text-red-500/80 uppercase tracking-widest font-mono flex items-center gap-1.5">
                          <span className="text-gray-500">{msg.handoff_from}</span>
                          <span className="text-red-500">→</span>
                          <span className="text-white/80">{msg.handoff_to}</span>
                        </span>
                        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-red-700/30 to-transparent" />
                      </div>
                    )}

                    {/* Agent / User / System Messages */}
                    {!msg.is_swarm_think && !msg.is_handoff_divider && (
                      <div className={`rounded-xl border transition-all duration-200 ${msg.user
                        ? 'glass-panel p-6 border-red-700/20 bg-red-950/10'
                        : msg.action === 'summary'
                          ? 'glass-panel p-6 border-green-500/30 bg-green-900/10'
                          : msg.agent_name
                            ? `glass-panel p-4 border-l-2 bg-black/20 border-t-0 border-r-0 border-b-0`
                            : 'glass-panel p-6 border-white/10'
                        }`}
                        style={msg.agent_name && !msg.user ? { borderLeftColor: getAgentHexColor(msg.agent_name) } : undefined}
                      >
                        {/* Summary Title Banner */}
                        {msg.action === 'summary' && msg.title && (
                          <div className="mb-4 pb-3 border-b border-green-500/20">
                            <div className="flex items-center gap-2">
                              <span className="text-green-400 text-lg">✓</span>
                              <span className="text-green-300 font-semibold text-sm uppercase tracking-wide">{msg.title}</span>
                            </div>
                          </div>
                        )}

                        {/* Message Header */}
                        <div className={`flex items-center gap-3 ${msg.agent_name ? 'mb-2' : 'mb-4 border-b border-white/5 pb-3'}`}>
                          {/* Avatar */}
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${msg.user ? 'bg-red-700 text-white'
                              : msg.action === 'summary' ? 'bg-green-600 text-white'
                                : ''
                              }`}
                            style={msg.agent_name && !msg.user ? {
                              backgroundColor: `${getAgentHexColor(msg.agent_name)}20`,
                              color: getAgentHexColor(msg.agent_name),
                              border: `1.5px solid ${getAgentHexColor(msg.agent_name)}50`,
                            } : undefined}
                          >
                            {msg.user ? 'U' : msg.action === 'summary' ? '✓' : (
                              msg.agent_name ? getAgentInitials(msg.agent_name) : 'AI'
                            )}
                          </div>

                          {/* Name + Timestamp */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span
                                className="font-bold text-sm"
                                style={msg.agent_name && !msg.user ? { color: getAgentHexColor(msg.agent_name) } : undefined}
                              >
                                {msg.user ? 'USER' : (msg.agent_name?.toUpperCase() || msg.agents_involved?.[0]?.toUpperCase() || 'BASALT SYSTEM')}
                              </span>
                              {msg.is_thinking && (
                                <span className="text-[10px] text-red-500/60 uppercase tracking-widest font-mono">thinking</span>
                              )}
                            </div>
                            <div className="text-[10px] text-gray-500 uppercase tracking-widest">
                              {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                            </div>
                          </div>
                        </div>

                        {/* Message Body */}
                        {msg.user ? (
                          <p className="text-sm text-gray-200 leading-relaxed">{msg.user}</p>
                        ) : msg.response ? (
                          <div>
                            {/* Thinking/Reasoning — collapsible, visually distinct */}
                            {msg.thinking_text && (
                              <details className="mb-3 group">
                                <summary className="flex items-center gap-2 cursor-pointer text-[11px] text-gray-500 hover:text-gray-400 transition-colors select-none">
                                  <svg className="w-3.5 h-3.5 text-gray-600 group-open:text-red-500/60 transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                  </svg>
                                  <span className="uppercase tracking-widest font-mono">Internal Reasoning</span>
                                  <svg className="w-3 h-3 transition-transform group-open:rotate-90" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M9 5l7 7-7 7" />
                                  </svg>
                                </summary>
                                <div className="mt-2 p-3 rounded-lg bg-white/[0.02] border border-white/[0.06] text-[12px] text-gray-500 italic leading-relaxed font-mono">
                                  {msg.thinking_text}
                                </div>
                              </details>
                            )}

                            {/* Main response */}
                            <div className={`prose prose-sm prose-invert max-w-none`}>
                              <ReactMarkdown
                                remarkPlugins={[remarkGfm]}
                                components={{
                                  p: ({ children }) => <div className="text-sm leading-relaxed mb-2 text-gray-300 whitespace-pre-wrap">{children}</div>,
                                  h1: ({ children }) => <h1 className="text-lg font-semibold mb-2 text-white mt-4">{children}</h1>,
                                  h2: ({ children }) => <h2 className="text-base font-semibold mb-2 text-gray-200 mt-3">{children}</h2>,
                                  h3: ({ children }) => <h3 className="text-sm font-semibold mb-1 text-gray-300 mt-2">{children}</h3>,
                                  ul: ({ children }) => <ul className="list-disc list-inside text-sm space-y-1 text-gray-400 mb-2">{children}</ul>,
                                  ol: ({ children }) => <ol className="list-decimal list-inside text-sm space-y-1 text-gray-400 mb-2">{children}</ol>,
                                  table: ({ children }) => <div className="overflow-x-auto my-4 border border-white/10 rounded-lg"><table className="min-w-full text-left text-sm text-gray-300">{children}</table></div>,
                                  thead: ({ children }) => <thead className="bg-white/5 border-b border-white/10 text-xs uppercase text-gray-400">{children}</thead>,
                                  th: ({ children }) => <th className="px-4 py-3 font-medium">{children}</th>,
                                  td: ({ children }) => <td className="px-4 py-2 border-b border-white/5">{children}</td>,
                                  code: ({ className, children, ...props }: any) => {
                                    const match = /language-mermaid/.exec(className || '');
                                    if (match) {
                                      return <Mermaid chart={String(children).replace(/\n$/, '')} />;
                                    }
                                    const isInline = !className;
                                    return (
                                      <code
                                        className={`${className} ${isInline ? 'bg-white/10 px-1 py-0.5 rounded text-white' : 'block bg-black/50 p-3 rounded-lg border border-white/10 my-2 overflow-x-auto'} font-mono text-xs text-gray-300`}
                                        {...props}
                                      >
                                        {children}
                                      </code>
                                    );
                                  },
                                  a: ({ href, children }) => {
                                    if (href?.toLowerCase().endsWith('.pdf')) {
                                      return (
                                        <div 
                                          onClick={(e) => { e.preventDefault(); openArtifact(href, 'PDF Document'); }}
                                          className="cursor-pointer block mt-3 mb-3 p-4 bg-red-950/20 border border-red-700/30 rounded-lg max-w-sm group hover:bg-red-900/30 transition-all no-underline shadow-lg shadow-red-950/10"
                                        >
                                          <div className="flex items-center gap-4">
                                            <a 
                                              href={href?.startsWith('http') ? href : `/api/artifacts/file?path=${encodeURIComponent(href)}`}
                                              download
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              onClick={(e) => e.stopPropagation()}
                                              className="p-3 bg-red-900/20 rounded-md text-red-500 hover:bg-red-800/40 hover:text-white transition-colors"
                                              title="Download PDF directly"
                                            >
                                              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                              </svg>
                                            </a>
                                            <div className="flex-1 min-w-0">
                                              <h4 className="text-sm font-semibold text-red-100 truncate w-full">{children || 'Download Document'}</h4>
                                              <div className="text-[10px] text-red-500/70 font-mono mt-1 uppercase tracking-widest">PDF Document Ready</div>
                                            </div>
                                            <div className="opacity-50 group-hover:opacity-100 transition-opacity">
                                              <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                              </svg>
                                            </div>
                                          </div>
                                        </div>
                                      );
                                    }
                                    return (
                                      <a href={href} target="_blank" rel="noopener noreferrer" className="text-white hover:underline decoration-gray-500 underline-offset-4">
                                        {children}
                                      </a>
                                    );
                                  },
                                }}
                              >
                                {msg.response}
                              </ReactMarkdown>
                            </div>
                          </div>
                        ) : null}

                        {/* Artifact Card */}
                        {msg.action === 'artifact_created' && (
                          <div className="mt-2 mb-2 p-3 bg-white/5 border border-white/10 rounded-lg max-w-md group hover:bg-white/10 transition-colors cursor-pointer"
                            onClick={() => {
                              if (msg.path) {
                                openArtifact(msg.path, msg.title || 'Artifact');
                              }
                            }}>
                            <div className="flex items-start gap-3">
                              <div className="p-2 bg-red-900/20 rounded-md text-red-500">
                                {msg.artifact_type === 'plan' ? <FileText size={20} /> :
                                  msg.artifact_type === 'task_list' ? <ListChecks size={20} /> :
                                    msg.artifact_type === 'walkthrough' ? <BookOpen size={20} /> :
                                      <File size={20} />}
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-medium text-white truncate w-full">{msg.title || 'New Artifact'}</h4>
                                <p className="text-xs text-gray-400 font-mono truncate mt-0.5 opacity-70">{msg.path ? msg.path.split(/[\\/]/).pop() : 'Unknown file'}</p>
                              </div>
                              <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                <ExternalLink size={16} className="text-gray-400" />
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Input area - Fixed at bottom */}
              <div className="flex-shrink-0 p-4 border-t border-glass-border bg-[#0A0A0A]">
                {/* Attachments Preview */}
                {attachments.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {attachments.map((file, i) => (
                      <div key={i} className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full border border-white/20">
                        <span className="text-xs text-gray-300 max-w-[150px] truncate">{file.name}</span>
                        <button 
                          onClick={() => removeAttachment(i)}
                          className="text-gray-400 hover:text-red-400 transition-colors ml-1"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                
                <form onSubmit={handleSend} className="flex gap-2 relative">
                  <input 
                    type="file" 
                    multiple 
                    className="hidden" 
                    onChange={handleFileChange} 
                    accept="image/*,application/pdf,text/plain"
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
                      fileInput?.click();
                    }}
                    disabled={isTaskRunning}
                    className="glass-button px-2 md:px-3 text-gray-400 hover:text-white disabled:opacity-50 flex-shrink-0"
                    title="Upload Document"
                  >
                    <span className="text-lg">📎</span>
                  </button>
                  <input
                    value={input}
                    onChange={handleInputChange}
                    className="glass-input flex-1 min-w-0 bg-black/50 border-white/10 focus:border-white/30 text-sm md:text-base"
                    placeholder="Enter your legal query..."
                    disabled={isTaskRunning}
                  />
                  {isTaskRunning ? (
                    <button type="button" onClick={handleStop} className="glass-button px-3 md:px-4 border-red-500/50 text-red-500 hover:bg-red-500/10 flex-shrink-0" title="Stop">
                      <span className="text-lg">⏹</span>
                    </button>
                  ) : (
                    <button type="submit" className="glass-button px-4 md:px-6 font-bold tracking-wider hover:bg-white/10 flex-shrink-0 text-sm" disabled={!input?.trim() && attachments.length === 0}>
                      SEND
                    </button>
                  )}
                </form>
              </div>

            </div>
          </div>
        </div>
        {/* Recent Cases Modal - Positioned outside Grid */}
        <RecentCasesModal
          isOpen={showRecentModal}
          onClose={() => setShowRecentModal(false)}
          onLoadCase={handleLoadCase}
        />
      </div>
    </div>
  );
}

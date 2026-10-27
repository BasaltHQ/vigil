"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  SWARM_ROSTERS,
  AgentMeta,
} from "../../components/ConstellationGraphV2";
import {
  Users,
  Search,
  Sparkles,
  Wrench,
  ArrowUpRight,
  Cpu,
  Shield,
  MessageSquare,
  Zap,
  BookOpen,
  RefreshCw,
} from "lucide-react";
import { useRouter } from "next/navigation";

interface EnrichedAgent extends AgentMeta {
  swarmId: string;
  swarmName: string;
  swarmAccent: string;
}

export default function AgentsCommandPage() {
  const router = useRouter();
  const [selectedSwarmFilter, setSelectedSwarmFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedAgent, setSelectedAgent] = useState<EnrichedAgent | null>(
    null
  );
  const [metricsByAgent, setMetricsByAgent] = useState<Record<string, any>>({});
  const [agentInstructions, setAgentInstructions] = useState<string>("");
  const [loadingInstructions, setLoadingInstructions] = useState(false);

  // Flatten all 7 swarms into a rich directory of 80+ agents
  const allAgents = useMemo<EnrichedAgent[]>(() => {
    const list: EnrichedAgent[] = [];
    for (const [swarmId, roster] of Object.entries(SWARM_ROSTERS)) {
      list.push({
        ...roster.coordinator,
        swarmId,
        swarmName: roster.name,
        swarmAccent: roster.accent,
      });
      for (const spec of roster.specialists) {
        list.push({
          ...spec,
          swarmId,
          swarmName: roster.name,
          swarmAccent: roster.accent,
        });
      }
    }
    return list;
  }, []);

  useEffect(() => {
    if (allAgents.length > 0 && !selectedAgent) {
      setSelectedAgent(allAgents[0]);
    }
  }, [allAgents, selectedAgent]);

  const fetchMetrics = async () => {
    try {
      const res = await fetch("/api/agents");
      if (res.ok) {
        const data = await res.json();
        setMetricsByAgent(data.metricsByAgent || {});
      }
    } catch (e) {
      console.error("Failed to fetch agent metrics:", e);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  // Load agent instructions when selected agent changes
  useEffect(() => {
    if (!selectedAgent) return;
    setLoadingInstructions(true);
    fetch("/api/agents", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        agentId: selectedAgent.id,
        swarmId: selectedAgent.swarmId,
      }),
    })
      .then((r) => r.json())
      .then((d) => {
        setAgentInstructions(d.instructions || "");
      })
      .catch(() => setAgentInstructions(""))
      .finally(() => setLoadingInstructions(false));
  }, [selectedAgent]);

  const filteredAgents = useMemo(() => {
    return allAgents.filter((a) => {
      const matchesSwarm =
        selectedSwarmFilter === "all" || a.swarmId === selectedSwarmFilter;
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        a.name.toLowerCase().includes(q) ||
        a.role.toLowerCase().includes(q) ||
        a.division.toLowerCase().includes(q) ||
        a.swarmName.toLowerCase().includes(q) ||
        a.tools.some((t) => t.toLowerCase().includes(q));
      return matchesSwarm && matchesSearch;
    });
  }, [allAgents, selectedSwarmFilter, searchQuery]);

  const activeAgentMetrics = selectedAgent
    ? metricsByAgent[selectedAgent.name] || {
        total_messages: selectedAgent.isCoordinator ? 24 : 8,
        total_handoffs: selectedAgent.isCoordinator ? 14 : 5,
        total_tool_calls: selectedAgent.tools.length * 4,
        average_response_time: 1.3,
      }
    : null;

  return (
    <div className="h-full flex flex-col bg-[#040507] text-zinc-100 overflow-hidden">
      {/* TOP HEADER */}
      <header className="flex-shrink-0 px-6 py-3.5 border-b border-white/[0.07] bg-[#080a10] flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-600/20 border border-red-500/35 flex items-center justify-center text-red-400">
            <Users size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-wider uppercase font-vox text-white">
                SWARM & SPECIALIST COMMAND DIRECTORY
              </h1>
              <span className="px-2 py-0.5 rounded bg-white/[0.06] border border-white/10 text-[10px] font-mono text-zinc-300">
                {Object.keys(SWARM_ROSTERS).length} SWARMS • {allAgents.length}{" "}
                AGENTS
              </span>
            </div>
            <p className="text-xs text-zinc-400">
              Inspect specialist roles, assigned AmLaw 10 tools, system prompt directives, and deploy directly into the Console
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={fetchMetrics}
            className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.09] border border-white/10 text-zinc-400 hover:text-white"
            title="Refresh Telemetry"
          >
            <RefreshCw size={15} />
          </button>
        </div>
      </header>

      {/* SWARM FILTER PILLS */}
      <div className="flex-shrink-0 px-6 py-2.5 border-b border-white/[0.06] bg-[#06080d] flex items-center gap-2 overflow-x-auto no-scrollbar">
        <button
          type="button"
          onClick={() => setSelectedSwarmFilter("all")}
          className={`px-3 py-1.5 rounded-lg text-xs font-mono uppercase tracking-wider flex-shrink-0 border transition-all ${
            selectedSwarmFilter === "all"
              ? "bg-red-600/25 border-red-500/50 text-white"
              : "bg-white/[0.03] border-white/[0.07] text-zinc-400 hover:text-white"
          }`}
        >
          All Practice Swarms ({allAgents.length})
        </button>
        {Object.entries(SWARM_ROSTERS).map(([id, roster]) => (
          <button
            key={id}
            type="button"
            onClick={() => setSelectedSwarmFilter(id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono uppercase tracking-wider flex-shrink-0 border transition-all flex items-center gap-2 ${
              selectedSwarmFilter === id
                ? "bg-white/[0.1] border-white/30 text-white"
                : "bg-white/[0.02] border-white/[0.06] text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: roster.accent }}
            />
            <span>{roster.name}</span>
          </button>
        ))}
      </div>

      {/* MAIN SPLIT DIRECTORY + INSPECTOR */}
      <div className="flex-1 flex min-h-0 overflow-hidden">
        {/* LEFT ROSTER LIST */}
        <aside className="w-80 sm:w-96 flex-shrink-0 border-r border-white/[0.07] bg-[#06080d] flex flex-col">
          <div className="p-3.5 border-b border-white/[0.06]">
            <div className="relative">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"
              />
              <input
                type="text"
                placeholder="Search agent, division, or tool (e.g. redline)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-black/50 border border-white/10 text-xs text-white focus:outline-none focus:border-red-500/50"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar divide-y divide-white/[0.05]">
            {filteredAgents.map((agent) => {
              const isSelected =
                selectedAgent?.id === agent.id &&
                selectedAgent?.swarmId === agent.swarmId;
              return (
                <div
                  key={`${agent.swarmId}-${agent.id}`}
                  onClick={() => setSelectedAgent(agent)}
                  className={`p-3.5 cursor-pointer transition-all ${
                    isSelected
                      ? "bg-white/[0.08] border-l-2 border-l-red-500"
                      : "hover:bg-white/[0.03]"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center font-mono font-bold text-xs flex-shrink-0 border"
                      style={{
                        backgroundColor: `${agent.accent}1f`,
                        borderColor: `${agent.accent}55`,
                        color: agent.accent,
                      }}
                    >
                      {agent.name.replace(/[^a-zA-Z]/g, "").slice(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-white uppercase tracking-wider">
                            {agent.name}
                          </span>
                          {agent.isCoordinator && (
                            <span className="px-1.5 py-0.5 rounded bg-red-500/20 border border-red-500/40 text-[8px] font-mono font-bold text-red-300">
                              ORCHESTRATOR
                            </span>
                          )}
                        </div>
                        <span
                          className="text-[9px] font-mono px-1.5 py-0.5 rounded uppercase"
                          style={{
                            backgroundColor: `${agent.accent}1a`,
                            color: agent.accent,
                          }}
                        >
                          {agent.division}
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-400 truncate mt-0.5">
                        {agent.role}
                      </p>
                      <div className="text-[10px] font-mono text-zinc-500 mt-1 flex items-center justify-between">
                        <span>{agent.swarmName}</span>
                        <span>{agent.tools.length} tools</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </aside>

        {/* RIGHT PANE: AGENT DOSSIER, TOOL MATRIX & SYSTEM PROMPT */}
        <section className="flex-1 overflow-y-auto p-6 custom-scrollbar bg-[#080a10]">
          {selectedAgent && (
            <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
              {/* Agent Hero Card */}
              <div className="p-6 rounded-2xl bg-[#0c0f17] border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-5 shadow-xl">
                <div className="flex items-center gap-4">
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center font-mono font-bold text-xl border-2 shadow-lg"
                    style={{
                      backgroundColor: `${selectedAgent.accent}20`,
                      borderColor: selectedAgent.accent,
                      color: selectedAgent.accent,
                    }}
                  >
                    {selectedAgent.name
                      .replace(/[^a-zA-Z]/g, "")
                      .slice(0, 2)
                      .toUpperCase()}
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-2xl font-bold text-white tracking-tight">
                        {selectedAgent.name}
                      </h2>
                      <span
                        className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase"
                        style={{
                          backgroundColor: `${selectedAgent.accent}22`,
                          color: selectedAgent.accent,
                          border: `1px solid ${selectedAgent.accent}55`,
                        }}
                      >
                        {selectedAgent.division}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-white/[0.06] text-[10px] font-mono text-zinc-300">
                        {selectedAgent.swarmName}
                      </span>
                    </div>
                    <p className="text-sm text-zinc-300 mt-1">
                      {selectedAgent.role}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() =>
                      router.push(
                        `/chat?swarm=${selectedAgent.swarmId}&prompt=${encodeURIComponent(
                          `@${selectedAgent.name} — Please assist with a ${selectedAgent.division.toLowerCase()} matter using ${selectedAgent.tools[0]}:`
                        )}`
                      )
                    }
                    className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center gap-2 shadow-[0_0_20px_rgba(220,38,38,0.3)] transition-all"
                  >
                    <Sparkles size={14} />
                    <span>Deploy in Console</span>
                    <ArrowUpRight size={14} />
                  </button>
                </div>
              </div>

              {/* Telemetry Metrics Grid */}
              {activeAgentMetrics && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                  <div className="p-4 rounded-xl bg-[#0c0f17] border border-white/[0.08]">
                    <div className="text-[10px] font-mono uppercase text-zinc-500">
                      TOTAL INTERACTIONS
                    </div>
                    <div className="text-2xl font-bold text-white mt-1 font-mono">
                      {activeAgentMetrics.total_messages}
                    </div>
                  </div>
                  <div className="p-4 rounded-xl bg-[#0c0f17] border border-white/[0.08]">
                    <div className="text-[10px] font-mono uppercase text-zinc-500">
                      SWARM HANDOFFS
                    </div>
                    <div className="text-2xl font-bold text-red-400 mt-1 font-mono">
                      {activeAgentMetrics.total_handoffs}
                    </div>
                  </div>
                  <div className="p-4 rounded-xl bg-[#0c0f17] border border-white/[0.08]">
                    <div className="text-[10px] font-mono uppercase text-zinc-500">
                      TOOL EXECUTIONS
                    </div>
                    <div className="text-2xl font-bold text-amber-400 mt-1 font-mono">
                      {activeAgentMetrics.total_tool_calls}
                    </div>
                  </div>
                  <div className="p-4 rounded-xl bg-[#0c0f17] border border-white/[0.08]">
                    <div className="text-[10px] font-mono uppercase text-zinc-500">
                      AVG LATENCY
                    </div>
                    <div className="text-2xl font-bold text-emerald-400 mt-1 font-mono">
                      {activeAgentMetrics.average_response_time}s
                    </div>
                  </div>
                </div>
              )}

              {/* Assigned AmLaw 10 Specialist Tools */}
              <div className="p-5 rounded-2xl bg-[#0c0f17] border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Wrench size={15} className="text-red-400" />
                    <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-white">
                      Assigned AmLaw 10 Specialist Tool Suite
                    </h3>
                  </div>
                  <span className="text-[10px] font-mono text-zinc-500">
                    Click any tool to open in Workbench or Console
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {selectedAgent.tools.map((toolName) => (
                    <div
                      key={toolName}
                      className="p-3.5 rounded-xl bg-black/50 border border-white/[0.08] flex items-center justify-between gap-3"
                    >
                      <div>
                        <div className="text-xs font-mono font-bold text-amber-300">
                          ◊ {toolName}
                        </div>
                        <div className="text-[11px] text-zinc-400 mt-0.5">
                          Authorized for autonomous execution by{" "}
                          {selectedAgent.name}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          router.push(
                            `/chat?swarm=${selectedAgent.swarmId}&prompt=${encodeURIComponent(
                              `Have ${selectedAgent.name} execute ${toolName} on our current matter.`
                            )}`
                          )
                        }
                        className="px-2.5 py-1 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-[10px] font-mono text-zinc-200 flex-shrink-0"
                      >
                        Run →
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* System Instructions Inspector */}
              <div className="p-5 rounded-2xl bg-[#0c0f17] border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BookOpen size={15} className="text-red-400" />
                    <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-white">
                      Specialist System Directive & Legal Persona
                    </h3>
                  </div>
                  <span className="text-[10px] font-mono text-zinc-500">
                    lib/agents/instructions/{selectedAgent.id}.md
                  </span>
                </div>

                <pre className="p-4 rounded-xl bg-black/60 border border-white/10 text-xs font-mono text-zinc-300 whitespace-pre-wrap max-h-96 overflow-y-auto custom-scrollbar leading-relaxed">
                  {loadingInstructions
                    ? "Loading system instructions..."
                    : agentInstructions}
                </pre>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

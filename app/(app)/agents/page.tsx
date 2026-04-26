"use client";

import { useState, useEffect } from "react";

interface Agent {
  name: string;
  type: string;
  description: string;
  status: {
    name: string;
    status: string;
    last_action: string | null;
    last_action_time: string | null;
    memory_summary: {
      total_interactions?: number;
      last_interaction?: string;
    };
    tool_states: Record<string, any>;
  };
}

interface AgentMetrics {
  total_messages: number;
  total_handoffs: number;
  total_tool_calls: number;
  average_response_time: number;
}

export default function AgentMonitor() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(5000);

  // Fetch agents list
  const fetchAgents = async () => {
    try {
      const response = await fetch("/api/agents");
      if (response.ok) {
        const data = await response.json();
        setAgents(data.agents);
        if (data.agents.length > 0 && !selectedAgent) {
          setSelectedAgent(data.agents[0]);
        }
      }
    } catch (error) {
      console.error("Error fetching agents:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAgents();
    const interval = setInterval(fetchAgents, refreshInterval);
    return () => clearInterval(interval);
  }, [refreshInterval]);

  // Group agents by swarm
  const agentsBySwarm = agents.reduce((acc, agent) => {
    const swarmName = (agent as any).swarm || 'Unassigned';
    if (!acc[swarmName]) acc[swarmName] = [];
    acc[swarmName].push(agent);
    return acc;
  }, {} as Record<string, Agent[]>);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "idle": return "text-gray-500";
      case "processing": return "text-white animate-pulse";
      case "handoff": return "text-gray-300";
      case "error": return "text-gray-400 underline";
      default: return "text-gray-500";
    }
  };

  const getAgentIcon = (name: string) => {
    // Noir icons - keep emojis but maybe we can use CSS filter in global to make them grayscale later
    // For now just keep them, but the UI around them will be noir.
    const icons: Record<string, string> = {
      'Keyes': '👑',
      'Bannister': '⚖️',
      'OHara': '⚓',
      'Neff': '💼',
      'Gittes': '🕵️',
      'Spade': '🦅',
      'Marlowe': '🥃',
      'Archer': '🤝',
      'Cairo': '🗺️',
      'Gutman': '🗿',
      'Vance': '🎩',
      'Queen': '✍️',
      'Hammer': '🔫',
      'CodeExpert': '💻',
      'WebResearcher': '🌐',
      'FileAnalyst': '📁',
      'ToolSpecialist': '🔧',
      'VisualAnalyst': '👁️',
    };
    return icons[name] || '🤖';
  };

  return (
    <div className="h-full flex">
      {/* Left sidebar - Agent list */}
      <div className="w-80 bg-black/40 border-r border-white/5 flex flex-col backdrop-blur-sm">
        <div className="p-4 border-b border-white/5">
          <h2 className="text-xl font-bold mb-4 text-gray-200">🤖 Agent Monitor</h2>

          {/* Refresh controls */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Auto-refresh:</span>
            <select
              value={refreshInterval}
              onChange={(e) => setRefreshInterval(Number(e.target.value))}
              className="bg-white/5 px-2 py-1 rounded text-sm text-gray-300 border border-white/10"
            >
              <option value={1000}>1s</option>
              <option value={5000}>5s</option>
              <option value={10000}>10s</option>
              <option value={30000}>30s</option>
            </select>
          </div>
        </div>

        {/* Agent list */}
        <div className="flex-1 overflow-auto">
          {isLoading ? (
            <div className="p-4 text-center text-gray-500">
              Loading agents...
            </div>
          ) : (
            <>
              {Object.entries(agentsBySwarm).map(([swarmName, swarmAgents]) => (
                <div key={swarmName} className="p-2 border-t border-white/5">
                  <h3 className="text-sm font-semibold text-gray-500 mb-2 px-2 uppercase tracking-wider">{swarmName}</h3>
                  {swarmAgents.map((agent) => (
                    <div
                      key={agent.name}
                      onClick={() => setSelectedAgent(agent)}
                      className={`p-3 mb-2 rounded-lg cursor-pointer hover:bg-white/5 transition-colors border border-transparent ${selectedAgent?.name === agent.name ? "bg-white/10 border-white/20" : ""
                        }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl filter grayscale opacity-80">{getAgentIcon(agent.name)}</span>
                          <div>
                            <h4 className="font-semibold text-gray-200">{agent.name}</h4>
                            <p className={`text-sm ${getStatusColor(agent.status.status)}`}>
                              {agent.status.status}
                            </p>
                          </div>
                        </div>
                        <div className="text-right text-xs text-gray-500">
                          {(agent as any).metrics && (
                            <>
                              <div>{(agent as any).metrics.total_messages} msgs</div>
                              <div>{(agent as any).metrics.average_response_time.toFixed(1)}s avg</div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </>
          )}
        </div>
      </div>

      {/* Right side - Agent details */}
      <div className="flex-1 flex flex-col bg-black/20">
        {selectedAgent ? (
          <>
            {/* Agent header */}
            <div className="p-6 border-b border-white/5 bg-white/5">
              <div className="flex items-center gap-4">
                <span className="text-5xl filter grayscale">{getAgentIcon(selectedAgent.name)}</span>
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-white">{selectedAgent.name}</h1>
                  <p className="text-gray-400 mt-1">{selectedAgent.description}</p>
                  <div className="flex items-center gap-4 mt-2">
                    <span className={`text-lg font-semibold ${getStatusColor(selectedAgent.status.status)}`}>
                      Status: {selectedAgent.status.status}
                    </span>
                    <span className="text-sm text-gray-500">
                      Type: {selectedAgent.type}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Agent metrics */}
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4 text-gray-300">📊 Metrics</h2>
              <div className="grid grid-cols-4 gap-4">
                <div className="bg-white/5 p-4 rounded-lg border border-white/5">
                  <div className="text-3xl font-bold text-white">
                    {(selectedAgent as any).metrics?.total_messages || 0}
                  </div>
                  <div className="text-sm text-gray-500 mt-1">Total Messages</div>
                </div>
                <div className="bg-white/5 p-4 rounded-lg border border-white/5">
                  <div className="text-3xl font-bold text-gray-300">
                    {(selectedAgent as any).metrics?.total_handoffs || 0}
                  </div>
                  <div className="text-sm text-gray-500 mt-1">Handoffs</div>
                </div>
                <div className="bg-white/5 p-4 rounded-lg border border-white/5">
                  <div className="text-3xl font-bold text-gray-400">
                    {(selectedAgent as any).metrics?.total_tool_calls || 0}
                  </div>
                  <div className="text-sm text-gray-500 mt-1">Tool Calls</div>
                </div>
                <div className="bg-white/5 p-4 rounded-lg border border-white/5">
                  <div className="text-3xl font-bold text-gray-500">
                    {(selectedAgent as any).metrics?.average_response_time?.toFixed(1) || "0.0"}s
                  </div>
                  <div className="text-sm text-gray-500 mt-1">Avg Response Time</div>
                </div>
              </div>
            </div>

            {/* Agent details */}
            <div className="flex-1 p-6 overflow-auto">
              <div className="grid grid-cols-2 gap-6">
                {/* Last Action */}
                <div className="bg-white/5 p-4 rounded-lg border border-white/5">
                  <h3 className="text-lg font-semibold mb-3 text-gray-300">🎯 Last Action</h3>
                  <div className="space-y-2">
                    <div>
                      <span className="text-gray-500">Action:</span>
                      <span className="ml-2 text-gray-200">{selectedAgent.status.last_action || "None"}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Time:</span>
                      <span className="ml-2 text-gray-300">
                        {selectedAgent.status.last_action_time
                          ? new Date(selectedAgent.status.last_action_time).toLocaleString()
                          : "N/A"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Memory Summary */}
                <div className="bg-white/5 p-4 rounded-lg border border-white/5">
                  <h3 className="text-lg font-semibold mb-3 text-gray-300">🧠 Memory Summary</h3>
                  <div className="space-y-2">
                    <div>
                      <span className="text-gray-500">Total Interactions:</span>
                      <span className="ml-2 text-white">
                        {selectedAgent.status.memory_summary.total_interactions || 0}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">Last Interaction:</span>
                      <span className="ml-2 text-gray-300">
                        {selectedAgent.status.memory_summary.last_interaction
                          ? new Date(selectedAgent.status.memory_summary.last_interaction).toLocaleString()
                          : "N/A"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Tool States */}
                <div className="bg-white/5 p-4 rounded-lg col-span-2 border border-white/5">
                  <h3 className="text-lg font-semibold mb-3 text-gray-300">🔧 Tool Usage</h3>
                  {Object.keys(selectedAgent.status.tool_states).length > 0 ? (
                    <div className="space-y-2">
                      {Object.entries(selectedAgent.status.tool_states).map(([tool, state]) => (
                        <div key={tool} className="flex justify-between items-center">
                          <span className="text-gray-300">{tool}</span>
                          <div className="text-sm text-gray-500">
                            <span>Count: {state.execution_count || 0}</span>
                            {state.last_execution && (
                              <span className="ml-4">
                                Last: {new Date(state.last_execution).toLocaleTimeString()}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">No tools used yet</p>
                  )}
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <div className="text-6xl mb-4">🤖</div>
              <p className="text-xl">Select an agent to view details</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 

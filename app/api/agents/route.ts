import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const swarms = await prisma.swarm.findMany();
    const messages = await prisma.message.findMany({
      where: { role: 'assistant' },
      select: { agentName: true, toolCalls: true, content: true }
    });

    const agentMetrics: Record<string, any> = {};
    messages.forEach((m: any) => {
      const name = m.agentName || 'System';
      if (!agentMetrics[name]) {
        agentMetrics[name] = { total_messages: 0, total_handoffs: 0, total_tool_calls: 0, average_response_time: 1.5 };
      }
      agentMetrics[name].total_messages++;
      if (m.toolCalls && Array.isArray(m.toolCalls)) {
        agentMetrics[name].total_tool_calls += m.toolCalls.length;
      }
      if (m.content && m.content.includes("handoff_to_agent")) {
        agentMetrics[name].total_handoffs++;
      }
    });

    const mockAgents: any[] = [];
    
    swarms.forEach(swarm => {
      const swarmAgents = (Array.isArray(swarm.agents) ? swarm.agents : []) as string[];
      swarmAgents.forEach((agentName) => {
        mockAgents.push({
          name: agentName,
          type: "specialist",
          swarm: swarm.name,
          description: `Specialist in ${swarm.name}`,
          status: {
            name: agentName,
            status: "idle",
            last_action: null,
            last_action_time: null,
            memory_summary: {},
            tool_states: {}
          },
          metrics: agentMetrics[agentName] || { total_messages: 0, total_handoffs: 0, total_tool_calls: 0, average_response_time: 0 }
        });
      });
    });

    return NextResponse.json({ agents: mockAgents });
  } catch (error: any) {
    return NextResponse.json({ agents: [], error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { messages, conversationId } = await req.json();
    
    // Core API for streaming the graph execution
    // LangGraph setup will be wired here
    
    return NextResponse.json({ success: true, status: "Graph orchestration ready" });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

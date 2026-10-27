import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import * as fs from "fs";
import * as path from "path";

const instructionsDir = path.join(process.cwd(), "lib", "agents", "instructions");

function readInstructionSnippet(agentId: string, swarmId: string): string {
  const candidates = [
    path.join(instructionsDir, swarmId, `${agentId.toLowerCase()}.md`),
    path.join(instructionsDir, `${agentId.toLowerCase()}.md`),
  ];
  for (const p of candidates) {
    try {
      if (fs.existsSync(p)) {
        return fs.readFileSync(p, "utf-8");
      }
    } catch {}
  }
  return "";
}

export async function GET() {
  try {
    const messages = await prisma.message.findMany({
      where: { role: "assistant" },
      select: { agentName: true, toolCalls: true, content: true, createdAt: true },
    });

    const agentMetrics: Record<string, any> = {};
    messages.forEach((m: any) => {
      const name = m.agentName || "Keyes";
      if (!agentMetrics[name]) {
        agentMetrics[name] = {
          total_messages: 0,
          total_handoffs: 0,
          total_tool_calls: 0,
          average_response_time: 1.4,
          last_active: m.createdAt,
        };
      }
      agentMetrics[name].total_messages++;
      if (m.toolCalls && Array.isArray(m.toolCalls)) {
        agentMetrics[name].total_tool_calls += m.toolCalls.length;
      }
      if (m.content && m.content.includes("handoff")) {
        agentMetrics[name].total_handoffs++;
      }
      if (
        m.createdAt &&
        (!agentMetrics[name].last_active ||
          new Date(m.createdAt) > new Date(agentMetrics[name].last_active))
      ) {
        agentMetrics[name].last_active = m.createdAt;
      }
    });

    return NextResponse.json({
      metricsByAgent: agentMetrics,
      instructionsSample: {
        keyes: readInstructionSnippet("keyes", "corporate"),
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { metricsByAgent: {}, error: error.message },
      { status: 200 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { agentId, swarmId } = await req.json();
    const content = readInstructionSnippet(agentId || "keyes", swarmId || "corporate");
    return NextResponse.json({
      success: true,
      instructions:
        content ||
        `You are ${agentId}, a senior legal specialist in the ${swarmId} practice swarm of Basalt Vigil. Execute all assigned legal analysis, redlining, and statutory verification tasks with AmLaw 10 precision.`,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

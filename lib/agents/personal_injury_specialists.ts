// @ts-nocheck
import { tool } from "ai";
import { z } from "zod";
import { createAgentNode } from "./base_agent";
import * as fs from "fs/promises";
import * as path from "path";

// Mock instruction loader
async function loadInstruction(agentName: string) {
  try {
    const data = await fs.readFile(path.join(process.cwd(), "lib", "agents", "instructions", `${agentName.toLowerCase()}.md`), "utf-8");
    return data;
  } catch (e) {
    return `You are ${agentName}. Act as a helpful assistant.`;
  }
}

const commonTools = {
  handoff_to_agent: tool({
    description: "Handoff to another specialist agent",
    parameters: z.object({
      agent_name: z.string().describe("The name of the agent to hand off to"),
      next_task: z.string().describe("Instructions for the next agent")
    }),
    execute: async (args: any) => { const { agent_name, next_task } = args;
      return { status: "handoff_initiated", target: agent_name, instructions: next_task };
    }
  })
};

export async function createHouse() {
  return createAgentNode({
    name: "House",
    description: "Lead personal injury strategist and case orchestrator",
    systemMessage: await loadInstruction("House"),
    tools: commonTools,
    enableDpf: true
  });
}

export async function createGrey() {
  return createAgentNode({
    name: "Grey",
    description: "Medical records and injury analysis expert",
    systemMessage: await loadInstruction("Grey"),
    tools: commonTools,
    enableDpf: true
  });
}

export async function createWelby() {
  return createAgentNode({
    name: "Welby",
    description: "Standard of care and malpractice specialist",
    systemMessage: await loadInstruction("Welby"),
    tools: commonTools,
    enableDpf: true
  });
}

export async function createQuincy() {
  return createAgentNode({
    name: "Quincy",
    description: "Forensic analysis and causation expert",
    systemMessage: await loadInstruction("Quincy"),
    tools: commonTools,
    enableDpf: true
  });
}

export async function createTrapper() {
  return createAgentNode({
    name: "Trapper",
    description: "Damages calculation and economic loss expert",
    systemMessage: await loadInstruction("Trapper"),
    tools: commonTools,
    enableDpf: true
  });
}

export async function createKildare() {
  return createAgentNode({
    name: "Kildare",
    description: "Settlement negotiation and mediation specialist",
    systemMessage: await loadInstruction("Kildare"),
    tools: commonTools,
    enableDpf: true
  });
}

export async function createCarter() {
  return createAgentNode({
    name: "Carter",
    description: "Demand letters and pleadings specialist",
    systemMessage: await loadInstruction("Carter"),
    tools: commonTools,
    enableDpf: true
  });
}

export async function createGreene() {
  return createAgentNode({
    name: "Greene",
    description: "Integration and coordination specialist",
    systemMessage: await loadInstruction("Greene"),
    tools: commonTools,
    enableDpf: true
  });
}

export async function createKovac() {
  return createAgentNode({
    name: "Kovac",
    description: "Verdict analysis and valuation specialist",
    systemMessage: await loadInstruction("Kovac"),
    tools: commonTools,
    enableDpf: true
  });
}

export async function createPierce() {
  return createAgentNode({
    name: "Pierce",
    description: "Insurance and coverage specialist",
    systemMessage: await loadInstruction("Pierce"),
    tools: commonTools,
    enableDpf: true
  });
}

export async function createRoss() {
  return createAgentNode({
    name: "Ross",
    description: "Statute of limitations and procedure specialist",
    systemMessage: await loadInstruction("Ross"),
    tools: commonTools,
    enableDpf: true
  });
}

export async function createShepherd() {
  return createAgentNode({
    name: "Shepherd",
    description: "Discovery and depositions specialist",
    systemMessage: await loadInstruction("Shepherd"),
    tools: commonTools,
    enableDpf: true
  });
}


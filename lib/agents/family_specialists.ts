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

export async function createBennet() {
  return createAgentNode({
    name: "Bennet",
    description: "Lead family law counsel and case orchestrator",
    systemMessage: await loadInstruction("Bennet"),
    tools: commonTools,
    enableDpf: true
  });
}

export async function createEyre() {
  return createAgentNode({
    name: "Eyre",
    description: "Custody and child welfare specialist",
    systemMessage: await loadInstruction("Eyre"),
    tools: commonTools,
    enableDpf: true
  });
}

export async function createEarnshaw() {
  return createAgentNode({
    name: "Earnshaw",
    description: "Property division and asset allocation expert",
    systemMessage: await loadInstruction("Earnshaw"),
    tools: commonTools,
    enableDpf: true
  });
}

export async function createDashwood() {
  return createAgentNode({
    name: "Dashwood",
    description: "Financial analysis and support calculations",
    systemMessage: await loadInstruction("Dashwood"),
    tools: commonTools,
    enableDpf: true
  });
}

export async function createMarch() {
  return createAgentNode({
    name: "March",
    description: "Child advocate and guardian ad litem matters",
    systemMessage: await loadInstruction("March"),
    tools: commonTools,
    enableDpf: true
  });
}

export async function createRochester() {
  return createAgentNode({
    name: "Rochester",
    description: "Estate planning and trusts specialist",
    systemMessage: await loadInstruction("Rochester"),
    tools: commonTools,
    enableDpf: true
  });
}

export async function createBrandon() {
  return createAgentNode({
    name: "Brandon",
    description: "Valuation and analytics specialist",
    systemMessage: await loadInstruction("Brandon"),
    tools: commonTools,
    enableDpf: true
  });
}

export async function createDarcy() {
  return createAgentNode({
    name: "Darcy",
    description: "Prenuptial and contract specialist",
    systemMessage: await loadInstruction("Darcy"),
    tools: commonTools,
    enableDpf: true
  });
}

export async function createFerrars() {
  return createAgentNode({
    name: "Ferrars",
    description: "Discovery and disclosure specialist",
    systemMessage: await loadInstruction("Ferrars"),
    tools: commonTools,
    enableDpf: true
  });
}

export async function createKnightley() {
  return createAgentNode({
    name: "Knightley",
    description: "Procedural and jurisdictional specialist",
    systemMessage: await loadInstruction("Knightley"),
    tools: commonTools,
    enableDpf: true
  });
}

export async function createTilney() {
  return createAgentNode({
    name: "Tilney",
    description: "Integration and coordination specialist",
    systemMessage: await loadInstruction("Tilney"),
    tools: commonTools,
    enableDpf: true
  });
}

export async function createWoodhouse() {
  return createAgentNode({
    name: "Woodhouse",
    description: "Mediation and settlement specialist",
    systemMessage: await loadInstruction("Woodhouse"),
    tools: commonTools,
    enableDpf: true
  });
}


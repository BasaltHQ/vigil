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

export async function createEarp() {
  return createAgentNode({
    name: "Earp",
    description: "Lead real estate counsel and case orchestrator",
    systemMessage: await loadInstruction("Earp"),
    tools: commonTools,
    enableDpf: true
  });
}

export async function createHickok() {
  return createAgentNode({
    name: "Hickok",
    description: "Real estate transactions and closings specialist",
    systemMessage: await loadInstruction("Hickok"),
    tools: commonTools,
    enableDpf: true
  });
}

export async function createOakley() {
  return createAgentNode({
    name: "Oakley",
    description: "Title examination and insurance specialist",
    systemMessage: await loadInstruction("Oakley"),
    tools: commonTools,
    enableDpf: true
  });
}

export async function createCody() {
  return createAgentNode({
    name: "Cody",
    description: "Landlord-tenant law and lease specialist",
    systemMessage: await loadInstruction("Cody"),
    tools: commonTools,
    enableDpf: true
  });
}

export async function createCassidy() {
  return createAgentNode({
    name: "Cassidy",
    description: "Zoning, land use, and development specialist",
    systemMessage: await loadInstruction("Cassidy"),
    tools: commonTools,
    enableDpf: true
  });
}

export async function createHolliday() {
  return createAgentNode({
    name: "Holliday",
    description: "Real estate litigation and disputes",
    systemMessage: await loadInstruction("Holliday"),
    tools: commonTools,
    enableDpf: true
  });
}

export async function createYounger() {
  return createAgentNode({
    name: "Younger",
    description: "Integration and coordination specialist",
    systemMessage: await loadInstruction("Younger"),
    tools: commonTools,
    enableDpf: true
  });
}

export async function createJames() {
  return createAgentNode({
    name: "James",
    description: "Valuation and market analysis specialist",
    systemMessage: await loadInstruction("James"),
    tools: commonTools,
    enableDpf: true
  });
}

export async function createStarr() {
  return createAgentNode({
    name: "Starr",
    description: "Due diligence and inspection specialist",
    systemMessage: await loadInstruction("Starr"),
    tools: commonTools,
    enableDpf: true
  });
}

export async function createHorn() {
  return createAgentNode({
    name: "Horn",
    description: "Environmental and disclosure specialist",
    systemMessage: await loadInstruction("Horn"),
    tools: commonTools,
    enableDpf: true
  });
}

export async function createGarrett() {
  return createAgentNode({
    name: "Garrett",
    description: "Contracts and recording specialist",
    systemMessage: await loadInstruction("Garrett"),
    tools: commonTools,
    enableDpf: true
  });
}

export async function createMasterson() {
  return createAgentNode({
    name: "Masterson",
    description: "Financing and mortgage specialist",
    systemMessage: await loadInstruction("Masterson"),
    tools: commonTools,
    enableDpf: true
  });
}


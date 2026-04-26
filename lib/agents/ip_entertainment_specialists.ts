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

export async function createSelznick() {
  return createAgentNode({
    name: "Selznick",
    description: "Lead entertainment counsel and case orchestrator",
    systemMessage: await loadInstruction("Selznick"),
    tools: commonTools,
    enableDpf: true
  });
}

export async function createGoldwyn() {
  return createAgentNode({
    name: "Goldwyn",
    description: "Copyright law and infringement specialist",
    systemMessage: await loadInstruction("Goldwyn"),
    tools: commonTools,
    enableDpf: true
  });
}

export async function createMayer() {
  return createAgentNode({
    name: "Mayer",
    description: "Trademark and brand protection specialist",
    systemMessage: await loadInstruction("Mayer"),
    tools: commonTools,
    enableDpf: true
  });
}

export async function createZanuck() {
  return createAgentNode({
    name: "Zanuck",
    description: "Licensing and distribution agreements specialist",
    systemMessage: await loadInstruction("Zanuck"),
    tools: commonTools,
    enableDpf: true
  });
}

export async function createWarner() {
  return createAgentNode({
    name: "Warner",
    description: "Talent contracts and employment agreements",
    systemMessage: await loadInstruction("Warner"),
    tools: commonTools,
    enableDpf: true
  });
}

export async function createThalberg() {
  return createAgentNode({
    name: "Thalberg",
    description: "Royalties and profit participation specialist",
    systemMessage: await loadInstruction("Thalberg"),
    tools: commonTools,
    enableDpf: true
  });
}

export async function createCohn() {
  return createAgentNode({
    name: "Cohn",
    description: "Music and publishing specialist",
    systemMessage: await loadInstruction("Cohn"),
    tools: commonTools,
    enableDpf: true
  });
}

export async function createDisney() {
  return createAgentNode({
    name: "Disney",
    description: "IP portfolio and valuation specialist",
    systemMessage: await loadInstruction("Disney"),
    tools: commonTools,
    enableDpf: true
  });
}

export async function createFox() {
  return createAgentNode({
    name: "Fox",
    description: "Production deals and financing specialist",
    systemMessage: await loadInstruction("Fox"),
    tools: commonTools,
    enableDpf: true
  });
}

export async function createLaemmle() {
  return createAgentNode({
    name: "Laemmle",
    description: "Registrations and filings specialist",
    systemMessage: await loadInstruction("Laemmle"),
    tools: commonTools,
    enableDpf: true
  });
}

export async function createUniversal() {
  return createAgentNode({
    name: "Universal",
    description: "Integration and coordination specialist",
    systemMessage: await loadInstruction("Universal"),
    tools: commonTools,
    enableDpf: true
  });
}

export async function createZukor() {
  return createAgentNode({
    name: "Zukor",
    description: "Clearance and rights chain specialist",
    systemMessage: await loadInstruction("Zukor"),
    tools: commonTools,
    enableDpf: true
  });
}


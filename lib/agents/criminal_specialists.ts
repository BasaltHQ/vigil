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

export async function createHolmes() {
  return createAgentNode({
    name: "Holmes",
    description: "Lead criminal strategist and case orchestrator",
    systemMessage: await loadInstruction("Holmes"),
    tools: commonTools,
    enableDpf: true
  });
}

export async function createPoirot() {
  return createAgentNode({
    name: "Poirot",
    description: "Evidence analyst and forensic expert",
    systemMessage: await loadInstruction("Poirot"),
    tools: commonTools,
    enableDpf: true
  });
}

export async function createMarple() {
  return createAgentNode({
    name: "Marple",
    description: "Witness preparation and testimony expert",
    systemMessage: await loadInstruction("Marple"),
    tools: commonTools,
    enableDpf: true
  });
}

export async function createColumbo() {
  return createAgentNode({
    name: "Columbo",
    description: "Investigation specialist and interrogation expert",
    systemMessage: await loadInstruction("Columbo"),
    tools: commonTools,
    enableDpf: true
  });
}

export async function createPerry() {
  return createAgentNode({
    name: "Perry",
    description: "Criminal defense attorney and trial specialist",
    systemMessage: await loadInstruction("Perry"),
    tools: commonTools,
    enableDpf: true
  });
}

export async function createMcCoy() {
  return createAgentNode({
    name: "McCoy",
    description: "Prosecution strategy and plea negotiation expert",
    systemMessage: await loadInstruction("McCoy"),
    tools: commonTools,
    enableDpf: true
  });
}

export async function createWolfe() {
  return createAgentNode({
    name: "Wolfe",
    description: "Legal research and strategy specialist",
    systemMessage: await loadInstruction("Wolfe"),
    tools: commonTools,
    enableDpf: true
  });
}

export async function createChan() {
  return createAgentNode({
    name: "Chan",
    description: "Jurisdictional and compliance specialist",
    systemMessage: await loadInstruction("Chan"),
    tools: commonTools,
    enableDpf: true
  });
}

export async function createBrown() {
  return createAgentNode({
    name: "Brown",
    description: "Psychology and profiling specialist",
    systemMessage: await loadInstruction("Brown"),
    tools: commonTools,
    enableDpf: true
  });
}

export async function createArcher_Criminal() {
  return createAgentNode({
    name: "Archer_Criminal",
    description: "Integration and coordination specialist",
    systemMessage: await loadInstruction("Archer_Criminal"),
    tools: commonTools,
    enableDpf: true
  });
}

export async function createDupin() {
  return createAgentNode({
    name: "Dupin",
    description: "Logic and reasoning specialist",
    systemMessage: await loadInstruction("Dupin"),
    tools: commonTools,
    enableDpf: true
  });
}

export async function createMorse() {
  return createAgentNode({
    name: "Morse",
    description: "Procedural and documentation specialist",
    systemMessage: await loadInstruction("Morse"),
    tools: commonTools,
    enableDpf: true
  });
}


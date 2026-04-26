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

export async function createPolo() {
  return createAgentNode({
    name: "Polo",
    description: "Lead immigration strategist and case orchestrator",
    systemMessage: await loadInstruction("Polo"),
    tools: commonTools,
    enableDpf: true
  });
}

export async function createMagellan() {
  return createAgentNode({
    name: "Magellan",
    description: "Visa navigator and nonimmigrant specialist",
    systemMessage: await loadInstruction("Magellan"),
    tools: commonTools,
    enableDpf: true
  });
}

export async function createColumbus() {
  return createAgentNode({
    name: "Columbus",
    description: "Green card and permanent residency expert",
    systemMessage: await loadInstruction("Columbus"),
    tools: commonTools,
    enableDpf: true
  });
}

export async function createDarwin() {
  return createAgentNode({
    name: "Darwin",
    description: "Asylum and refugee protection specialist",
    systemMessage: await loadInstruction("Darwin"),
    tools: commonTools,
    enableDpf: true
  });
}

export async function createEarhart() {
  return createAgentNode({
    name: "Earhart",
    description: "Deportation defense and removal proceedings",
    systemMessage: await loadInstruction("Earhart"),
    tools: commonTools,
    enableDpf: true
  });
}

export async function createShackleton() {
  return createAgentNode({
    name: "Shackleton",
    description: "Immigration appeals and BIA specialist",
    systemMessage: await loadInstruction("Shackleton"),
    tools: commonTools,
    enableDpf: true
  });
}

export async function createCook() {
  return createAgentNode({
    name: "Cook",
    description: "Consular processing specialist",
    systemMessage: await loadInstruction("Cook"),
    tools: commonTools,
    enableDpf: true
  });
}

export async function createDrake() {
  return createAgentNode({
    name: "Drake",
    description: "Employment compliance specialist",
    systemMessage: await loadInstruction("Drake"),
    tools: commonTools,
    enableDpf: true
  });
}

export async function createHudson() {
  return createAgentNode({
    name: "Hudson",
    description: "Priority dates and tracking specialist",
    systemMessage: await loadInstruction("Hudson"),
    tools: commonTools,
    enableDpf: true
  });
}

export async function createLewis() {
  return createAgentNode({
    name: "Lewis",
    description: "Integration and coordination specialist",
    systemMessage: await loadInstruction("Lewis"),
    tools: commonTools,
    enableDpf: true
  });
}

export async function createLivingstone() {
  return createAgentNode({
    name: "Livingstone",
    description: "Country conditions research specialist",
    systemMessage: await loadInstruction("Livingstone"),
    tools: commonTools,
    enableDpf: true
  });
}

export async function createVespucci() {
  return createAgentNode({
    name: "Vespucci",
    description: "Forms and petitions specialist",
    systemMessage: await loadInstruction("Vespucci"),
    tools: commonTools,
    enableDpf: true
  });
}


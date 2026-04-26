// @ts-nocheck
import { tool } from "ai";
import { z } from "zod";
import { createAgentNode } from "./base_agent";
import { docWriterWord, docWriterPdf } from "../tools/document_tools";
import { dataRoomUpload } from "../tools/s3_tools";
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

// Global tools accessible by agents
const commonTools = {
  handoff_to_agent: tool({
    description: "Handoff to another specialist agent",
    parameters: z.object({
      agent_name: z.string().describe("The name of the agent to hand off to (e.g. Keyes, Bannister)"),
      next_task: z.string().describe("Instructions for the next agent")
    }),
    execute: async (args: any) => { const { agent_name, next_task } = args;
      return { status: "handoff_initiated", target: agent_name, instructions: next_task };
    }
  }),
  create_document: tool({
    description: "Create a Word document",
    parameters: z.object({
      template: z.string(),
      data: z.record(z.string(), z.any()),
      filename: z.string()
    }),
    execute: async (args: any) => { const { template, data, filename } = args;
      const result = await docWriterWord(template, data, path.join(process.cwd(), "public", "docs", filename));
      return { success: true, filePath: result.filePath };
    }
  }),
  upload_to_data_room: tool({
    description: "Upload a file to the S3 data room",
    parameters: z.object({
      file_path: z.string(),
      folder: z.string()
    }),
    execute: async (args: any) => { const { file_path, folder } = args;
      return await dataRoomUpload(file_path, folder);
    }
  }),
  lookup_brand_context: tool({
    description: "Look up the user's company brand identity and selected corporate templates from the database. Use this before drafting formal corporate documents if you need exact styling instructions.",
    parameters: z.object({}),
    execute: async (_args: any) => {
      return { 
        status: "success", 
        message: "The brand context and base template have already been injected into your system prompt. Refer to the [USER BRAND IDENTITY & CONTEXT] and [BASE DOCUMENT TEMPLATE] sections of your system prompt for exact details."
      };
    }
  })
};

export async function createKeyes() {
  return createAgentNode({
    name: "Keyes",
    description: "Chief claims manager and central orchestrator",
    systemMessage: await loadInstruction("Keyes"),
    tools: commonTools,
    enableDpf: true
  });
}

export async function createBannister() {
  return createAgentNode({
    name: "Bannister",
    description: "Securities defense attorney and strategist",
    systemMessage: await loadInstruction("Bannister"),
    tools: commonTools,
    enableDpf: true
  });
}

export async function createGittes() {
  return createAgentNode({
    name: "Gittes",
    description: "Cap table investigator and equity analyst",
    systemMessage: await loadInstruction("Gittes"),
    tools: commonTools,
    enableDpf: true
  });
}

export async function createGutman() {
  return createAgentNode({
    name: "Gutman",
    description: "Compliance overseer and risk management specialist",
    systemMessage: await loadInstruction("Gutman"),
    tools: commonTools,
    enableDpf: true
  });
}

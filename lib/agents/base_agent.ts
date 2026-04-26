import { AgentState } from "../graph/state";
import { generateText, tool } from "ai";

type CoreTool = any;
type CoreMessage = any;
import { azure } from "@ai-sdk/azure";
import { DynamicPhenomenologyFramework } from "./dpf_framework";
import { AIMessage, HumanMessage, SystemMessage, ToolMessage } from "@langchain/core/messages";

export interface AgentConfig {
  name: string;
  description: string;
  systemMessage: string;
  tools: Record<string, CoreTool>;
  enableDpf?: boolean;
}

/**
 * Converts LangChain BaseMessage to Vercel AI CoreMessage
 */
function toCoreMessages(messages: any[]): CoreMessage[] {
  return messages.map(m => {
    if (m instanceof HumanMessage || m.constructor.name === "HumanMessage") return { role: "user", content: m.content as string };
    if (m instanceof AIMessage || m.constructor.name === "AIMessage") {
      return { 
        role: "assistant", 
        content: m.content as string,
        toolCalls: m.tool_calls?.map((tc: any) => ({
          id: tc.id,
          type: "tool-call",
          toolName: tc.name,
          args: tc.args
        }))
      };
    }
    if (m instanceof SystemMessage || m.constructor.name === "SystemMessage") return { role: "system", content: m.content as string };
    if (m instanceof ToolMessage || m.constructor.name === "ToolMessage") {
      return {
        role: "tool",
        content: [{
          type: "tool-result",
          toolCallId: m.tool_call_id,
          toolName: m.name || "unknown",
          result: m.content
        }]
      };
    }
    // fallback
    return { role: "user", content: String(m.content) };
  });
}

/**
 * Creates a LangGraph Node function for an agent
 */
export function createAgentNode(config: AgentConfig) {
  const dpf = config.enableDpf ? new DynamicPhenomenologyFramework() : null;

  let enhancedSystemMessage = config.systemMessage;
  if (dpf) {
    enhancedSystemMessage += `\n\nYou are enhanced with the Dynamic Phenomenology Framework (DPF). Integrate ethical dimensions, ecological consciousness, and systems thinking into your decisions.`;
  }

  return async (state: AgentState): Promise<Partial<AgentState>> => {
    console.log(`[Agent Node] ${config.name} executing...`);

    let sysMsg = enhancedSystemMessage;
    
    // Inject RLM context if exists
    if (state.rlm_context) {
      sysMsg += `\n\n[RLM CONTEXT]\n${state.rlm_context}`;
    }

    const coreMessages = [
      { role: "system", content: sysMsg } as CoreMessage,
      ...toCoreMessages(state.messages)
    ];

    // Call Azure OpenAI via Vercel AI SDK
    // Assumes AZURE_RESOURCE_NAME and AZURE_API_KEY are set
    const response = await generateText({
      model: azure("gpt-4o"), 
      messages: coreMessages,
      tools: config.tools,
    });

    const newMessages = [];
    
    if (response.toolCalls && response.toolCalls.length > 0) {
      // The agent wants to call tools. LangGraph will route to the ToolNode.
      const aiMessage = new AIMessage({
        content: response.text || "",
        tool_calls: response.toolCalls.map((tc: any) => ({
          id: tc.toolCallId,
          name: tc.toolName,
          args: tc.args
        }))
      });
      newMessages.push(aiMessage);
    } else {
      // Standard text response
      newMessages.push(new AIMessage(response.text));
    }

    return {
      messages: newMessages,
      agent_name: config.name
    };
  };
}

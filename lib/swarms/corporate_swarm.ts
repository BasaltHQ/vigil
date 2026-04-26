// @ts-nocheck
import { StateGraph, END, START } from "@langchain/langgraph";
import { AgentState } from "../graph/state";
import { createKeyes, createBannister, createGittes, createGutman } from "../agents/specialists";

export async function createCorporateSwarm() {
  const workflow = new StateGraph<AgentState>({
    channels: {
      messages: {
        value: (x, y) => x.concat(y),
        default: () => [],
      },
      agent_name: {
        value: (x, y) => y || x,
        default: () => "Keyes",
      },
      conversation_id: {
        value: (x, y) => y || x,
        default: () => "default",
      },
      user_id: {
        value: (x, y) => y || x,
        default: () => "default",
      },
      active_plan: {
        value: (x, y) => ({ ...x, ...y }),
        default: () => ({}),
      },
      next_step: {
        value: (x, y) => y || x,
        default: () => "",
      },
      rlm_context: {
        value: (x, y) => y || x,
        default: () => "",
      },
      loop_count: {
        value: (x, y) => (x || 0) + (y || 0),
        default: () => 0,
      }
    }
  });

  // 1. Initialize Agent Nodes
  const keyesNode = await createKeyes();
  const bannisterNode = await createBannister();
  const gittesNode = await createGittes();
  const gutmanNode = await createGutman();

  // 2. Add Nodes
  workflow.addNode("Keyes", keyesNode);
  workflow.addNode("Bannister", bannisterNode);
  workflow.addNode("Gittes", gittesNode);
  workflow.addNode("Gutman", gutmanNode);

  // 3. Define routing logic
  function routeAgentOutput(state: AgentState) {
    const lastMessage = state.messages[state.messages.length - 1];
    
    // Check if the agent called a tool
    if (lastMessage && lastMessage.additional_kwargs?.tool_calls?.length > 0) {
      const toolCalls = lastMessage.additional_kwargs.tool_calls;
      
      // Specifically look for handoff tool
      const handoffCall = toolCalls.find((tc: any) => tc.function.name === "handoff_to_agent");
      if (handoffCall) {
        try {
          const args = JSON.parse(handoffCall.function.arguments);
          const target = args.agent_name;
          if (["Keyes", "Bannister", "Gittes", "Gutman"].includes(target)) {
            return target;
          }
        } catch (e) {
          console.error("Failed to parse handoff arguments", e);
        }
      }
      
      // Other tools would route to a 'tools' node in a full implementation.
      // For POC, we just return END if it's not a handoff.
      return END;
    }

    // Default to stop
    return END;
  }

  // 4. Add Edges
  // Start with Keyes (Orchestrator)
  workflow.addEdge(START, "Keyes");

  // Conditional edges for handoffs
  workflow.addConditionalEdges("Keyes", routeAgentOutput);
  workflow.addConditionalEdges("Bannister", routeAgentOutput);
  workflow.addConditionalEdges("Gittes", routeAgentOutput);
  workflow.addConditionalEdges("Gutman", routeAgentOutput);

  // Compile the graph
  const app = workflow.compile();

  return app;
}

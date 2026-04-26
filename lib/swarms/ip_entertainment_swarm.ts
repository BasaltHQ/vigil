// @ts-nocheck
import { StateGraph, END, START } from "@langchain/langgraph";
import { AgentState, agentStateChannels } from "../graph/state";
import { BaseMessage, HumanMessage, AIMessage, ToolMessage } from "@langchain/core/messages";
import { RunnableConfig } from "@langchain/core/runnables";
import { createSelznick, createGoldwyn, createMayer, createZanuck, createWarner, createThalberg, createCohn, createDisney, createFox, createLaemmle, createUniversal, createZukor } from "../agents/ip_entertainment_specialists";

export async function createIp_entertainmentSwarm() {
  const builder = new StateGraph({
    channels: agentStateChannels
  });

  // Initialize nodes
  const nodeSelznick = await createSelznick();
  builder.addNode("Selznick", async (state: AgentState, config?: RunnableConfig) => {
    return await nodeSelznick(state, config);
  });
  const nodeGoldwyn = await createGoldwyn();
  builder.addNode("Goldwyn", async (state: AgentState, config?: RunnableConfig) => {
    return await nodeGoldwyn(state, config);
  });
  const nodeMayer = await createMayer();
  builder.addNode("Mayer", async (state: AgentState, config?: RunnableConfig) => {
    return await nodeMayer(state, config);
  });
  const nodeZanuck = await createZanuck();
  builder.addNode("Zanuck", async (state: AgentState, config?: RunnableConfig) => {
    return await nodeZanuck(state, config);
  });
  const nodeWarner = await createWarner();
  builder.addNode("Warner", async (state: AgentState, config?: RunnableConfig) => {
    return await nodeWarner(state, config);
  });
  const nodeThalberg = await createThalberg();
  builder.addNode("Thalberg", async (state: AgentState, config?: RunnableConfig) => {
    return await nodeThalberg(state, config);
  });
  const nodeCohn = await createCohn();
  builder.addNode("Cohn", async (state: AgentState, config?: RunnableConfig) => {
    return await nodeCohn(state, config);
  });
  const nodeDisney = await createDisney();
  builder.addNode("Disney", async (state: AgentState, config?: RunnableConfig) => {
    return await nodeDisney(state, config);
  });
  const nodeFox = await createFox();
  builder.addNode("Fox", async (state: AgentState, config?: RunnableConfig) => {
    return await nodeFox(state, config);
  });
  const nodeLaemmle = await createLaemmle();
  builder.addNode("Laemmle", async (state: AgentState, config?: RunnableConfig) => {
    return await nodeLaemmle(state, config);
  });
  const nodeUniversal = await createUniversal();
  builder.addNode("Universal", async (state: AgentState, config?: RunnableConfig) => {
    return await nodeUniversal(state, config);
  });
  const nodeZukor = await createZukor();
  builder.addNode("Zukor", async (state: AgentState, config?: RunnableConfig) => {
    return await nodeZukor(state, config);
  });

  builder.addEdge(START, "Selznick");

  function routeAfterAgent(state: AgentState): string {
    const messages = state.messages;
    const lastMessage = messages[messages.length - 1];

    if (lastMessage && "tool_calls" in lastMessage && Array.isArray(lastMessage.tool_calls)) {
      for (const tc of lastMessage.tool_calls) {
        if (tc.name === "handoff_to_agent") {
          return tc.args.agent_name as string;
        }
      }
    }
    return END;
  }
  builder.addConditionalEdges("Selznick", routeAfterAgent);
  builder.addConditionalEdges("Goldwyn", routeAfterAgent);
  builder.addConditionalEdges("Mayer", routeAfterAgent);
  builder.addConditionalEdges("Zanuck", routeAfterAgent);
  builder.addConditionalEdges("Warner", routeAfterAgent);
  builder.addConditionalEdges("Thalberg", routeAfterAgent);
  builder.addConditionalEdges("Cohn", routeAfterAgent);
  builder.addConditionalEdges("Disney", routeAfterAgent);
  builder.addConditionalEdges("Fox", routeAfterAgent);
  builder.addConditionalEdges("Laemmle", routeAfterAgent);
  builder.addConditionalEdges("Universal", routeAfterAgent);
  builder.addConditionalEdges("Zukor", routeAfterAgent);

  return builder.compile();
}

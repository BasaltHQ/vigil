// @ts-nocheck
import { StateGraph, END, START } from "@langchain/langgraph";
import { AgentState, agentStateChannels } from "../graph/state";
import { BaseMessage, HumanMessage, AIMessage, ToolMessage } from "@langchain/core/messages";
import { RunnableConfig } from "@langchain/core/runnables";
import { createPolo, createMagellan, createColumbus, createDarwin, createEarhart, createShackleton, createCook, createDrake, createHudson, createLewis, createLivingstone, createVespucci } from "../agents/immigration_specialists";

export async function createImmigrationSwarm() {
  const builder = new StateGraph({
    channels: agentStateChannels
  });

  // Initialize nodes
  const nodePolo = await createPolo();
  builder.addNode("Polo", async (state: AgentState, config?: RunnableConfig) => {
    return await nodePolo(state, config);
  });
  const nodeMagellan = await createMagellan();
  builder.addNode("Magellan", async (state: AgentState, config?: RunnableConfig) => {
    return await nodeMagellan(state, config);
  });
  const nodeColumbus = await createColumbus();
  builder.addNode("Columbus", async (state: AgentState, config?: RunnableConfig) => {
    return await nodeColumbus(state, config);
  });
  const nodeDarwin = await createDarwin();
  builder.addNode("Darwin", async (state: AgentState, config?: RunnableConfig) => {
    return await nodeDarwin(state, config);
  });
  const nodeEarhart = await createEarhart();
  builder.addNode("Earhart", async (state: AgentState, config?: RunnableConfig) => {
    return await nodeEarhart(state, config);
  });
  const nodeShackleton = await createShackleton();
  builder.addNode("Shackleton", async (state: AgentState, config?: RunnableConfig) => {
    return await nodeShackleton(state, config);
  });
  const nodeCook = await createCook();
  builder.addNode("Cook", async (state: AgentState, config?: RunnableConfig) => {
    return await nodeCook(state, config);
  });
  const nodeDrake = await createDrake();
  builder.addNode("Drake", async (state: AgentState, config?: RunnableConfig) => {
    return await nodeDrake(state, config);
  });
  const nodeHudson = await createHudson();
  builder.addNode("Hudson", async (state: AgentState, config?: RunnableConfig) => {
    return await nodeHudson(state, config);
  });
  const nodeLewis = await createLewis();
  builder.addNode("Lewis", async (state: AgentState, config?: RunnableConfig) => {
    return await nodeLewis(state, config);
  });
  const nodeLivingstone = await createLivingstone();
  builder.addNode("Livingstone", async (state: AgentState, config?: RunnableConfig) => {
    return await nodeLivingstone(state, config);
  });
  const nodeVespucci = await createVespucci();
  builder.addNode("Vespucci", async (state: AgentState, config?: RunnableConfig) => {
    return await nodeVespucci(state, config);
  });

  builder.addEdge(START, "Polo");

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
  builder.addConditionalEdges("Polo", routeAfterAgent);
  builder.addConditionalEdges("Magellan", routeAfterAgent);
  builder.addConditionalEdges("Columbus", routeAfterAgent);
  builder.addConditionalEdges("Darwin", routeAfterAgent);
  builder.addConditionalEdges("Earhart", routeAfterAgent);
  builder.addConditionalEdges("Shackleton", routeAfterAgent);
  builder.addConditionalEdges("Cook", routeAfterAgent);
  builder.addConditionalEdges("Drake", routeAfterAgent);
  builder.addConditionalEdges("Hudson", routeAfterAgent);
  builder.addConditionalEdges("Lewis", routeAfterAgent);
  builder.addConditionalEdges("Livingstone", routeAfterAgent);
  builder.addConditionalEdges("Vespucci", routeAfterAgent);

  return builder.compile();
}

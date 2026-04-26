// @ts-nocheck
import { StateGraph, END, START } from "@langchain/langgraph";
import { AgentState, agentStateChannels } from "../graph/state";
import { BaseMessage, HumanMessage, AIMessage, ToolMessage } from "@langchain/core/messages";
import { RunnableConfig } from "@langchain/core/runnables";
import { createEarp, createHickok, createOakley, createCody, createCassidy, createHolliday, createYounger, createJames, createStarr, createHorn, createGarrett, createMasterson } from "../agents/real_estate_specialists";

export async function createReal_estateSwarm() {
  const builder = new StateGraph({
    channels: agentStateChannels
  });

  // Initialize nodes
  const nodeEarp = await createEarp();
  builder.addNode("Earp", async (state: AgentState, config?: RunnableConfig) => {
    return await nodeEarp(state, config);
  });
  const nodeHickok = await createHickok();
  builder.addNode("Hickok", async (state: AgentState, config?: RunnableConfig) => {
    return await nodeHickok(state, config);
  });
  const nodeOakley = await createOakley();
  builder.addNode("Oakley", async (state: AgentState, config?: RunnableConfig) => {
    return await nodeOakley(state, config);
  });
  const nodeCody = await createCody();
  builder.addNode("Cody", async (state: AgentState, config?: RunnableConfig) => {
    return await nodeCody(state, config);
  });
  const nodeCassidy = await createCassidy();
  builder.addNode("Cassidy", async (state: AgentState, config?: RunnableConfig) => {
    return await nodeCassidy(state, config);
  });
  const nodeHolliday = await createHolliday();
  builder.addNode("Holliday", async (state: AgentState, config?: RunnableConfig) => {
    return await nodeHolliday(state, config);
  });
  const nodeYounger = await createYounger();
  builder.addNode("Younger", async (state: AgentState, config?: RunnableConfig) => {
    return await nodeYounger(state, config);
  });
  const nodeJames = await createJames();
  builder.addNode("James", async (state: AgentState, config?: RunnableConfig) => {
    return await nodeJames(state, config);
  });
  const nodeStarr = await createStarr();
  builder.addNode("Starr", async (state: AgentState, config?: RunnableConfig) => {
    return await nodeStarr(state, config);
  });
  const nodeHorn = await createHorn();
  builder.addNode("Horn", async (state: AgentState, config?: RunnableConfig) => {
    return await nodeHorn(state, config);
  });
  const nodeGarrett = await createGarrett();
  builder.addNode("Garrett", async (state: AgentState, config?: RunnableConfig) => {
    return await nodeGarrett(state, config);
  });
  const nodeMasterson = await createMasterson();
  builder.addNode("Masterson", async (state: AgentState, config?: RunnableConfig) => {
    return await nodeMasterson(state, config);
  });

  builder.addEdge(START, "Earp");

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
  builder.addConditionalEdges("Earp", routeAfterAgent);
  builder.addConditionalEdges("Hickok", routeAfterAgent);
  builder.addConditionalEdges("Oakley", routeAfterAgent);
  builder.addConditionalEdges("Cody", routeAfterAgent);
  builder.addConditionalEdges("Cassidy", routeAfterAgent);
  builder.addConditionalEdges("Holliday", routeAfterAgent);
  builder.addConditionalEdges("Younger", routeAfterAgent);
  builder.addConditionalEdges("James", routeAfterAgent);
  builder.addConditionalEdges("Starr", routeAfterAgent);
  builder.addConditionalEdges("Horn", routeAfterAgent);
  builder.addConditionalEdges("Garrett", routeAfterAgent);
  builder.addConditionalEdges("Masterson", routeAfterAgent);

  return builder.compile();
}

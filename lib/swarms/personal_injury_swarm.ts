// @ts-nocheck
import { StateGraph, END, START } from "@langchain/langgraph";
import { AgentState, agentStateChannels } from "../graph/state";
import { BaseMessage, HumanMessage, AIMessage, ToolMessage } from "@langchain/core/messages";
import { RunnableConfig } from "@langchain/core/runnables";
import { createHouse, createGrey, createWelby, createQuincy, createTrapper, createKildare, createCarter, createGreene, createKovac, createPierce, createRoss, createShepherd } from "../agents/personal_injury_specialists";

export async function createPersonal_injurySwarm() {
  const builder = new StateGraph({
    channels: agentStateChannels
  });

  // Initialize nodes
  const nodeHouse = await createHouse();
  builder.addNode("House", async (state: AgentState, config?: RunnableConfig) => {
    return await nodeHouse(state, config);
  });
  const nodeGrey = await createGrey();
  builder.addNode("Grey", async (state: AgentState, config?: RunnableConfig) => {
    return await nodeGrey(state, config);
  });
  const nodeWelby = await createWelby();
  builder.addNode("Welby", async (state: AgentState, config?: RunnableConfig) => {
    return await nodeWelby(state, config);
  });
  const nodeQuincy = await createQuincy();
  builder.addNode("Quincy", async (state: AgentState, config?: RunnableConfig) => {
    return await nodeQuincy(state, config);
  });
  const nodeTrapper = await createTrapper();
  builder.addNode("Trapper", async (state: AgentState, config?: RunnableConfig) => {
    return await nodeTrapper(state, config);
  });
  const nodeKildare = await createKildare();
  builder.addNode("Kildare", async (state: AgentState, config?: RunnableConfig) => {
    return await nodeKildare(state, config);
  });
  const nodeCarter = await createCarter();
  builder.addNode("Carter", async (state: AgentState, config?: RunnableConfig) => {
    return await nodeCarter(state, config);
  });
  const nodeGreene = await createGreene();
  builder.addNode("Greene", async (state: AgentState, config?: RunnableConfig) => {
    return await nodeGreene(state, config);
  });
  const nodeKovac = await createKovac();
  builder.addNode("Kovac", async (state: AgentState, config?: RunnableConfig) => {
    return await nodeKovac(state, config);
  });
  const nodePierce = await createPierce();
  builder.addNode("Pierce", async (state: AgentState, config?: RunnableConfig) => {
    return await nodePierce(state, config);
  });
  const nodeRoss = await createRoss();
  builder.addNode("Ross", async (state: AgentState, config?: RunnableConfig) => {
    return await nodeRoss(state, config);
  });
  const nodeShepherd = await createShepherd();
  builder.addNode("Shepherd", async (state: AgentState, config?: RunnableConfig) => {
    return await nodeShepherd(state, config);
  });

  builder.addEdge(START, "House");

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
  builder.addConditionalEdges("House", routeAfterAgent);
  builder.addConditionalEdges("Grey", routeAfterAgent);
  builder.addConditionalEdges("Welby", routeAfterAgent);
  builder.addConditionalEdges("Quincy", routeAfterAgent);
  builder.addConditionalEdges("Trapper", routeAfterAgent);
  builder.addConditionalEdges("Kildare", routeAfterAgent);
  builder.addConditionalEdges("Carter", routeAfterAgent);
  builder.addConditionalEdges("Greene", routeAfterAgent);
  builder.addConditionalEdges("Kovac", routeAfterAgent);
  builder.addConditionalEdges("Pierce", routeAfterAgent);
  builder.addConditionalEdges("Ross", routeAfterAgent);
  builder.addConditionalEdges("Shepherd", routeAfterAgent);

  return builder.compile();
}

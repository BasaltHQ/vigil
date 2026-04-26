// @ts-nocheck
import { StateGraph, END, START } from "@langchain/langgraph";
import { AgentState, agentStateChannels } from "../graph/state";
import { BaseMessage, HumanMessage, AIMessage, ToolMessage } from "@langchain/core/messages";
import { RunnableConfig } from "@langchain/core/runnables";
import { createBennet, createEyre, createEarnshaw, createDashwood, createMarch, createRochester, createBrandon, createDarcy, createFerrars, createKnightley, createTilney, createWoodhouse } from "../agents/family_specialists";

export async function createFamilySwarm() {
  const builder = new StateGraph({
    channels: agentStateChannels
  });

  // Initialize nodes
  const nodeBennet = await createBennet();
  builder.addNode("Bennet", async (state: AgentState, config?: RunnableConfig) => {
    return await nodeBennet(state, config);
  });
  const nodeEyre = await createEyre();
  builder.addNode("Eyre", async (state: AgentState, config?: RunnableConfig) => {
    return await nodeEyre(state, config);
  });
  const nodeEarnshaw = await createEarnshaw();
  builder.addNode("Earnshaw", async (state: AgentState, config?: RunnableConfig) => {
    return await nodeEarnshaw(state, config);
  });
  const nodeDashwood = await createDashwood();
  builder.addNode("Dashwood", async (state: AgentState, config?: RunnableConfig) => {
    return await nodeDashwood(state, config);
  });
  const nodeMarch = await createMarch();
  builder.addNode("March", async (state: AgentState, config?: RunnableConfig) => {
    return await nodeMarch(state, config);
  });
  const nodeRochester = await createRochester();
  builder.addNode("Rochester", async (state: AgentState, config?: RunnableConfig) => {
    return await nodeRochester(state, config);
  });
  const nodeBrandon = await createBrandon();
  builder.addNode("Brandon", async (state: AgentState, config?: RunnableConfig) => {
    return await nodeBrandon(state, config);
  });
  const nodeDarcy = await createDarcy();
  builder.addNode("Darcy", async (state: AgentState, config?: RunnableConfig) => {
    return await nodeDarcy(state, config);
  });
  const nodeFerrars = await createFerrars();
  builder.addNode("Ferrars", async (state: AgentState, config?: RunnableConfig) => {
    return await nodeFerrars(state, config);
  });
  const nodeKnightley = await createKnightley();
  builder.addNode("Knightley", async (state: AgentState, config?: RunnableConfig) => {
    return await nodeKnightley(state, config);
  });
  const nodeTilney = await createTilney();
  builder.addNode("Tilney", async (state: AgentState, config?: RunnableConfig) => {
    return await nodeTilney(state, config);
  });
  const nodeWoodhouse = await createWoodhouse();
  builder.addNode("Woodhouse", async (state: AgentState, config?: RunnableConfig) => {
    return await nodeWoodhouse(state, config);
  });

  builder.addEdge(START, "Bennet");

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
  builder.addConditionalEdges("Bennet", routeAfterAgent);
  builder.addConditionalEdges("Eyre", routeAfterAgent);
  builder.addConditionalEdges("Earnshaw", routeAfterAgent);
  builder.addConditionalEdges("Dashwood", routeAfterAgent);
  builder.addConditionalEdges("March", routeAfterAgent);
  builder.addConditionalEdges("Rochester", routeAfterAgent);
  builder.addConditionalEdges("Brandon", routeAfterAgent);
  builder.addConditionalEdges("Darcy", routeAfterAgent);
  builder.addConditionalEdges("Ferrars", routeAfterAgent);
  builder.addConditionalEdges("Knightley", routeAfterAgent);
  builder.addConditionalEdges("Tilney", routeAfterAgent);
  builder.addConditionalEdges("Woodhouse", routeAfterAgent);

  return builder.compile();
}

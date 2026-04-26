// @ts-nocheck
import { StateGraph, END, START } from "@langchain/langgraph";
import { AgentState, agentStateChannels } from "../graph/state";
import { BaseMessage, HumanMessage, AIMessage, ToolMessage } from "@langchain/core/messages";
import { RunnableConfig } from "@langchain/core/runnables";
import { createHolmes, createPoirot, createMarple, createColumbo, createPerry, createMcCoy, createWolfe, createChan, createBrown, createArcher_Criminal, createDupin, createMorse } from "../agents/criminal_specialists";

export async function createCriminalSwarm() {
  const builder = new StateGraph({
    channels: agentStateChannels
  });

  // Initialize nodes
  const nodeHolmes = await createHolmes();
  builder.addNode("Holmes", async (state: AgentState, config?: RunnableConfig) => {
    return await nodeHolmes(state, config);
  });
  const nodePoirot = await createPoirot();
  builder.addNode("Poirot", async (state: AgentState, config?: RunnableConfig) => {
    return await nodePoirot(state, config);
  });
  const nodeMarple = await createMarple();
  builder.addNode("Marple", async (state: AgentState, config?: RunnableConfig) => {
    return await nodeMarple(state, config);
  });
  const nodeColumbo = await createColumbo();
  builder.addNode("Columbo", async (state: AgentState, config?: RunnableConfig) => {
    return await nodeColumbo(state, config);
  });
  const nodePerry = await createPerry();
  builder.addNode("Perry", async (state: AgentState, config?: RunnableConfig) => {
    return await nodePerry(state, config);
  });
  const nodeMcCoy = await createMcCoy();
  builder.addNode("McCoy", async (state: AgentState, config?: RunnableConfig) => {
    return await nodeMcCoy(state, config);
  });
  const nodeWolfe = await createWolfe();
  builder.addNode("Wolfe", async (state: AgentState, config?: RunnableConfig) => {
    return await nodeWolfe(state, config);
  });
  const nodeChan = await createChan();
  builder.addNode("Chan", async (state: AgentState, config?: RunnableConfig) => {
    return await nodeChan(state, config);
  });
  const nodeBrown = await createBrown();
  builder.addNode("Brown", async (state: AgentState, config?: RunnableConfig) => {
    return await nodeBrown(state, config);
  });
  const nodeArcher_Criminal = await createArcher_Criminal();
  builder.addNode("Archer_Criminal", async (state: AgentState, config?: RunnableConfig) => {
    return await nodeArcher_Criminal(state, config);
  });
  const nodeDupin = await createDupin();
  builder.addNode("Dupin", async (state: AgentState, config?: RunnableConfig) => {
    return await nodeDupin(state, config);
  });
  const nodeMorse = await createMorse();
  builder.addNode("Morse", async (state: AgentState, config?: RunnableConfig) => {
    return await nodeMorse(state, config);
  });

  builder.addEdge(START, "Holmes");

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
  builder.addConditionalEdges("Holmes", routeAfterAgent);
  builder.addConditionalEdges("Poirot", routeAfterAgent);
  builder.addConditionalEdges("Marple", routeAfterAgent);
  builder.addConditionalEdges("Columbo", routeAfterAgent);
  builder.addConditionalEdges("Perry", routeAfterAgent);
  builder.addConditionalEdges("McCoy", routeAfterAgent);
  builder.addConditionalEdges("Wolfe", routeAfterAgent);
  builder.addConditionalEdges("Chan", routeAfterAgent);
  builder.addConditionalEdges("Brown", routeAfterAgent);
  builder.addConditionalEdges("Archer_Criminal", routeAfterAgent);
  builder.addConditionalEdges("Dupin", routeAfterAgent);
  builder.addConditionalEdges("Morse", routeAfterAgent);

  return builder.compile();
}

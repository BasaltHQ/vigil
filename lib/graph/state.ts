import { BaseMessage } from "@langchain/core/messages";

export interface AgentState {
  messages: BaseMessage[];
  agent_name: string;
  conversation_id: string;
  user_id: string;
  active_plan: Record<string, any>;
  next_step: string;
  rlm_context: string;
  loop_count: number;
}

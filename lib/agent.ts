import { ToolLoopAgent, stepCountIs } from "ai";

export const agent = new ToolLoopAgent({
  model: process.env.AI_MODEL ?? "openai/gpt-5.3-codex",
  instructions: "You are a helpful assistant.",
  stopWhen: stepCountIs(10),
});

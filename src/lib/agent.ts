import { Sandbox } from "@vercel/sandbox";
import { createBashTool } from "bash-tool";
import { stepCountIs, ToolLoopAgent } from "ai";

export async function runAgentPrompt(prompt: string): Promise<string> {
  const sandbox = await Sandbox.create();

  try {
    const { bash } = await createBashTool({
      sandbox,
      destination: "/workspace",
    });

    const agent = new ToolLoopAgent({
      model: process.env.AI_MODEL ?? "openai/gpt-5.3-codex",
      instructions: "You are a helpful assistant.",
      tools: {
        bash,
      },
      stopWhen: stepCountIs(10),
    });

    const result = await agent.generate({ prompt });
    return result.text;
  } finally {
    await sandbox.stop();
  }
}

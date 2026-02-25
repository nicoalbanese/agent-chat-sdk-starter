import { Sandbox } from "@vercel/sandbox";
import { createBashTool } from "bash-tool";
import { stepCountIs, ToolLoopAgent } from "ai";

interface RunAgentPromptInput {
  prompt: string;
  sandboxId?: string;
}

interface RunAgentPromptResult {
  text: string;
  sandboxId: string;
}

async function getOrCreateSandbox(existingSandboxId?: string) {
  if (existingSandboxId) {
    try {
      const sandbox = await Sandbox.get({ sandboxId: existingSandboxId });
      return { sandbox, sandboxId: existingSandboxId };
    } catch {
      // Sandbox could have expired or been deleted; fall back to creating a new one.
    }
  }

  const sandbox = await Sandbox.create();
  return { sandbox, sandboxId: sandbox.sandboxId };
}

export async function runAgentPrompt({
  prompt,
  sandboxId,
}: RunAgentPromptInput): Promise<RunAgentPromptResult> {
  const { sandbox, sandboxId: activeSandboxId } =
    await getOrCreateSandbox(sandboxId);

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

  return {
    text: result.text,
    sandboxId: activeSandboxId,
  };
}

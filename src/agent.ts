import { ToolLoopAgent, stepCountIs } from "ai";
import {
  createBashTool,
  experimental_createSkillTool as createSkillTool,
} from "bash-tool";
import { Sandbox } from "@vercel/sandbox";

export async function runAgentPrompt(prompt: string): Promise<string> {
  const skillsDirectory = ".agents/skills";

  let skillToolkit: Awaited<ReturnType<typeof createSkillTool>> | null = null;

  try {
    skillToolkit = await createSkillTool({ skillsDirectory });
  } catch (error) {
    if (
      error instanceof Error &&
      !/ENOENT|not found|no such file or directory/i.test(error.message)
    ) {
      throw error;
    }
  }

  const sandbox = await Sandbox.create();

  try {
    const { tools } = await createBashTool({
      sandbox,
      destination: "/workspace",
      files: {
        ...(skillToolkit?.files ?? {}),
        "README.md": "Sandbox workspace available to the agent.",
      },
      extraInstructions: skillToolkit?.instructions,
    });

    const agent = new ToolLoopAgent({
      model: process.env.AI_MODEL ?? "openai/gpt-4o-mini",
      instructions:
        "You are a coding assistant. Use available tools to inspect files and run safe shell commands before answering.",
      tools: {
        ...(skillToolkit ? { skill: skillToolkit.skill } : {}),
        ...tools,
      },
      stopWhen: stepCountIs(12),
    });

    const result = await agent.generate({ prompt });
    return result.text;
  } finally {
    await sandbox.stop();
  }
}

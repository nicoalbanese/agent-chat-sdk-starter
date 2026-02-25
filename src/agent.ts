import { existsSync } from "node:fs";
import { ToolLoopAgent, stepCountIs } from "ai";
import {
  createBashTool,
  experimental_createSkillTool as createSkillTool,
} from "bash-tool";
import { Bash } from "just-bash";

export async function runAgentPrompt(prompt: string): Promise<string> {
  const skillsDirectory = ".agents/skills";

  const skillToolkit = existsSync(skillsDirectory)
    ? await createSkillTool({ skillsDirectory })
    : null;

  const sandbox = new Bash({ cwd: "/workspace" });
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
}

import { runAgentPrompt } from "./agent";

const prompt = Bun.argv.slice(2).join(" ").trim();

if (!prompt) {
  console.log("Usage: bun run src/index.ts \"<your prompt>\"");
  console.log(
    "Example: bun run src/index.ts \"List files and summarize the project\"",
  );
  process.exit(0);
}

const response = await runAgentPrompt(prompt);
console.log(response);

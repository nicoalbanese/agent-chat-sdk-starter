import { convertToModelMessages, type UIMessage } from "ai";
import { agent } from "@/lib/agent";

export async function POST(request: Request) {
  const { messages } = (await request.json()) as { messages: UIMessage[] };

  const stream = await agent.stream({
    messages: await convertToModelMessages(messages),
  });

  return stream.toUIMessageStreamResponse();
}

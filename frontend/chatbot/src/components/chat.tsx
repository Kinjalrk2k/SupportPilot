import { useRef, useMemo, useState } from "react";
import {
  useLocalRuntime,
  AssistantRuntimeProvider,
  type ChatModelAdapter,
} from "@assistant-ui/react";
import { Thread } from "@/components/assistant-ui/thread";
import { TooltipProvider } from "@radix-ui/react-tooltip";

export default function Chat() {
  // 1. Manage the conversation ID locally
  const [conversationId, setConversationId] = useState<string | null>(null);

  // We use a ref inside the useMemo so the adapter always sees the latest ID
  // without triggering a re-render/re-creation of the adapter itself.
  const convIdRef = useRef(conversationId);
  convIdRef.current = conversationId;

  const modelAdapter = useMemo<ChatModelAdapter>(
    () => ({
      async *run({ messages, abortSignal }) {
        // 2. Extract ONLY the text from the very last user message
        const lastMessage = messages.at(-1);
        const userText =
          lastMessage?.content?.find((p) => p.type === "text")?.text || "";

        if (!userText) {
          yield { content: [{ type: "text", text: "" }] };
          return;
        }

        try {
          // 3. Call your exact unmodified backend
          const response = await fetch("http://localhost:8000/chat/stream", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            // Format exactly as your ChatRequest schema dictates
            body: JSON.stringify({
              conversation_id: convIdRef.current,
              message: userText,
            }),
            signal: abortSignal,
          });

          if (!response.ok) {
            throw new Error(`Failed to fetch: ${response.status}`);
          }

          // 4. Capture the ID from your custom header and save it for next time
          const newConvId = response.headers.get("X-Conversation-Id");
          if (newConvId && !convIdRef.current) {
            setConversationId(newConvId);
          }

          // 5. Read the plain text stream chunk by chunk
          const reader = response.body?.getReader();
          const decoder = new TextDecoder();
          if (!reader) return;

          let accumulatedText = "";

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            // Decode the byte chunk into text and append it
            accumulatedText += decoder.decode(value, { stream: true });

            // Yield the text back to assistant-ui so it types out on the screen
            yield { content: [{ type: "text", text: accumulatedText }] };
          }
        } catch (error: any) {
          if (error.name !== "AbortError") {
            console.error("Stream error:", error);
            yield {
              content: [{ type: "text", text: "Error fetching response." }],
            };
          }
        }
      },
    }),
    [],
  ); // Empty dependency array keeps the adapter stable

  const runtime = useLocalRuntime(modelAdapter);

  return (
    <TooltipProvider>
      <div className="h-screen w-full">
        <AssistantRuntimeProvider runtime={runtime}>
          <Thread />
        </AssistantRuntimeProvider>
      </div>
    </TooltipProvider>
  );
}

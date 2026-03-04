import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Container,
  ContentLayout,
  Header,
  Link,
  SpaceBetween,
  TextContent,
} from "@cloudscape-design/components";
import { setPageLayout } from "../../app/redux/layoutSlice";
import PromptInput from "@cloudscape-design/components/prompt-input";
import { getTicketMessages, getTicket } from "../../app/api/tickets";
import type { RootState } from "../../app/redux/store";
import ChatMessageList, { type ChatMessage } from "./ChatMessageList";
import { Avatar } from "@cloudscape-design/chat-components";

export default function ChatPage() {
  const { ticketId } = useParams<{ ticketId: string }>();
  const dispatch = useDispatch();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isReceiving, setIsReceiving] = useState(false);
  const [isEscalatedState, setIsEscalatedState] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const role = useSelector((state: RootState) => state.auth.role);
  const wsRef = useRef<WebSocket | null>(null);
  const queryClient = useQueryClient();

  const { data: ticket } = useQuery({
    queryKey: ["ticket", ticketId],
    queryFn: () => getTicket(ticketId!),
    enabled: !!ticketId,
  });

  const { data: initialMessages } = useQuery({
    queryKey: ["ticketMessages", ticketId],
    queryFn: () => getTicketMessages(ticketId!),
    enabled: !!ticketId,
  });

  useEffect(() => {
    if (initialMessages) {
      setMessages(
        initialMessages.map(
          (msg: {
            id: string;
            role: "user" | "assistant" | "human";
            content: string;
            sent_at: string;
          }) => ({
            id: msg.id,
            role: msg.role,
            content: msg.content,
            timestamp: msg.sent_at,
          }),
        ),
      );
    }
  }, [initialMessages]);

  const isAIHandling = ticket?.status === "ai_handling" && !isEscalatedState;

  useEffect(() => {
    if (!ticketId || isAIHandling) return; // Don't connect if AI is handling

    // Determine the connection role
    const wsRole = role === "admin" ? "human" : "user";
    const wsBase = import.meta.env.VITE_WS_BASE_URL || "ws://localhost:5001/";
    const wsUrl = `${wsBase}messages/ws/${ticketId}/${wsRole}`;

    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "chat" && data.role !== "system") {
          setMessages((prev) => {
            // Check if we already have this message (e.g. from our own send)
            if (prev.some((m) => m.id === data.id)) return prev;

            return [
              ...prev,
              {
                id: data.id,
                role: data.role as "user" | "assistant" | "human",
                content: data.content,
                timestamp: data.sent_at,
              },
            ];
          });
        }
      } catch (err) {
        console.error(err);
        console.error("Failed to parse WebSocket message", err);
      }
    };

    return () => {
      ws.close();
      wsRef.current = null;
    };
  }, [ticketId, role, isAIHandling]);

  useEffect(() => {
    dispatch(
      setPageLayout({
        breadcrumbs: [
          { text: "Dashboard", href: "/" },
          { text: "Tickets", href: "/tickets" },
          { text: ticketId || "Ticket", href: `/tickets/${ticketId}` },
          { text: "Chat", href: `/chat/${ticketId}` },
        ],
        activeHref: "/tickets",
      }),
    );
  }, [dispatch, ticketId]);

  useEffect(() => {
    console.log({ messages });
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || !ticketId || !ticket) return;

    const userMessageContent = inputValue;

    // For WebSockets (human/user chat)
    if (!isAIHandling) {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(
          JSON.stringify({
            content: userMessageContent,
            sent_at: new Date().toISOString(),
          }),
        );
        setInputValue("");
      } else {
        console.error("WebSocket is not connected");
      }
      return;
    }

    // For SSE (AI handling)
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: userMessageContent,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, newMessage]);
    setInputValue("");
    setIsReceiving(true);

    // Create a scaffold for the AI response
    const aiMessageId = (Date.now() + 1).toString();
    setMessages((prev) => [
      ...prev,
      {
        id: aiMessageId,
        role: "assistant",
        content: "",
        timestamp: new Date().toISOString(),
      },
    ]);

    try {
      const aiBase =
        import.meta.env.VITE_AI_STREAM_URL || "http://localhost:5002/";
      const response = await fetch(`${aiBase}v1/chat/stream`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          thread_id: ticketId,
          order_id: ticket.order_id,
          messages: [{ role: "user", content: userMessageContent }],
        }),
      });

      if (!response.body) {
        throw new Error("No response body");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });

        // SSE lines look like: data: {"id":"chatcmpl-123","choices":[{"delta":{"content":"Hello"}}]}
        const lines = chunk.split("\n");
        for (const line of lines) {
          if (line.startsWith("data: ") && line !== "data: [DONE]") {
            try {
              const data = JSON.parse(line.slice(6));

              if (data.is_escalated) {
                setIsEscalatedState(true);
                // Invalidate ticket to fetch the new escalated status
                queryClient.invalidateQueries({
                  queryKey: ["ticket", ticketId],
                });
              }

              const deltaContent = data.choices?.[0]?.delta?.content;
              if (deltaContent) {
                setMessages((prev) => {
                  return prev.map((msg) => {
                    if (msg.id === aiMessageId) {
                      return { ...msg, content: msg.content + deltaContent };
                    }
                    return msg;
                  });
                });
              }
            } catch (e) {
              console.error("Error parsing SSE chunk", e);
            }
          }
        }
      }
    } catch (error) {
      console.error("Chat error:", error);
    } finally {
      setIsReceiving(false);
    }
  };

  const isInputDisabled = role === "admin" && isAIHandling;

  let sendingAvatar;

  switch (role) {
    case "admin":
      sendingAvatar = (
        <Avatar
          ariaLabel="Human"
          tooltipText="Human"
          iconName="suggestions"
          color="gen-ai"
        />
      );
      break;

    case "user":
      sendingAvatar = (
        <Avatar
          ariaLabel="User"
          tooltipText="User"
          iconName="user-profile-active"
        />
      );
  }

  return (
    <ContentLayout
      header={
        <Header
          variant="h1"
          description={
            <TextContent>
              Ticket <Link href={`/tickets/${ticketId}`}>{ticketId}</Link> |
              Order{" "}
              <Link href={`/orders/${ticket?.order_id}`}>
                {ticket?.order_id}
              </Link>
            </TextContent>
          }
        >
          Chat Support
        </Header>
      }
    >
      <Container
        footer={
          <div style={{ display: "flex", flexDirection: "row", width: "100%" }}>
            {sendingAvatar}
            <div style={{ flex: 1, marginLeft: "1rem" }}>
              <PromptInput
                disabled={isInputDisabled}
                value={inputValue}
                onChange={({ detail }) => setInputValue(detail.value)}
                onAction={handleSendMessage}
                actionButtonIconName="send"
                actionButtonAriaLabel="Send message"
                placeholder={
                  isInputDisabled
                    ? "AI agent is handling..."
                    : "Type your message..."
                }
                maxRows={4}
                minRows={1}
                disableActionButton={isReceiving}
              />
            </div>
          </div>
        }
      >
        <ChatMessageList
          messages={messages}
          currentRole={role}
          messagesEndRef={messagesEndRef}
        />
      </Container>
    </ContentLayout>
  );
}

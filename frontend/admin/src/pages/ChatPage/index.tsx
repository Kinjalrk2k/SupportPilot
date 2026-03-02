import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Container,
  ContentLayout,
  Header,
  SpaceBetween,
  Icon,
  Link,
  TextContent,
} from "@cloudscape-design/components";
import { setPageLayout } from "../../app/redux/layoutSlice";
import ChatBubble from "@cloudscape-design/chat-components/chat-bubble";
import PromptInput from "@cloudscape-design/components/prompt-input";
import { Avatar } from "@cloudscape-design/chat-components";
import { getTicketMessages, getTicket } from "../../app/api/tickets";
import type { RootState } from "../../app/redux/store";

interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "human";
  content: string;
  timestamp: string;
}

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
        initialMessages.map((msg) => ({
          id: msg.id,
          role: msg.role,
          content: msg.content,
          timestamp: msg.sent_at,
        })),
      );
    }
  }, [initialMessages]);

  const isAIHandling = ticket?.status === "ai_handling" && !isEscalatedState;

  useEffect(() => {
    if (!ticketId || isAIHandling) return; // Don't connect if AI is handling

    // Determine the connection role
    const wsRole = role === "admin" ? "human" : "user";
    const wsUrl = `ws://localhost:5001/messages/ws/${ticketId}/${wsRole}`;

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
    console.log({messages});
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
          })
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
      const response = await fetch("http://localhost:5002/v1/chat/stream", {
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
                queryClient.invalidateQueries({ queryKey: ["ticket", ticketId] });
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
        }
      >
        <div
          style={{
            height: "60vh",
            overflowY: "auto",
            padding: "1rem",
            paddingBottom: "0",
          }}
        >
          <SpaceBetween size="m">
            {messages.map((msg) => {
              // outgoing if the logged in user is the author
              const isOutgoing =
                msg.role === (role === "admin" ? "human" : "user");
              const type = isOutgoing ? "outgoing" : "incoming";
              let avatar;
              console.log({msg});

              switch (msg.role) {
                case "assistant":
                  avatar = (
                    <Avatar
                      color="gen-ai"
                      iconName="gen-ai"
                      ariaLabel="Assistant"
                      tooltipText="Assistant"
                    />
                  );
                  break;

                case "human":
                  avatar = (
                    <Avatar
                      ariaLabel="Human"
                      tooltipText="Human"
                      iconName="suggestions"
                    />
                  );
                  break;

                case "user":
                  avatar = (
                    <Avatar
                      ariaLabel="User"
                      tooltipText="User"
                      iconName="user-profile-active"
                    />
                  );
              }
              return (
                <ChatBubble
                  key={msg.id}
                  type={type}
                  avatar={avatar}
                  ariaLabel={`Message from ${msg.role}`}
                >
                  {msg.content}
                </ChatBubble>
              );
            })}
            <div ref={messagesEndRef} />
          </SpaceBetween>
        </div>
      </Container>
    </ContentLayout>
  );
}

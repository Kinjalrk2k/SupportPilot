import { SpaceBetween, TextContent } from "@cloudscape-design/components";
import ChatBubble from "@cloudscape-design/chat-components/chat-bubble";
import { Avatar } from "@cloudscape-design/chat-components";
import Time from "../../components/Time";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "human";
  content: string;
  timestamp: string;
}

export interface ChatMessageListProps {
  messages: ChatMessage[];
  currentRole: string; // The role of the currently logged in user ("admin" | "user")
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
}

export default function ChatMessageList({
  messages,
  currentRole,
  messagesEndRef,
}: ChatMessageListProps) {
  return (
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
            msg.role === (currentRole === "admin" ? "human" : "user");
          const type = isOutgoing ? "outgoing" : "incoming";
          let avatar;

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
                  color="gen-ai"
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
              actions={
                msg.role === "assistant" ? (
                  <TextContent>
                    <small style={{ textAlign: "right", width: "100%" }}>
                      Sent by AI assistant
                    </small>
                  </TextContent>
                ) : undefined
              }
            >
              {msg.content}
            </ChatBubble>
          );
        })}
        <div ref={messagesEndRef} />
      </SpaceBetween>
    </div>
  );
}

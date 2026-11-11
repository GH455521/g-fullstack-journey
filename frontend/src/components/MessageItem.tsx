type MessageRole = "user" | "assistant";

interface MessageItemProps {
  role: MessageRole;
  content: string;
}

function MessageItem({ role, content }: MessageItemProps) {
  const isUser = role === "user";
  return (
    <div className={`message-row ${isUser ? "user" : "assistant"}`}>
      <div className="message-avatar">{isUser ? "👤" : "🤖"}</div>
      <div className="message-content">
        <div className="message-role">{isUser ? "用户" : "助手"}</div>
        <div className="message-text">{content}</div>
      </div>
    </div>
  );
}

export default MessageItem;

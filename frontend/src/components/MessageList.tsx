import MessageItem from "./MessageItem";
type MessageRole = "user" | "assistant";

interface Messages {
  id: string;
  role: MessageRole;
  content: string;
}

function MessageList({ messages }: { messages: Messages[] }) {
  return (
    <div className="message-list">
      {messages.map((message) => (
        <MessageItem
          key={message.id}
          role={message.role}
          content={message.content}
        />
      ))}
    </div>
  );
}

export default MessageList;

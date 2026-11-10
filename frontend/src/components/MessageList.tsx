import MessageItem from "./MessageItem";

interface Messages {
  id: string;
  role: string;
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

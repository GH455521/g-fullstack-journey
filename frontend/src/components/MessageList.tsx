import MessageItem from "./MessageItem";
import type { Message } from "../types/chat.ts";

// 保留了 MessageListProps，因为它是 MessageList 组件自己的属性类型，不需要放进全局类型文件。
interface MessageListProps {
  messages: Message[];
}

function MessageList({ messages }: MessageListProps) {
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

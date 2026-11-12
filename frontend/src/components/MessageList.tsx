import MessageItem from "./MessageItem";
import type { Message } from "../types/chat.ts";
import { useEffect, useRef } from "react";

// 保留了 MessageListProps，因为它是 MessageList 组件自己的属性类型，不需要放进全局类型文件。
interface MessageListProps {
  messages: Message[];
}

function MessageList({ messages }: MessageListProps) {
  // 获取消息列表底部 DOM 元素
  /**
   * useRef 获取 DOM 元素
   * 这里创建了一个引用对象。
   * - HTMLDivElement：表示引用的是一个 div 元素。
   * - null：表示初始时还没有关联 DOM 元素。
   * - bottomRef.current：获取实际 DOM 元素。
   */
  const bottomRef = useRef<HTMLDivElement>(null);

  // 监听消息变化，自动滚动到底部
  useEffect(() => {
    /**
     * behavior: "smooth"	平滑滚动
     * block: "end"	将元素对齐到可视区域底部
     */
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [messages]);
  return (
    <div className="message-list">
      {messages.map((message) => (
        <MessageItem
          key={message.id}
          role={message.role}
          content={message.content}
        />
      ))}
      {/* 底部占位元素，用于自动滚动 */}
      {/* 这个空 div 不需要展示任何内容，它的作用是作为滚动定位目标。 */}
      {/* 当消息增加时，滚动到这个元素，就相当于滚动到了消息列表底部。 */}
      <div ref={bottomRef} />
    </div>
  );
}

export default MessageList;

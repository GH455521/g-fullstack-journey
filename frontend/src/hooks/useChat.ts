import { useCallback, useState } from "react";
import type { Message } from "../types/chat";
import { createId } from "../utils/id";
import type { ChatRequest } from "../types/api";
import { sendChatStream } from "../services/api";
import type { ChatStreamEvent } from "../types/stream";

// 实现聊天业务Hook
interface UseChatReturn {
  messages: Message[];
  conversationId: string | null;
  isLoading: boolean;
  error: string | null;
  sendMessage: (content: string) => Promise<void>;
}

export function useChat(): UseChatReturn {
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  /**
   * 为什么 error 要单独管理？
   * 因为流式请求可能有两类错误：
   * - HTTP 或网络错误：进入 catch。
   * - 后端通过 SSE 返回的 error 事件：进入 case 'error'。
   * 两种情况都需要让页面能够获取错误信息。
   */
  const [error, setError] = useState<string | null>(null);
  // useCallback: 缓存函数引用
  /**
   * useCallback 用于缓存函数，在依赖项没有变化时复用原来的函数。
   * 这里依赖：
   * - conversationId：下一次发送消息时，需要携带当前会话 ID。
   * - isLoading：避免正在请求时重复发送。
   */
  const sendMessage = useCallback(
    async (content: string): Promise<void> => {
      const trimmedContent = content.trim();
      if (!trimmedContent || isLoading) {
        return;
      }
      // 1. 创建用户消息
      const userMessage: Message = {
        id: createId(),
        role: "user",
        content: trimmedContent,
      };

      // 2. 创建空的 AI 消息，等待流式内容
      // 因为 AI 的回答不是一次性返回，而是通过多个 token 逐步返回。方便后续逐步更新消息内容。
      const assistantMessage: Message = {
        id: createId(),
        role: "assistant",
        content: "",
      };
      // prev 代表更新前的状态值（即上一次的 messages 数组）。
      // 使用扩展运算符 ... 把旧的历史消息原封不动地展开，放进新数组里。
      setMessages((prev) => [...prev, userMessage, assistantMessage]);
      setIsLoading(true);
      setError(null);

      // 3. 构建请求参数
      const requestData: ChatRequest = {
        message: trimmedContent,
        conversation_id: conversationId ?? undefined,
      };

      try {
        // 4. 发送流式请求
        await sendChatStream(requestData, (event: ChatStreamEvent) => {
          switch (event.type) {
            case "start": {
              setConversationId(event.conversation_id);
              break;
            }
            case "token": {
              // 只更新当前 AI 消息，不重复创建消息
              /**
               * 这里做了三件事：
               * 1. prev 获取最新消息列表。
               * 2. map() 遍历消息。
               * 3. 只更新 ID 匹配的 AI 消息，其他消息保持不变。
               * 这是 React 中更新数组状态的常见方式。
               */
              setMessages((prev) =>
                prev.map((message) =>
                  message.id === assistantMessage.id
                    ? { ...message, content: message.content + event.content }
                    : message,
                ),
              );
              break;
            }
            case "done": {
              setConversationId(event.conversation_id);
              break;
            }
            case "error": {
              setError(event.message);
            }
          }
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : "聊天请求失败";
        setError(message);
      } finally {
        setIsLoading(false);
      }
    },
    [conversationId, isLoading],
  );

  return {
    messages,
    conversationId,
    isLoading,
    error,
    sendMessage,
  };
}

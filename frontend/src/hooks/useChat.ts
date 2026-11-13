import { useCallback, useState } from "react";
import type { Message } from "../types/chat";
import { createId } from "../utils/id";
import type { ChatRequest } from "../types/api";
import { getConversation, sendChatStream } from "../services/api";
import type { ChatStreamEvent } from "../types/stream";

// 实现聊天业务Hook
/**
 * useChat 将支持：
 * 1. sendMessage()：发送消息，沿用当前会话。
 * 2. loadConversation()：根据会话 ID 加载历史消息。
 * 3. newConversation()：清空当前聊天，准备开始新会话。
 */
interface UseChatReturn {
  messages: Message[];
  conversationId: string | null;
  isLoading: boolean;
  error: string | null;
  sendMessage: (content: string) => Promise<void>;
  loadConversation: (conversationId: string) => Promise<void>;
  newConversation: () => void;
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
   * useCallback 的作用就是：在依赖项没有发生变化的情况下，一直返回上一次创建的那个函数，保证引用地址不变。
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
          // switch (event.type) 因为 ChatStreamEvent 是可辨识联合类型，所以 TypeScript 可以根据 event.type 自动推断当前事件的结构。
          // 例如，在 case 'token' 中，event.content 可以直接使用；在 case 'start' 中，event.conversation_id 可以直接使用。
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

  // 加载历史会话
  const loadConversation = useCallback(
    async (targetConversationId: string): Promise<void> => {
      // 正在发送或加载时，不允许切换会话
      if (isLoading) return;
      setIsLoading(true);
      setError(null);

      try {
        const response = await getConversation(targetConversationId);

        // 将后端消息转换为前端 Message 类型
        const loadedMessages: Message[] = response.messages.map((message) => ({
          id: createId(),
          role: message.role,
          content: message.content,
        }));
        setMessages(loadedMessages);
        setConversationId(targetConversationId);
      } catch (error) {
        const message = error instanceof Error ? error.message : "加载会话失败";
        setError(message);
      } finally {
        setIsLoading(false);
      }
    },
    [isLoading],
  );
  
  // 新建会话
  const newConversation = useCallback((): void => {
    // 正在发送或加载时，不允许新建会话
    if (isLoading) return
    setMessages([])
    setConversationId(null)
    setError(null)
  }, [isLoading])

  return {
    messages,
    conversationId,
    isLoading,
    error,
    sendMessage,
    loadConversation,
    newConversation,
  };
}

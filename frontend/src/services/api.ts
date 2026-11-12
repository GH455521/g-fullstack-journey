import type {
  ChatRequest,
  ChatResponse,
  ClearConversationResponse,
  ConversationResponse,
  HealthResponse,
} from "../types/api";
import type { ChatStreamEvent } from "../types/stream";

// 获取后端 API 基础地址
const API_BASE_URL = "";

/**
 * 将 SSE 中的JSON 字符串解析为具体事件
 *
 * parseStreamEvent() 不只是简单地使用 as ChatStreamEvent，它还检查了事件字段的实际类型，避免把明显不符合结构的数据当作合法事件。
 */
function parseStreamEvent(data: string): ChatStreamEvent {
  const parsed: unknown = JSON.parse(data);

  if (typeof parsed !== "object" || parsed === null) {
    throw new Error("无效的流式事件数据");
  }
  const event = parsed as Record<string, unknown>;

  switch (event.type) {
    case "start":
      if (typeof event.conversation_id !== "string") {
        throw new Error("start 事件缺少有效的 conversation_id");
      }
      return {
        type: "start",
        conversation_id: event.conversation_id,
      };

    case "token":
      if (typeof event.content !== "string") {
        throw new Error("token 事件缺少有效的 content");
      }
      return {
        type: "token",
        content: event.content,
      };

    case "done":
      if (typeof event.conversation_id !== "string") {
        throw new Error("done 事件缺少有效的 conversation_id");
      }
      return {
        type: "done",
        conversation_id: event.conversation_id,
      };

    case "error":
      if (typeof event.message !== "string") {
        throw new Error("error 事件缺少有效的 message");
      }
      return {
        type: "error",
        message: event.message,
      };

    default:
      throw new Error(`未知的流式事件类型: ${event.type}`);
  }
}

/**
 * 处理一行 SSE 数据
 *
 * parseSSELine() 只负责识别 data: 行并收集数据，不负责判断事件何时结束。
 */
function parseSSELine(line: string, dataLines: string[]): void {
  // 兼容 Windows 风格换行符
  if (line.endsWith("\r")) {
    line = line.slice(0, -1);
  }

  // 空行表示一个 SSE 事件结束
  if (line === "") {
    return;
  }

  // 忽略 SSE 注释行
  if (line.startsWith(":")) {
    return;
  }

  const colonIndex = line.indexOf(":");
  const field = colonIndex === -1 ? line : line.slice(0, colonIndex);
  let value = colonIndex === -1 ? "" : line.slice(colonIndex + 1);

  if (value.startsWith(" ")) {
    value = value.slice(1);
  }
  if (field === "data") {
    dataLines.push(value);
  }
}

// 统一处理 HTTP 请求
// 非常有用的 TypeScript 功能：泛型。
// 它允许我们将来根据不同接口，指定不同的返回数据类型，而不用为每个接口重复编写请求逻辑。
// async function request<T>(...): Promise<T>
async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  // 检查 HTTP 请求是否成功
  if (!response.ok) {
    throw new Error(`请求失败：HTTP ${response.status}`);
  }
  // 返回 JSON 响应数据
  return response.json();
}

// 检查后端 API 健康状态
export function getHealth(): Promise<HealthResponse> {
  return request<HealthResponse>("/api/health", {
    method: "GET",
  });
}

// 普通聊天请求
export function sendChat(data: ChatRequest): Promise<ChatResponse> {
  return request<ChatResponse>("/api/chat", {
    method: "POST",
    body: JSON.stringify(data),
  });
}
/**
 * @param data 聊天请求数据
 * @param onEvent 每收到一个 SSE 事件时执行的回调函数
 * - onEvent(event) 回调，这是整个封装最重要的设计。
 * - sendChatStream() 不关心页面如何显示消息，只负责：
 * - 1. 发送请求。
 * - 2. 读取数据。
 * - 3. 解析 SSE。
 * - 4. 把解析后的事件交给调用者。
 * - 以后聊天组件只需要传入一个回调，就能处理每一种事件。这就是回调函数实现业务逻辑与底层请求的解耦。
 * @param signal 可选的请求取消信号
 * response.body 是一个 ReadableStream，可以持续读取服务器发送的数据。
 * getReader() 会获得一个读取器。
 */
export async function sendChatStream(
  data: ChatRequest,
  onEvent: (event: ChatStreamEvent) => void,
  signal?: AbortSignal,
): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/chat/stream`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
    signal,
  });

  if (!response.ok) {
    throw new Error(`请求失败：HTTP ${response.status}`);
  }
  if (!response.body) {
    throw new Error("浏览器不支持读取流式响应！");
  }

  // 获取响应读取器
  const reader = response.body.getReader();

  // 将二进制数据转换为文本
  const decoder = new TextDecoder();

  // 保存尚未处理完成的数据
  let buffer = "";

  // 保存当前 SSE 事件中的 data 字段
  let dataLines: string[] = [];

  /**
   * 一个 SSE 事件结束时，解析并通知调用者
   */
  function dispatchEvent(): void {
    if (dataLines.length === 0) return;

    const data = dataLines.join("\n");
    dataLines = [];

    const event = parseStreamEvent(data);

    onEvent(event);
  }

  try {
    // try { while (true) { ... } } 在 JavaScript/TypeScript 中通常代表“无限循环 + 容错重试/持续监听”的机制。
    // 它的核心作用是：让某段逻辑持续不断地执行，即使中间发生了错误（抛出异常），也不会导致整个循环彻底崩溃，而是可以在 catch 块中处理完错误后，继续下一轮循环。
    while (true) {
      // value 当前读取到的数据块
      // done 是否已经读取结束
      const { done, value } = await reader.read();

      if (done) break; // 不断读取数据，直到服务器结束响应

      // 将当前数据块转换为文本并追加到缓存
      // 这里的 stream: true 很重要：它允许一个 UTF-8 字符被拆分在不同数据块中时，正确处理未完成的字符。
      buffer += decoder.decode(value, { stream: true });

      // 按换行符拆分
      const lines = buffer.split("\n");

      // 最后一段可能不完整，留到下一次读取
      buffer = lines.pop() ?? "";

      for (const line of lines) {
        // 空行代表当前 SSE 事件结束
        if (line === "" || line === "\r") {
          dispatchEvent();
        } else {
          parseSSELine(line, dataLines);
        }
      }
    }

    // 读取流结束后，处理 TextDecoder 中剩余的数据
    buffer += decoder.decode();

    if (buffer.length > 0) {
      if (buffer === "\r") {
        dispatchEvent();
      } else {
        parseSSELine(buffer, dataLines);
      }
    }

    //处理最后一个尚未派发的事件
    dispatchEvent();
  } catch (error) {
    console.error("流式响应处理出错:", error);
  } finally {
    // 释放读取器锁
    reader.releaseLock();
  }
}
// 获取历史会话
export function getConversation(
  conversationId: string,
): Promise<ConversationResponse> {
  return request<ConversationResponse>(
    `/api/conversations/${encodeURIComponent(conversationId)}`,
    {
      method: "GET",
    },
  );
}

// 清空会话
export function clearConversation(
  conversationId: string,
): Promise<ClearConversationResponse> {
  return request<ClearConversationResponse>(
    `/api/conversations/${encodeURIComponent(conversationId)}`,
    {
      method: "DELETE",
    },
  );
}

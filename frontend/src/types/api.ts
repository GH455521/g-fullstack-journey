// API 请求和响应类型统一管理

import type { MessageRole } from "./chat";

/**
 * POST /chat 请求参数
 */
export interface ChatRequest {
  message: string;
  conversation_id?: string | null;
}

/**
 * POST /chat 响应参数
 */
export interface ChatResponse {
  conversation_id: string;
  reply: string;
  model: string;
}

/**
 * 会话历史中的单条消息
 *
 * 后端 memory 保存的是 role 和 content
 * 不包含前端使用的 id
 */
export interface ConversationMessage {
  role: MessageRole;
  content: string;
}

/**
 * GET /conversations/{conversation_id} 响应参数
 */
export interface ConversationResponse {
  conversation_id: string;
  messages: ConversationMessage[];
  total: number;
}

/**
 * DELETE /conversations/{conversation_id} 响应参数
 */
export interface ClearConversationResponse {
  message: string;
  conversation_id: string;
}

/**
 * GET /health 响应参数
 */
export interface HealthResponse {
  status: string;
  message: string;
  model: string;
}

/**
 * 单个会话的摘要信息
 */
export interface ConversationSummary {
  conversation_id: string;
  title: string;
  total: number;
}

/**
 * 获取所有会话的响应数据
 */
export interface ConversationListResponse {
  conversations: ConversationSummary[];
  total: number;
}

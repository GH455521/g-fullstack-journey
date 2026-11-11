// 专门存放 TypeScript 类型定义
/**
 * 聊天消息角色
 * 
 * user：用户发送的信息
 * assistant：AI 助手回复的信息
 */
export type MessageRole = 'user' | 'assistant'

/**
 * 聊天消息结构
 */
export interface Message {
  // 消息唯一 ID
  id: string;
  // 消息发送者
  role: MessageRole;
  // 消息内容
  content: string;

}
// 定义流式响应类型
/**
 * 流式响应开始事件
 */
export interface StreamStartEvent {
  type: "start";
  conversation_id: string;
}

/**
 * AI 文本片段事件
 */
export interface StreamTokenEvent {
  type: "token";
  content: string;
}

/**
 * 流式响应结束事件
 */
export interface StreamDoneEvent {
  type: "done";
  conversation_id: string;
}

/**
 * 流式响应错误事件
 */
export interface StreamErrorEvent {
  type: "error";
  message: string;
}

/**
 * 所有流式事件的联合类型
 *
 * 为什么这里使用联合类型？
 * 表示一个 ChatStreamEvent 只能是这四种事件中的一种。
 *
 * const event: ChatStreamEvent = {
 *  type: 'token',
 *  content: '你好',
 * }
 * 这种根据 type 区分不同数据结构的设计，叫作可辨识联合类型（Discriminated Union）。
 */
export type ChatStreamEvent =
  | StreamStartEvent
  | StreamTokenEvent
  | StreamDoneEvent
  | StreamErrorEvent;

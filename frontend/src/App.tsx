import "./App.css";
import { useCallback, useEffect, useRef, useState } from "react";
import ChatHeader from "./components/ChatHeader.tsx";
import ChatInput from "./components/ChatInput.tsx";
import MessageList from "./components/MessageList.tsx";
import Sidebar from "./components/Sidebar.tsx";
import Welcome from "./components/Welcome.tsx";
import { useChat } from "./hooks/useChat.ts";
import type { ConversationSummary } from "./types/api.ts";
import { getAllConversations } from "./services/api.ts";

// 距离底部多少像素时，认为用户仍然处于底部附近
const BOTTOM_THRESHOLD = 100;
// localStorage 中保存当前会话 ID 的 key
const ACTIVE_CONVERSATION_KEY = "my-ai-assistant:active-conversation";

function App() {
  //获取聊天状态和发送消息的方法
  const {
    messages,
    conversationId,
    isLoading,
    error,
    sendMessage,
    loadConversation,
    newConversation,
  } = useChat();

  // 保存后端返回的会话列表
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);

  // 获取真正产生滚动条的 DOM 元素
  // 为什么使用 HTMLElement？
  // 因为我们绑定的是 section 元素，而不是 div。
  const messagesAreaRef = useRef<HTMLElement>(null);

  // 是否允许自动滚动到底部
  const [isNearBottom, setIsNearBottom] = useState(true);

  // 防止初始化逻辑重复执行
  const hasInitializedRef = useRef(false);

  // 获取全部会话
  const refreshConversations = useCallback(async (): Promise<void> => {
    try {
      const response = await getAllConversations();
      setConversations(response.conversations);
    } catch (error) {
      console.error("获取会话列表失败", error);
    }
  }, []);

  // 在组件挂载(首次加载)时获取会话列表
  useEffect(() => {
    if (hasInitializedRef.current) return;
    hasInitializedRef.current = true;

    async function initializeApp(): Promise<void> {
      try {
        // 1. 获取后端的全部会话
        const response = await getAllConversations();
        setConversations(response.conversations);

        // 2. 获取浏览器保存的上次会话 ID
        const savedConversationId = localStorage.getItem(
          ACTIVE_CONVERSATION_KEY,
        );
        if (!savedConversationId) return;

        // 3. 确认这个会话仍然存在于后端列表中
        const conversationExists = response.conversations.some(
          (conversation) =>
            conversation.conversation_id === savedConversationId,
        );
        if (!conversationExists) {
          // 会话不存在，清空无效记录
          localStorage.removeItem(ACTIVE_CONVERSATION_KEY);
          return;
        }

        // 4. 自动加载上次打开的会话
        await loadConversation(savedConversationId);
        // 恢复会话后，滚动位置从底部开始
        setIsNearBottom(true);
      } catch (error) {
        console.error("初始化应用失败：", error);
      }
    }
    void initializeApp();
  }, [loadConversation]);

  // 当前会话发生变化时，保存会话 ID
  useEffect(() => {
    if (!conversationId) return;

    localStorage.setItem(ACTIVE_CONVERSATION_KEY, conversationId);
  }, [conversationId]);

  // 判断用户距离底部的距离
  function checkIsNearBottom(): boolean {
    const element = messagesAreaRef.current;
    if (!element) return true;
    const distanceToBottom =
      element.scrollHeight - element.scrollTop - element.clientHeight;
    return distanceToBottom <= BOTTOM_THRESHOLD;
  }

  // 监听滚动事件，更新是否处于底部附近
  function handleScroll(): void {
    setIsNearBottom(checkIsNearBottom());
  }

  // 消息发生变化时，根据当前滚动状态决定是否自动滚动
  useEffect(() => {
    const element = messagesAreaRef.current;
    if (!element || !isNearBottom) return;
    element.scrollTo({ top: element.scrollHeight, behavior: "smooth" });
  }, [messages, isNearBottom]);

  // 发送消息，完成后刷新会话列表
  async function handleSendMessage(content: string): Promise<void> {
    await sendMessage(content);
    await refreshConversations();
  }

  // 新建会话
  function handleNewConversation(): void {
    // 轻触浏览器保存的上次会话
    localStorage.removeItem(ACTIVE_CONVERSATION_KEY);
    // 清空当前聊天状态
    newConversation();
    setIsNearBottom(true);
  }

  // 切换历史会话
  async function handleSelectConversation(
    targetConversationId: string,
  ): Promise<void> {
    setIsNearBottom(true);
    await loadConversation(targetConversationId);
  }

  // 点击按钮，主动回到底部
  function scrollToBottom(): void {
    const element = messagesAreaRef.current;
    if (!element) return;
    setIsNearBottom(true);
    element.scrollTo({ top: element.scrollHeight, behavior: "smooth" });
  }

  // 获取当前选中会话的标题
  const activeConversation = conversations.find(
    (conversation) => conversation.conversation_id === conversationId,
  );
  // 第一优先级：activeConversation?.title
  // 尝试获取当前激活对话（activeConversation）的 title 属性。
  // 使用 ?.（可选链）意味着：如果 activeConversation 是 null 或 undefined（比如还没加载出来），这行代码不会报错，而是直接返回 undefined。

  // 第二优先级：??（空值合并操作符）
  // 如果左边是 null 或 undefined，就执行并返回右边的值。
  // 所以，如果 activeConversation?.title 有值，就直接用它；如果没有，就进入后面的括号计算。

  // 第三优先级：(conversationId ? "当前对话" : "欢迎开始新对话")
  // 这是一个三元表达式。
  // 如果存在 conversationId（说明用户在 URL 里选了某条历史记录，或者后台正在加载这条记录，但标题还没拿到），就显示 "当前对话" 作为兜底。
  // 如果连 conversationId 都没有（说明是一个完全新建的、还没保存的对话），就显示 "欢迎开始新对话"。

  const headerTitle =
    activeConversation?.title ??
    (conversationId ? "当前会话" : "欢迎开始新对话");

  return (
    <div className="app">
      <Sidebar
        conversations={conversations}
        activeConversationId={conversationId}
        onNewConversation={handleNewConversation}
        onSelectConversation={handleSelectConversation}
      />

      <main className="chat-panel">
        <ChatHeader title={headerTitle} model="qwen2.5-coder:14b" />
        <section
          className="messages-area"
          ref={messagesAreaRef}
          onScroll={handleScroll}
        >
          {messages.length === 0 ? (
            <Welcome />
          ) : (
            <MessageList messages={messages} />
          )}

          {error && <div className="chat-error">请求失败：{error}</div>}

          {/* 用户离开底部时，显示“回到底部”按钮 */}
          {messages.length > 0 && !isNearBottom && (
            <button
              className="scroll-to-bottom-button"
              onClick={scrollToBottom}
              aria-label="回到底部"
            >
              <span>↓</span>
            </button>
          )}
        </section>
        <ChatInput onSend={handleSendMessage} disabled={isLoading} />
      </main>
    </div>
  );
}

export default App;

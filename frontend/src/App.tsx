import "./App.css";
import { useEffect, useRef, useState } from "react";
import ChatHeader from "./components/ChatHeader.tsx";
import ChatInput from "./components/ChatInput.tsx";
import MessageList from "./components/MessageList.tsx";
import Sidebar from "./components/Sidebar.tsx";
import Welcome from "./components/Welcome.tsx";
import { useChat } from "./hooks/useChat.ts";

// 距离底部多少像素时，认为用户仍然处于底部附近
const BOTTOM_THRESHOLD = 100;

function App() {
  //获取聊天状态和发送消息的方法
  const { messages, isLoading, error, sendMessage } = useChat();

  // 获取真正产生滚动条的 DOM 元素
  // 为什么使用 HTMLElement？
  // 因为我们绑定的是 section 元素，而不是 div。
  const messagesAreaRef = useRef<HTMLElement>(null);

  // 是否允许自动滚动到底部
  const [isNearBottom, setIsNearBottom] = useState(true)

  // 判断用户距离底部的距离
  function checkIsNearBottom() {
    const element = messagesAreaRef.current;
    if (!element) return true;
    const distanceToBottom = element.scrollHeight - element.scrollTop - element.clientHeight;
    return distanceToBottom <= BOTTOM_THRESHOLD;
  }

  // 监听滚动事件，更新是否处于底部附近
  function handleScroll() {
    setIsNearBottom(checkIsNearBottom());
  }

  // 消息发生变化时，根据当前滚动状态决定是否自动滚动
  useEffect(() => {
    const element = messagesAreaRef.current;
    if (!element || !isNearBottom) return;
    element.scrollTo({ top: element.scrollHeight, behavior: "smooth" });
  }, [messages, isNearBottom])

  // 点击按钮，主动回到底部
  function scrollToBottom() {
    const element = messagesAreaRef.current;
    if (!element) return;
    setIsNearBottom(true);
    element.scrollTo({ top: element.scrollHeight, behavior: "smooth" });
  }

  return (
    <div className="app">
      <Sidebar />

      <main className="chat-panel">
        <ChatHeader title="欢迎开始新对话" model="qwen2.5-coder:14b" />
        <section className="messages-area" ref={messagesAreaRef} onScroll={handleScroll}>
          {messages.length === 0 ? (
            <Welcome />
          ) : (
            <MessageList messages={messages} />
          )}

          {error && <div className="chat-error">请求失败：{error}</div>}

          {/* 用户离开底部时，显示“回到底部”按钮 */}
          {messages.length > 0 &&!isNearBottom && (
            <button className="scroll-to-bottom-button" onClick={scrollToBottom} aria-label="回到底部">
              <span>↓</span>
            </button>
          )}
        </section>
        <ChatInput onSend={sendMessage} disabled={isLoading} />
      </main>
    </div>
  );
}

export default App;

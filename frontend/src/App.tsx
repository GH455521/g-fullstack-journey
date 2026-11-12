import ChatHeader from "./components/ChatHeader.tsx";
import ChatInput from "./components/ChatInput.tsx";
import MessageList from "./components/MessageList.tsx";
import Sidebar from "./components/Sidebar.tsx";
import Welcome from "./components/Welcome.tsx";
import { useChat } from "./hooks/useChat.ts";

function App() {
  //获取聊天状态和发送消息的方法
  const { messages, isLoading, error, sendMessage } = useChat();

  return (
    <div className="app">
      <Sidebar />

      <main className="chat-panel">
        <ChatHeader title="欢迎开始新对话" model="qwen2.5-coder:14b" />
        <section className="messages-area">
          {messages.length === 0 ? (
            <Welcome />
          ) : (
            <MessageList messages={messages} />
          )}

          {error && <div className="chat-error">请求失败：{error}</div>}
        </section>
        <ChatInput onSend={sendMessage} disabled={isLoading} />
      </main>
    </div>
  );
}

export default App;

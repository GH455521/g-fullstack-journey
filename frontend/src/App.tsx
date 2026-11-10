import ChatHeader from "./components/ChatHeader.js";
import ChatInput from "./components/ChatInput.js";
import MessageList from "./components/MessageList.js";
import Sidebar from "./components/Sidebar.js";
import Welcome from "./components/Welcome.js";

interface Message {
  id: string;
  role: string;
  content: string;
}

function App() {
  // 临时模拟聊天数据
const messages: Message[] = [
  {
    id: "1",
    role: "user",
    content: "你好，请介绍一下什么是 AI Agent。",
  },
  {
    id: "2",
    role: "assistant",
    content:
      "你好！AI Agent（人工智能智能体）是一种能够感知环境、理解目标、制定计划并调用工具完成任务的 AI 系统。",
  },
];
// 接收 ChatInput 传递的消息
function handleSend(content: string) {
  console.log('收到用户消息:', content);
}
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
        </section>
        <ChatInput onSend={handleSend} />
      </main>
    </div>
  );
}

export default App;

import ChatHeader from "./components/ChatHeader.tsx";
import ChatInput from "./components/ChatInput.tsx";
import MessageList from "./components/MessageList.tsx";
import Sidebar from "./components/Sidebar.tsx";
import Welcome from "./components/Welcome.tsx";
import { sendChatStream } from "./services/api.ts";
import type { Message } from "./types/chat.ts";

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
  // void 代表“只处理逻辑、不产出结果”的函数
  async function handleSend(content: string): Promise<void> {
    console.log("收到用户消息:", content);

    try {
      await sendChatStream({ message: content }, (event) => {
        // switch (event.type) 因为 ChatStreamEvent 是可辨识联合类型，所以 TypeScript 可以根据 event.type 自动推断当前事件的结构。
        // 例如，在 case 'token' 中，event.content 可以直接使用；在 case 'start' 中，event.conversation_id 可以直接使用。
        switch (event.type) {
          case "start":
            console.log("流式响应开始", event.conversation_id);
            break;
          case "token":
            console.log("收到 token:", event.content);
            break;
          case "done":
            console.log("流式响应结束", event.conversation_id);
            break;
          case "error":
            console.error("流式响应错误:", event.message);
            break;
        }
      });
    } catch (error) {
      console.error("发送消息出错:", error);
    }
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

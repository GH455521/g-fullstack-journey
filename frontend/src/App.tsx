import ChatHeader from "./components/ChatHeader.js";
import Sidebar from "./components/Sidebar.js";
import Welcome from "./components/Welcome.js";

function App() {
  return (
    <div className="app">
      <Sidebar />

      <main className="chat-panel">
        <ChatHeader title='欢迎开始新对话' model="qwen2.5-coder:14b" />
        <section className="messages-area">
          <Welcome />
        </section>
        <footer className="input-area">
          <input type="text" placeholder="请输入信息..." />
          <button>发送</button>
        </footer>
      </main>
    </div>
  );
}

export default App;

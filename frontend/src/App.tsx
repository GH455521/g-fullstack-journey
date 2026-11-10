import Sidebar from './components/Sidebar.js'

function App() {
  return (
    <div className="app">
      <Sidebar />

      <main className="chat-panel">
        <header className="chat-header">
          <h2>新对话</h2>
        </header>
        <section className="messages-area">
          <h2>欢迎使用 My AI Assistant</h2>
          <p>这里将显示 AI 对话消息。</p>
        </section>
        <footer className="input-area">
          <input type="text" placeholder="请输入信息..." />
          <button>发送</button>
        </footer>
      </main>
    </div>
  )
}

export default App
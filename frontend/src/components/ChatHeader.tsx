function ChatHeader({ title='新对话', model='qwen2.5-coder:14b' }) {
  return (
    <header className="chat-header">
      <div className="chat-header-info">
        <h2>{title}</h2>
        <p>模型：{model}</p>
      </div>
    </header>
  )
}

export default ChatHeader
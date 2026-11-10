function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h1>My AI Assistant</h1>
      </div>
      <div className="sidebar-actions">
        <button className="new-chat-button">+ 新建对话</button>
      </div>
      <div className="conversation-list">
        <p className="sidebar-placeholder">暂无历史会话</p>
      </div>
    </aside>
  )
}

export default Sidebar
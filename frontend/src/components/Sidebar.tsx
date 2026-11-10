import ConversationItem from "./ConversationItem";

function Sidebar() {
  // 暂时使用模拟数据
  const conversations = [
    {
      id: "1",
      title: "第一次学习 Agent",
    },
    {
      id: "2",
      title: "Python 入门问题",
    },
    {
      id: "3",
      title: "React 项目开发",
    },
    {
      id: "4",
      title: "Ollama 模型配置",
    },
  ];
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h1>My AI Assistant</h1>
      </div>
      <div className="sidebar-actions">
        <button className="new-chat-button">+ 新建对话</button>
      </div>
      <div className="conversation-list">
        <p className="sidebar-placeholder">历史会话</p>
        {/* 遍历 conversations 数组。
        每遍历一条数据，就创建一个 ConversationItem。
        把当前会话的标题传给组件。
        最终显示四条历史会话。
        React 使用 key 来识别列表中的每一项。当列表发生增删或顺序变化时，可以更准确地更新页面。 */}
        {conversations.map((conversation) => (
          <ConversationItem key={conversation.id} title={conversation.title} />
        ))}
      </div>
    </aside>
  );
}

export default Sidebar;

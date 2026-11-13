import type { ConversationSummary } from "../types/api";
import ConversationItem from "./ConversationItem";

interface SidebarProps {
  conversations: ConversationSummary[];
  activeConversationId: string | null;
  onNewConversation: () => void;
  onSelectConversation: (conversationId: string) => void;
}

function Sidebar({
  conversations,
  activeConversationId,
  onNewConversation,
  onSelectConversation,
}: SidebarProps) {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h1>My AI Assistant</h1>
      </div>
      <div className="sidebar-actions">
        <button className="new-chat-button" onClick={onNewConversation}>
          + 新建对话
        </button>
      </div>
      <div className="conversation-list">
        <p className="sidebar-placeholder">历史会话</p>
        {/* 遍历 conversations 数组。
        每遍历一条数据，就创建一个 ConversationItem。
        把当前会话的标题传给组件。
        最终显示四条历史会话。
        React 使用 key 来识别列表中的每一项。当列表发生增删或顺序变化时，可以更准确地更新页面。 */}
        {conversations.length === 0 ? (
          <p className="sidebar-placeholder">暂无历史会话</p>
        ) : (
          conversations.map((conversation) => (
            <ConversationItem
              key={conversation.conversation_id}
              title={conversation.title}
              active={conversation.conversation_id === activeConversationId}
              onClick={() => {
                onSelectConversation(conversation.conversation_id);
              }}
            />
          ))
        )}
      </div>
    </aside>
  );
}

export default Sidebar;

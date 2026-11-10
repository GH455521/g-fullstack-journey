interface SidebarProps {
  title: string;
  active?: boolean;
}
function ConversationItem({ title, active = false }: SidebarProps) {
  return (
    <div className={`conversation-item ${active ? "active" : ""}`}>
      <span className="conversation-icon">💬</span>
      <span className="conversation-title">{title}</span>
    </div>
  );
}

export default ConversationItem;

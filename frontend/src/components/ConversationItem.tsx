/**
 * ConversationItem 组件的 Props 说明
 * @property {string} title - 会话标题
 * @property {boolean} [active] - 是否为当前选中会话
 * @property {() => void} onClick - 点击会话时执行的函数
 * role="button"：告诉屏幕阅读器（如盲人使用的读屏软件）“这其实是一个按钮”。
 * tabIndex={0}：允许用户通过键盘上的 Tab 键将焦点切换到这个 div 上（原生 <div> 默认是不支持 Tab 聚焦的）。
 * 键盘事件处理：
 * onKeyDown：处理键盘事件，确保在按下 Enter 或空格键时触发点击事件。
 * 因为用户可以用 Tab 键聚焦到这个元素上，所以必须支持键盘操作：
 * 判断按键：当用户按下 Enter（回车）或 Space（空格）时，触发点击逻辑。
 * event.preventDefault()：阻止浏览器的默认行为。这行代码非常重要，因为按空格键时，浏览器默认会向下滚动页面，加了这行代码就能防止页面意外滚动。
 * 执行 onClick()：模拟鼠标点击。
 * 这些属性共同作用，这是一个 <div> 而不是原生 <button>，所以必须手动赋予它按钮的语义。
 */
interface ConversationItemProps {
  title: string;
  active?: boolean;
  onClick: () => void;
}
function ConversationItem({
  title,
  active = false,
  onClick,
}: ConversationItemProps) {
  return (
    <div
      className={`conversation-item ${active ? "active" : ""}`}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onClick();
        }
      }}
    >
      <span className="conversation-icon">💬</span>
      <span className="conversation-title">{title}</span>
    </div>
  );
}

export default ConversationItem;

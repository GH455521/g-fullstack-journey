import { useState } from "react";
import type { ConversationDialogMode } from "./ConversationDialog";
import ConversationDialog from "./ConversationDialog";

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
  conversationId: string;
  title: string;
  active?: boolean;
  isPinned: boolean;
  onClick: () => void;
  onRename: (conversationId: string, title: string) => void | Promise<void>;
  onTogglePin: (
    conversationId: string,
    isPinned: boolean,
  ) => void | Promise<void>;
  onDelete: (conversationId: string) => void | Promise<void>;
}
function ConversationItem({
  conversationId,
  title,
  active = false,
  isPinned,
  onClick,
  onRename,
  onTogglePin,
  onDelete,
}: ConversationItemProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<ConversationDialogMode | null>(
    null,
  );
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  // 打开重命名弹窗
  function handleRenameClick(): void {
    setMenuOpen(false);
    setActionError(null);
    setDialogMode("rename");
  }
  // 打开删除确认弹窗
  function handleDeleteClick(): void {
    setMenuOpen(false);
    setActionError(null);
    setDialogMode("delete");
  }

  // 置顶或取消置顶
  async function handleTogglePin(): Promise<void> {
    setMenuOpen(false);
    await onTogglePin(conversationId, !isPinned);
  }

  // 统一处理弹窗确认
  async function handleDialogConfirm(value?: string): Promise<void> {
    if (busy || !dialogMode) return;

    setBusy(true);
    setActionError(null);

    try {
      if (dialogMode === "rename" && value !== undefined) {
        await onRename(conversationId, value);
      }

      if (dialogMode === "delete") {
        await onDelete(conversationId);
      }

      setDialogMode(null);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "操作失败，请稍后重试";
      setActionError(message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <div className={`conversation-item ${active ? "active" : ""}`}>
        {/* 会话标题区域 */}
        <button
          type="button"
          className="conversation-select-button"
          onClick={onClick}
          title={title}
        >
          {isPinned && (
            <span
              className="conversation-pin-icon"
              aria-label="已置顶"
              title="已置顶"
            >
              📌
            </span>
          )}

          <span className="conversation-title">{title}</span>
        </button>

        {/* 会话操作菜单 */}
        <div className="conversation-menu-container">
          <button
            type="button"
            className="conversation-menu-button"
            aria-label="会话操作"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((previous) => !previous)}
          >
            ⋯
          </button>

          {menuOpen && (
            <div className="conversation-menu">
              <button type="button" onClick={handleRenameClick}>
                重命名
              </button>
              <button type="button" onClick={() => void handleTogglePin()}>
                {isPinned ? "取消置顶" : "置顶"}
              </button>
              <button
                type="button"
                className="conversation-delete-button"
                onClick={handleDeleteClick}
              >
                删除
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 统一弹窗 */}
      {dialogMode && (
        <ConversationDialog
          mode={dialogMode}
          conversationTitle={title}
          onConfirm={handleDialogConfirm}
          onCancel={() => {
            if (!busy) {
              setDialogMode(null);
            }
          }}
          busy={busy}
          error={actionError}
        />
      )}
    </>
  );
}

export default ConversationItem;

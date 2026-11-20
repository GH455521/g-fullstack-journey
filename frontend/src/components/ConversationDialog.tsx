import { useEffect, useRef, useState } from "react";

export type ConversationDialogMode = "rename" | "delete";

/**
 * mode 决定弹窗显示重命名还是删除确认。
 * title 是弹窗内部管理的输入状态。
 * onConfirm 由父组件传入，弹窗本身不负责调用 API。
 * busy 防止用户在请求过程中重复提交。
 * useEffect 监听键盘事件，并在组件卸载时移除监听。
 */
interface ConversationDialogProps {
  mode: ConversationDialogMode;
  conversationTitle: string;
  onConfirm: (value?: string) => void | Promise<void>;
  onCancel: () => void;
  busy?: boolean;
  error?: string | null;
}

function ConversationDialog({
  mode,
  conversationTitle,
  onConfirm,
  onCancel,
  busy = false,
  error = null,
}: ConversationDialogProps) {
  const [title, setTitle] = useState(conversationTitle);
  const inputRef = useRef<HTMLInputElement>(null);

  const isRename = mode === "rename";

  useEffect(() => {
    if (isRename) {
      inputRef.current?.focus();
      // 选中元素中的所有内容
      inputRef.current?.select();
    }
  }, [isRename]);

  // 处理确认操作
  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ): Promise<void> {
    event.preventDefault();

    if (busy) return;
    if (isRename) {
      const trimmedTitle = title.trim();
      if (!trimmedTitle || trimmedTitle.length > 100) {
        return;
      }
      await onConfirm(trimmedTitle);
      return;
    }
    await onConfirm();
  }

  // 按下 Escape 关闭弹窗
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent): void {
      if (event.key === "Escape") {
        onCancel();
      }
    }
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [busy, onCancel]);
  return (
    <div
      className="dialog-overlay"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !busy) {
          onCancel();
        }
      }}
    >
      <div
        className="dialog-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="conversation-dialog-title"
      >
        <form onSubmit={handleSubmit}>
          <div className="dialog-header">
            <h2 id="conversation-dialog-title">
              {isRename ? "重命名会话" : "删除会话"}
            </h2>
            <button
              type="button"
              className="dialog-close-button"
              onClick={onCancel}
              disabled={busy}
              aria-label="关闭"
            >
              ×
            </button>
          </div>
          <div className="dialog-content">
            {isRename ? (
              <>
                <label htmlFor="conversation-title-input">会话名称</label>
                <input
                  ref={inputRef}
                  id="conversation-title-input"
                  className="dialog-input"
                  type="text"
                  value={title}
                  maxLength={100}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="请输入会话名称"
                  disabled={busy}
                />
                <p className="dialog-hint">最多输入 100 个字符</p>
              </>
            ) : (
              <p>
                确定要删除会话<strong>「{conversationTitle}」</strong>吗？
                <br />
                删除后无法恢复
              </p>
            )}
            {error && (
              <p className="dialog-error" role="alert">
                {error}
              </p>
            )}
          </div>
          <div className="dialog-footer">
            <button
              type="button"
              className="dialog-cancel-button"
              onClick={onCancel}
              disabled={busy}
            >
              取消
            </button>
            <button
              type="submit"
              className={
                isRename
                  ? "dialog_confirm-button"
                  : "dialog-confirm-button danger"
              }
              disabled={
                busy ||
                (isRename &&
                  (title.trim().length === 0 || title.trim().length > 100))
              }
            >
              {busy ? "处理中..." : isRename ? "保存" : "确认删除"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ConversationDialog;

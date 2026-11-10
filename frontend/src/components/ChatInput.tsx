import { useState } from "react";

interface ChatInputProps {
  onSend: (content: string) => void;
  disabled?: boolean;
}

function ChatInput({ onSend, disabled = false }: ChatInputProps) {
  const [input, setInput] = useState("");

  function handleSend() {
    const content = input.trim();

    // 内容为空或正在发送时，不执行发送
    if (!content || disabled) return;
    // 把消息发送给父组件
    onSend(content);
    // 清空输入框
    setInput("");
  }
  function handleKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  }
  return (
    <footer className="input-area">
      <div className="chat-input-container">
        <textarea
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="输入消息...（Enter 发送，Shift + Enter 换行）"
          disabled={disabled}
          rows={1}
        />
      </div>
      <button onClick={handleSend} disabled={!input.trim() || disabled}>
        发送
      </button>
    </footer>
  );
}

export default ChatInput;

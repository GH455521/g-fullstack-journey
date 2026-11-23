import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import remarkGfm from "remark-gfm";
import type { MessageRole } from "../types/chat";

// 代码高亮主题
import "highlight.js/styles/github-dark.css";

interface MessageItemProps {
  role: MessageRole;
  content: string;
}

function MessageItem({ role, content }: MessageItemProps) {
  const isUser = role === "user";
  return (
    <div className={`message-row ${isUser ? "user" : "assistant"}`}>
      <div className="message-avatar">{isUser ? "👤" : "🤖"}</div>
      <div className="message-content">
        <div className="message-role">{isUser ? "用户" : "助手"}</div>
        <div className="message-text markdown-body">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeHighlight]}
          >
            {content}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
}

export default MessageItem;

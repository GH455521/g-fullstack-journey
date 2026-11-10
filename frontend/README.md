一、先确定最终项目结构
我们把之前的 frontend/src 改造成下面的结构：
frontend/

 src/

 main.jsx - React 入口

 App.jsx - 页面组合

 components/

- Sidebar.jsx — 左侧会话栏
- ConversationItem.jsx — 单个会话
- ChatHeader.jsx — 聊天顶部栏
- MessageList.jsx — 消息列表
- MessageItem.jsx — 单条消息
- Welcome.jsx — 欢迎页面
- ChatInput.jsx — 输入框

 hooks/

- useConversations.js — 会话管理
- useChat.js — 聊天和流式输出

 services/

- api.js — 后端普通接口
- chatStream.js — SSE 流式请求

 utils/

- id.js — ID 生成
- sseParser.js — SSE 数据解析

 styles/

- variables.css — 全局设计变量
- layout.css — 页面布局
- chat.css — 聊天区域样式




最终各部分的职责：
模块	负责什么	不负责什么
components	页面展示和用户交互	直接请求 Ollama
hooks	React 状态和业务逻辑	页面具体样式
services	请求 FastAPI	管理 React 状态
utils	通用工具函数	业务页面
styles	页面样式	业务逻辑
App.jsx	组合组件	实现全部功能

代码	作用
function Sidebar()	定义一个 React 函数组件
return (...)	返回组件要显示的 JSX
<aside>	表示页面中的侧边栏区域
className	指定 CSS 类名
export default Sidebar	允许其他文件导入这个组件

注意：React JSX 使用 className，而不是 HTML 中的 class。

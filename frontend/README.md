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

理解 ChatInput 的职责
ChatInput
├── 输入框
├── 发送按钮
├── 管理输入内容
├── 处理 Enter
└── 将消息交给父组件


这里有一个重要的 React 设计思想：

ChatInput 负责收集用户输入，App 负责决定收到输入后做什么。

也就是说，输入组件不应该直接请求 Ollama，而应该通过 Props 把消息交给父组件。

当前组件结构
到这里，阶段 B 的 UI 组件拆分就全部完成了。
frontend/src/
├── App.jsx
│
├── components/
│   ├── Sidebar.jsx
│   ├── ConversationItem.jsx
│   ├── ChatHeader.jsx
│   ├── Welcome.jsx
│   ├── MessageItem.jsx
│   ├── MessageList.jsx
│   └── ChatInput.jsx
│
├── hooks/
├── services/
├── utils/
└── styles/


我们已经学习了：
知识点	对应组件
React 组件与组件组合	Sidebar、App
Props 数据传递	ConversationItem、ChatHeader
map 列表渲染	MessageList
条件渲染	App、Welcome
消息展示	MessageItem
useState 状态管理	ChatInput
父子组件通信	ChatInput、App
键盘事件处理	ChatInput
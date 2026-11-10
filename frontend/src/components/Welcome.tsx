const suggestions = [
  {
    id: 1,
    title: '学习 Agent 开发',
    description: '从基础开始了解 AI Agent 的开发流程',
    prompt: '请带我从零开始学习 AI Agent 开发'
  },
  {
    id: 2,
    title: 'Python 编程',
    description: '学习 Python 基础知识和实战技巧',
    prompt: '请给我制定一份 Python 入门学习计划',
  },
  {
    id: 3,
    title: '代码问题',
    description: '帮助我分析和解决编程问题',
    prompt: '如何高效地排查代码中的 Bug？',
  },
  {
    id: 4,
    title: '了解 AI 模型',
    description: '了解本地大模型和 Ollama',
    prompt: '请介绍 Ollama 和本地大语言模型',
  },
]
function Welcome() {
  return (
    <div className="welcome">
      <div className="welcome-content">
        <div className="welcome-icon">✦</div>

        <h1>有什么可以帮忙的？</h1>

        <p className="welcome-description">
          欢迎使用 My AI Assistant，你可以向我提问、学习编程或讨论技术问题。
        </p>

        <div className="suggestion-grid">
          {suggestions.map((item) => (
            <div className="suggestion-card" key={item.id}>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>

  )
}

export default Welcome
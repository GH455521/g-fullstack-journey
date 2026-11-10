import { useEffect, useRef, useState } from 'react'
import './App.css'

const API_BASE = '/api'

type Conversation = {
  id: string
  title: string
}

function createConversation() {
  return {
    id: crypto.randomUUID(),
    title: '新对话',
  }
}
function App() {
  // 会话列表保存到浏览器本地
  const [conversations, setConversations] = useState<Conversation[]>(() => {
    try {
      const saved = localStorage.getItem('my-ai-conversations')
      return saved ? (JSON.parse(saved) as Conversation[]) : []
    } catch {
      return []
    }
  })

  const [activeId, setActiveId] = useState('')
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [error, setError] = useState('')

  const messagesEndRef = useRef<HTMLDivElement | null>(null)
  const textareaRef = useRef(null)
  const abortControllerRef = useRef(null)

  // 保存会话列表
  useEffect(() => {
    // conversations 发生变化就跑
    localStorage.setItem('my-ai-conversations', JSON.stringify(conversations))
  }, [conversations])

  // 页面首次打开时创建一个会话
  useEffect(() => {
    if (conversations.length === 0) {
      const first = createConversation()
      setConversations([first])
      setActiveId(first.id)
    } else if (!activeId) {
      setActiveId(conversations[0].id)
    }
  }, [conversations, activeId])

  // 切换会话时，从后端读取历史
  useEffect(() => {
    if (!activeId) return

    let cancelled = false

    async function loadHistory() {
      setMessages([])
      setError('')

      try {
        const response = await fetch(
          `${API_BASE}/conversations/${activeId}`
        )
        if (!response.ok) {
          throw new Error('读取会话历史失败')
        }

        const data = await response.json()
        if (!cancelled) {
          setMessages(data.message || [])
        }
      } catch (error) {
        if (!cancelled) {
          const err = error as Error
          setError(err.message)
        }
      }
    }
    loadHistory()

    return () => {
      cancelled = true
    }
  }, [activeId])

  // 新消息到达后自动滚动
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth',
    })
  }, [messages])

  // 创建新会话
  function handleNewConversation() {
    if (isStreaming) return

    const conversation = createConversation()
    setConversations((old) => [
      conversation,
      ...old
    ])

    setActiveId(conversation.id)
    setMessages([])
    setInput('')
    setError('')
  }

  // 切换会话
  function handleSwitchConversation(id: string) {
    if (isStreaming || id === activeId) return

    setActiveId(id)
    setInput('')
    setError('')
  }

  // 清空当前会话
  async function handleClearConversation() {
    if (!activeId || isStreaming) return

    const confirmed = window.confirm('确定清空当前会话吗？')
    if (!confirmed) return
    try {
      const response = await fetch(
        `${API_BASE}/conversations/${activeId}`,
        { method: 'DELETE' }
      )

      if (!response.ok) {
        throw new Error('清空会话失败')
      }
      setMessages([])
      setError('')
    } catch (error) {
      const err = error as Error
      setError(err.message)
    }
  }

  // 更新当前会话标题
  function updateConversationTitle(id: string, title: string) {
    setConversations((old) =>
      old.map((item) =>
        item.id === id ? { ...item, title } : item
      )
    )
  }

  // 处理SSE事件
  function handleSSEEvent(eventText: string, assistantMessageId: string) {
    
  }
}

export default App

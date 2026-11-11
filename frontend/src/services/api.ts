// 获取后端 API 基础地址
const API_BASE_URL = ''

// 统一处理 HTTP 请求
async function request(path: string, options: RequestInit = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers
    }
  })

  // 检查 HTTP 请求是否成功
  if (!response.ok) {
    throw new Error(`请求失败：HTTP ${response.status}`)
  }
  // 返回 JSON 响应数据
  return response.json()
}

// 检查后端 API 健康状态
export function getHealth() {
  return request('/api/health', {
    method: 'GET'
  })
}

// 普通聊天请求
export function sendChat(data: any) {
  return request('/api/chat', {
    method: 'POST',
    body: JSON.stringify(data)
  })
}

// 获取历史会话
export function getConversation(conversationId: any) {
  return request(`/api/conversations/${conversationId}`, {
    method: 'GET'
  })
}

// 清空会话
export function clearConversation(conversationId: any) {
  return request(`/api/conversations/${conversationId}`, {
    method: 'DELETE'
  })
}
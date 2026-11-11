// 获取后端 API 基础地址
const API_BASE_URL = ''

// 统一处理 HTTP 请求
// 非常有用的 TypeScript 功能：泛型。
// 它允许我们将来根据不同接口，指定不同的返回数据类型，而不用为每个接口重复编写请求逻辑。
// async function request<T>(...): Promise<T>
async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    }
  })

  // 检查 HTTP 请求是否成功
  if (!response.ok) {
    throw new Error(`请求失败：HTTP ${response.status}`)
  }
  // 返回 JSON 响应数据
  return response.json()
}

export interface HealthResponse {
  [key: string]: unknown
}
// 检查后端 API 健康状态
export function getHealth(): Promise<HealthResponse> {
  return request<HealthResponse>('/api/health', {
    method: 'GET'
  })
}

// 普通聊天请求

export function sendChat<T = unknown>(data: Record<string, unknown>): Promise<T> {
  return request<T>('/api/chat', {
    method: 'POST',
    body: JSON.stringify(data)
  })
}

// 获取历史会话
export function getConversation<T = unknown>(conversationId: string): Promise<T> {
  return request<T>(`/api/conversations/${conversationId}`, {
    method: 'GET'
  })
}

// 清空会话
export function clearConversation<T = unknown>(conversationId: string): Promise<T> {
  return request<T>(`/api/conversations/${conversationId}`, {
    method: 'DELETE'
  })
}
from fastapi import FastAPI
from pydantic import BaseModel

# 创建一个Web应用
app = FastAPI(title="My AI Assistant")

# 定义前端发送的数据格式
class ChatRequest(BaseModel):
  message: str

# 定义一个最简单的健康检查接口
@app.get("/health")
def health_check():
  return { "status": "OK" }

# 定义聊天接口
@app.post("/chat")
def chat(request: ChatRequest):
  return {
    "reply": f"我收到了你的信息：{ request.message }"
  }
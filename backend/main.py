import os

import requests
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

# 创建一个Web应用
# =========================
# 1. 创建 FastAPI 应用
# =========================
app = FastAPI(title="My AI Assistant", description="我的本地AI助手", version="0.2.0")

# =========================
# 2. Ollama 配置
# =========================
OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://127.0.0.1:11434")

OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "qwen2.5-coder:14b")


# 定义前端发送的数据格式
# =========================
# 3. 定义请求数据结构
# =========================
class ChatRequest(BaseModel):
    message: str


# 定义一个最简单的健康检查接口
# =========================
# 4. 健康检查接口
# =========================
@app.get("/health")
def health_check():
    return {"status": "OK", "message": "My AI Assistant backend is running"}


# 定义聊天接口
# =========================
# 5. AI 对话接口
# =========================
@app.post("/chat")
def chat(request: ChatRequest):
    # 调用 Ollama 本地API
    ollama_api_url = f"{OLLAMA_BASE_URL}/api/chat"
    payload = {
        "model": OLLAMA_MODEL,
        "messages": [{"role": "user", "content": request.message}],
        "stream": False,
    }

    try:
        # 向Ollama发送HTTP请求
        response = requests.post(ollama_api_url, json=payload, timeout=180)
        response.raise_for_status()

        result = response.json()

        ai_reply = result.get("message", {}).get("content", "").strip()

        if not ai_reply:
            raise HTTPException(status_code=502, detail="Ollama 返回了空回答")

        return {"reply": ai_reply, "model": OLLAMA_MODEL}

    except requests.exceptions.ConnectionError:
        raise HTTPException(
            status_code=503, detail="无法连接 Ollama，请检查 Ollama 是否正在运行"
        )
    except requests.exceptions.Timeout:
        raise HTTPException(status_code=504, detail="模型响应超时，请稍后重试")

    except requests.exceptions.HTTPError:
        raise HTTPException(
            status_code=502, detail=f"Ollama请求失败：{response.text[:500]}"
        )

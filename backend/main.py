import json
import os
import uuid

import requests
from fastapi import FastAPI, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field
from services.memory import memory

# 创建一个Web应用
# =========================
# 1. 创建 FastAPI 应用
# =========================
app = FastAPI(title="My AI Assistant", description="我的本地AI助手", version="0.4.0")

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
    message: str = Field(min_length=1)
    conversation_id: str | None = None

# =========================
# 4. SSE 消息格式
# =========================
def format_sse(data: dict) -> str:
    """
    将 Python 字典转换成 SSE 格式。
    每个事件以两个换行符结束。
    """
    return f"data: {json.dumps(data, ensure_ascii=False)}\n\n"
    

# 定义一个最简单的健康检查接口
# =========================
# 5. 健康检查接口
# =========================
@app.get("/health")
def health_check():
    return {"status": "OK", "message": "My AI Assistant backend is running", "model": OLLAMA_MODEL}


# 定义聊天接口
# =========================
# 6. 多轮 AI 对话接口
# =========================
@app.post("/chat")
def chat(request: ChatRequest):
    # 如果用户没有提供会话 ID，就自动生成
    conversation_id = (
        request.conversation_id or str(uuid.uuid4())
    )
    # 读取当前会话历史
    history = memory.get_history(conversation_id)
    # 把本轮用户消息添加到上下文
    message = history + [
        {
            "role": "user",
            "content": request.message
        }
    ]
    # 调用 Ollama 本地API
    ollama_api_url = f"{OLLAMA_BASE_URL}/api/chat"
    payload = {
        "model": OLLAMA_MODEL,
        "messages": message,
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
        # 只有模型成功回答后，才保存本轮消息
        memory.add_message(
            conversation_id, "user", request.message
        )
        memory.add_message(
            conversation_id, "assistant", ai_reply
        )

        return {"conversation_id": conversation_id,"reply": ai_reply, "model": OLLAMA_MODEL}

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
# =========================
# 7. 流式多轮对话
# =========================
@app.post("/chat/stream")
def chat_stream(request: ChatRequest):
    conversation_id = (
        request.conversation_id or str(uuid.uuid4())
    )
    history = memory.get_history(conversation_id)

    messages = history + [{
        "role": "user",
        "content": request.message
    }]

    payload = {
        "model": OLLAMA_MODEL,
        "messages": messages,
        "stream": True
    }

    def generate():
        ollama_api_url = f"{OLLAMA_BASE_URL}/api/chat"
        full_reply = ""
        try:
            with requests.post(
                ollama_api_url,
                json=payload,
                stream=True,
                timeout=(10, 300)
            ) as response:
                response.raise_for_status()
                #首先发送会话ID
                yield format_sse({
                    "type": "start",
                    "conversation_id": conversation_id
                })
                #逐行读取 Ollama 的流式数据
                for line in response.iter_lines():
                    if not line:
                        continue
                    data = json.loads(line)

                    message = data.get("message", {})
                    content = message.get("content", "")

                    if content:
                        full_reply += content
                        yield format_sse({
                            "type": "token",
                            "content": content
                        })
                    # Ollama 最后一条数据会标记 done
                    if data.get('done'):
                        break
            # 只有成功生成完整回答才保存历史
            if full_reply:
                memory.add_message(
                    conversation_id,
                    "user",
                    request.message
                )
                memory.add_message(
                    conversation_id,
                    "assistant",
                    full_reply
                )
            yield format_sse({
                "type": "done",
                "conversation_id": conversation_id
            })
        except requests.exceptions.Timeout:
            yield format_sse({
                "type": "error",
                "message": "模型响应超时"
            })
        except requests.exceptions.ConnectionError:
            yield format_sse({
                "type": "error",
                "message": "无法连接 Ollama"
            })
        except requests.exceptions.RequestException as exc:
            # exc!s 等价于 str(exc)
            yield format_sse({
                "type": "error",
                "message": f"Ollama 请求失败: {exc!s}"
            })
        except (ValueError, json.JSONDecodeError):
            yield format_sse({
                "type": "error",
                "message": "解析模型返回数据失败"
            })
    return StreamingResponse(
        generate(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no"
        }
    )
# =========================
# 8. 查看会话历史
# =========================
@app.get("/conversations/{conversation_id}")
def get_conversations(conversations_id: str):
    history = memory.get_history(conversations_id)
    return {
        "conversations_id": conversations_id,
        "messages": history,
        "total": len(history)
    }
# =========================
# 9. 清空会话历史
# =========================
@app.delete("/conversations/{conversation_id}")
def delete_conversation(conversation_id: str):
    memory.clear_history(conversation_id)
    return {
        "message": "会话历史已清空",
        "conversation_id": conversation_id
    }
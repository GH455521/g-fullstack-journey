import json
import os
import uuid

import requests
from database.connection import initialize_database
from fastapi import FastAPI, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field
from repositories.conversation_repository import (
    add_message,
    create_conversation,
    get_conversation,
    update_conversation_pin,
    update_conversation_title,
)
from repositories.conversation_repository import (
    delete_conversation as repository_delete_conversation,
)
from repositories.conversation_repository import (
    get_all_conversations as repository_get_all_conversations,
)

# 创建一个Web应用
# =========================
# 1. 创建 FastAPI 应用
# =========================
app = FastAPI(title="My AI Assistant", description="我的本地AI助手", version="0.6.0")


@app.on_event("startup")
def startup_event():
    initialize_database()


# =========================
# 2. Ollama 配置
# =========================
OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://127.0.0.1:11434")

OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "qwen2.5-coder:14b")

# =========================
# 3. AI 系统提示词
# =========================
SYSTEM_PROMPT = """
# Role: My AI Assistant

你是一个先进、专业、可靠的通用人工智能助手。你的目标是帮助用户解决问题、获取知识、编写代码、分析信息、学习新技能和完成复杂任务。

你应当表现出类似 ChatGPT 的交互体验：自然、聪明、准确、友好、善于理解上下文，并能够根据用户需求调整回答方式。

## 1. 核心行为准则

- 始终以解决用户实际问题为目标。
- 准确理解用户的意图，而不是机械地回答字面问题。
- 优先给出直接、有价值的答案，再根据需要补充解释。
- 对复杂问题进行系统分析，提供清晰、可执行的解决方案。
- 不确定的信息应明确说明，不得编造事实、数据、来源或能力。
- 如果用户的问题存在歧义，且会明显影响答案，应先询问最关键的澄清问题。
- 如果已有足够信息，不要反复询问用户已经提供过的内容。
- 根据用户的专业水平调整解释深度。
- 保持上下文连贯，理解并利用当前对话历史。

## 2. 回答风格

- 默认使用用户当前使用的语言回答。
- 表达自然、清晰、专业，避免机械化和模板化。
- 优先使用简洁、准确的表达。
- 对简单问题直接回答，不进行不必要的长篇解释。
- 对复杂问题提供充分的背景、原理、步骤和示例。
- 合理使用标题、列表、表格和代码块组织内容。
- 避免重复用户已经知道的信息。
- 不要为了显得专业而堆砌术语。

## 3. Markdown 格式规范

默认使用标准 Markdown 格式输出，确保内容可以被 ReactMarkdown 正确渲染。

必须遵守：

- 一级标题使用 `#`。
- 二级标题使用 `##`。
- 三级标题使用 `###`。
- 粗体使用 `**文本**`。
- 斜体使用 `*文本*`。
- 无序列表使用 `-`。
- 有序列表使用 `1.`。
- 行内代码使用反引号。
- 多行代码使用带语言标识的代码围栏。
- 表格使用标准 Markdown 表格语法。
- 引用使用 `>`。
- 分隔线使用 `---`。

禁止：

- 默认将回答包装成 JSON。
- 使用 `{"markdown": ...}` 描述回答内容。
- 使用 JSON 对象代替 Markdown 标题、列表、代码块或表格。
- 默认使用 HTML 代替 Markdown。
- 使用外层代码围栏包裹整篇回答。
- 在没有必要时输出复杂的结构化数据。

例外：当用户明确要求 JSON、XML、HTML 或其他特定格式时，应遵循用户要求。

## 4. 知识问答能力

回答知识类问题时：

- 先给出准确的核心结论。
- 根据问题复杂程度解释相关概念。
- 必要时使用实际案例帮助理解。
- 区分事实、推测、观点和建议。
- 对存在争议或不同解释的问题，说明主要观点及其依据。
- 对时效性较强的信息，不应将过时知识描述为当前事实。

## 5. 编程与技术能力

你是一名经验丰富的软件工程师，熟悉：

- 前端：HTML、CSS、JavaScript、TypeScript、React、Vue。
- 后端：Python、FastAPI、Node.js、REST API。
- 数据库：SQLite、PostgreSQL、MySQL、Redis。
- AI：LLM、Prompt Engineering、RAG、Agent、Function Calling、MCP。
- 工具：Git、GitHub、Docker、Linux、macOS。

编程回答必须遵守：

1. 优先提供可以实际运行的代码。
2. 明确指出代码所属文件和修改位置。
3. 修改现有项目时，尽量保持原有架构和代码风格。
4. 不要随意删除用户已有功能。
5. 涉及多个文件时，说明文件之间的关系。
6. 解释关键代码的作用。
7. 提供必要的安装命令和运行命令。
8. 对可能出现的错误提供排查方法。
9. 不得声称代码已经运行或测试成功，除非确实执行过测试。
10. 如果缺少关键项目代码，应先向用户索取相关文件，不得凭空假设项目结构。

## 6. 复杂任务处理

面对复杂任务时：

- 将任务拆分成合理的子任务。
- 明确每个阶段的目标。
- 优先处理依赖关系和关键问题。
- 提供具体的执行步骤。
- 说明每一步的预期结果。
- 在必要时提供验证方法。
- 对用户已经完成的部分，不要重复要求执行。
- 尽可能交付完整、连贯的解决方案。

## 7. 多轮对话与上下文

- 理解当前会话中的历史消息。
- 在回答时参考此前已经确认的技术环境、项目结构和约束。
- 用户修改需求时，以最新明确要求为准。
- 不要把不同项目或不同任务的上下文混淆。
- 不要虚构用户的个人信息、项目进度或技术环境。
- 对话历史不足以支持判断时，明确指出信息缺口。

## 8. 分析与决策

处理分析、比较和决策问题时：

- 明确评价标准。
- 比较不同方案的优缺点。
- 解释关键取舍。
- 给出明确推荐，而不是只罗列选项。
- 如果结论依赖特定条件，说明适用范围。
- 对复杂计算和技术判断进行必要的验证。

## 9. 安全与可靠性

- 不编造事实、引用、数据、代码执行结果或外部资源。
- 不确定时明确表达不确定性。
- 不将未经验证的推测当成事实。
- 涉及隐私、账号、密码和敏感信息时谨慎处理。
- 对可能造成数据丢失的操作，提前提醒用户。
- 涉及生产环境、数据库删除、系统配置修改时，优先提供安全方案。
- 不声称拥有实际上不可用的工具、网络访问或外部系统权限。

## 10. 输出要求

默认回答结构：

1. 直接回答核心问题。
2. 根据需要提供原理或背景。
3. 提供具体方案、代码或执行步骤。
4. 补充注意事项和常见问题。
5. 在有价值时给出下一步建议。

不要机械地在每次回答中使用全部结构。

最终目标：像一位优秀的技术专家、知识顾问和个人助手一样，准确理解用户需求，提供自然、可靠、实用且高质量的帮助。
"""


# 定义前端发送的数据格式
# =========================
# 3. 定义请求数据结构
# =========================
class ChatRequest(BaseModel):
    message: str = Field(min_length=1)
    conversation_id: str | None = None


class RenameConversationRequest(BaseModel):
    title: str = Field(min_length=1, max_length=100)


class PinConversationRequest(BaseModel):
    is_pinned: bool


# =========================
# 4. SSE 消息格式
# =========================
def format_sse(data: dict) -> str:
    """
    将 Python 字典转换成 SSE 格式。
    每个事件以两个换行符结束。
    """
    return f"data: {json.dumps(data, ensure_ascii=False)}\n\n"


# =========================
# 聊天历史与持久化辅助函数
# =========================
# get_chat_history() 负责从数据库读取历史，并转换成 Ollama 所需的格式
def get_chat_history(conversation_id: str) -> list[dict]:
    """
    从 SQLite 获取聊天历史。
    只返回 Ollama 需要的 role 和 content， 不将数据库中的时间字段传给模型。
    """
    conversation = get_conversation(conversation_id)

    if conversation is None:
        return []

    return [
        {"role": message["role"], "content": message["content"]}
        for message in conversation["messages"]
    ]


# =========================
# 增加统一的消息构造函数
# =========================
def build_ollama_messages(conversation_id: str, user_message: str) -> list[dict]:
    """
    构造发送给 Ollama 的完整消息列表。
    每次请求都添加系统提示词，然后添加历史消息和本轮用户消息。
    """
    history = get_chat_history(conversation_id)
    return [
        {"role": "assistant", "content": SYSTEM_PROMPT},
        *history,
        {"role": "user", "content": user_message},
    ]


# save_chat_turn() 则负责保存一轮完整对话。
def save_chat_turn(conversation_id: str, user_message: str, ai_reply: str) -> None:
    """
    保存一轮完整对话。
    如果会话不存在，先创建会话，再保存用户消息和 AI 回复。
    """
    conversation = get_conversation(conversation_id)
    if conversation is None:
        create_conversation(conversation_id)

    add_message(conversation_id, "user", user_message)
    add_message(conversation_id, "assistant", ai_reply)


# 定义一个最简单的健康检查接口
# =========================
# 5. 健康检查接口
# =========================
@app.get("/health")
def health_check():
    return {
        "status": "OK",
        "message": "My AI Assistant backend is running",
        "model": OLLAMA_MODEL,
    }


# 定义聊天接口
# =========================
# 6. 多轮 AI 对话接口
# =========================
@app.post("/chat")
def chat(request: ChatRequest):
    # 1. 如果用户没有提供会话 ID，就自动生成
    conversation_id = request.conversation_id or str(uuid.uuid4())
    # 2. 构造完整聊天信息
    messages = build_ollama_messages(conversation_id, request.message)
    # 3.调用 Ollama 本地API
    ollama_api_url = f"{OLLAMA_BASE_URL}/api/chat"
    payload = {
        "model": OLLAMA_MODEL,
        "messages": messages,
        "stream": False,
    }

    try:
        # 4. 向Ollama发送HTTP请求
        response = requests.post(ollama_api_url, json=payload, timeout=180)
        response.raise_for_status()

        result = response.json()

        ai_reply = result.get("message", {}).get("content", "").strip()

        if not ai_reply:
            raise HTTPException(status_code=502, detail="Ollama 返回了空回答")
        # 5. 只有模型成功回答后，才保存本轮消息
        save_chat_turn(conversation_id, request.message, ai_reply)

        # 6. 返回前端
        return {
            "conversation_id": conversation_id,
            "reply": ai_reply,
            "model": OLLAMA_MODEL,
        }

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
    # 1. 获取或生产会话 ID
    conversation_id = request.conversation_id or str(uuid.uuid4())
    # 2. 构造完整聊天消息
    messages = build_ollama_messages(conversation_id, request.message)
    # 3. 构造 Ollama 请求
    payload = {"model": OLLAMA_MODEL, "messages": messages, "stream": True}

    def generate():
        ollama_api_url = f"{OLLAMA_BASE_URL}/api/chat"
        full_reply = ""
        done_received = False
        try:
            with requests.post(
                ollama_api_url, json=payload, stream=True, timeout=(10, 300)
            ) as response:
                response.raise_for_status()
                # 首先发送会话ID
                yield format_sse({"type": "start", "conversation_id": conversation_id})
                # 逐行读取 Ollama 的流式数据
                for line in response.iter_lines():
                    if not line:
                        continue
                    data = json.loads(line)

                    message = data.get("message", {})
                    content = message.get("content", "")
                    # 累计完整回答，并向前端发送 token
                    if content:
                        full_reply += content
                        yield format_sse({"type": "token", "content": content})
                    # Ollama 最后一条数据会标记 done
                    if data.get("done"):
                        done_received = True
                        break
            # 4. 只有成功生成完整回答才保存历史
            if done_received and full_reply:
                save_chat_turn(conversation_id, request.message, full_reply)
            # 5. 通知前端本轮结束
            yield format_sse({"type": "done", "conversation_id": conversation_id})
        except requests.exceptions.Timeout:
            yield format_sse({"type": "error", "message": "模型响应超时"})
        except requests.exceptions.ConnectionError:
            yield format_sse({"type": "error", "message": "无法连接 Ollama"})
        except requests.exceptions.RequestException as exc:
            # exc!s 等价于 str(exc)
            yield format_sse({"type": "error", "message": f"Ollama 请求失败: {exc!s}"})
        except (ValueError, json.JSONDecodeError):
            yield format_sse({"type": "error", "message": "解析模型返回数据失败"})

    return StreamingResponse(
        generate(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )


# =========================
# 8. 获取所有会话列表
# =========================
@app.get("/conversations")
def get_all_conversations():
    # 获取所有会话 ID
    conversations = repository_get_all_conversations()

    return {
        "conversations": [
            {
                "conversation_id": item["conversation_id"],
                "title": item["title"],
                "total": item["total"],
                "is_pinned": item["is_pinned"],
            }
            for item in conversations
        ],
        "total": len(conversations),
    }


# =========================
# 9. 查看单个会话历史
# =========================
@app.get("/conversations/{conversation_id}")
def get_conversations(conversation_id: str):
    """
    从 SQLite 获取指定会话及消息。
    """
    conversation = get_conversation(conversation_id)
    # 会话不存在时返回 404
    if conversation is None:
        raise HTTPException(status_code=404, detail="会话不存在")
    return {
        "conversation_id": conversation_id,
        "messages": [
            {"role": message["role"], "content": message["content"]}
            for message in conversation["messages"]
        ],
        "total": conversation["total"],
    }


# =========================
# 10. 清空会话历史
# =========================
@app.delete("/conversations/{conversation_id}")
def delete_conversation(conversation_id: str):
    """
    从 SQLite 删除指定会话及其全部消息。
    """
    deleted = repository_delete_conversation(conversation_id)

    # 会话不存在时返回 404
    if not deleted:
        raise HTTPException(status_code=404, detail="会话不存在")
    return {"message": "会话历史已清空", "conversation_id": conversation_id}


# =========================
# 11. 重命名会话
# =========================
@app.patch("/conversations/{conversation_id}/title")
def rename_conversation(conversation_id: str, request: RenameConversationRequest):
    title = request.title.strip()

    if not title:
        raise HTTPException(status_code=422, detail="会话标题不能为空")

    if len(title) > 100:
        raise HTTPException(status_code=422, detail="会话标题不能超过100个字符")

    updated = update_conversation_title(conversation_id, title)

    if not updated:
        raise HTTPException(status_code=404, detail="会话不存在")

    return {
        "message": "会话标题已更新",
        "conversation_id": conversation_id,
        "title": title,
    }


# =========================
# 12. 更新会话置顶状态
# =========================
@app.patch("/conversations/{conversation_id}/pin")
def pin_conversation(conversation_id: str, request: PinConversationRequest):
    updated = update_conversation_pin(conversation_id, request.is_pinned)

    if not updated:
        raise HTTPException(status_code=404, detail="会话不存在")
    return {
        "message": ("会话已置顶" if request.is_pinned else "已取消置顶"),
        "conversation_id": conversation_id,
        "is_pinned": request.is_pinned,
    }

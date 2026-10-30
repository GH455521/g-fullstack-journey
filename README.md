
# My AI Assistant

一个持续迭代的个人 AI 助手项目。

## 技术栈

- Python
- FastAPI
- React（后续加入）
- LLM API（后续加入）

## 当前功能

- [x] FastAPI 后端初始化
- [x] 健康检查接口
- [x] 基础聊天接口
- [ ] 大模型 API 接入
- [ ] React 聊天界面
- [ ] 多轮对话
- [ ] RAG 知识库
- [ ] Agent 工具调用

## 后端启动

进入 backend 目录：

```bash
cd backend

python3 -m venv .venv
source .venv/bin/activate

python -m pip install -r requirements.txt

python -m uvicorn main:app --reload
```

## API

### GET /health

检查服务状态。

### POST /chat

接收用户消息并返回模拟回答。

请求示例：

```json
{
  "message": "你好"
}
```

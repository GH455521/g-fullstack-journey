import os

# =========================
# Ollama 基础配置
# =========================

OLLAMA_BASE_URL = os.getenv(
    "OLLAMA_BASE_URL",
    "http://127.0.0.1:11434",
).rstrip("/")

OLLAMA_MODEL = os.getenv(
    "OLLAMA_MODEL",
    "qwen2.5-coder:14b",
)


# =========================
# 模型生成参数
# =========================

OLLAMA_TEMPERATURE = float(os.getenv("OLLAMA_TEMPERATURE", "0.7"))

OLLAMA_TOP_P = float(os.getenv("OLLAMA_TOP_P", "0.8"))

OLLAMA_NUM_PREDICT = int(os.getenv("OLLAMA_NUM_PREDICT", "2048"))

# 上下文窗口不强制设置。
# 需要时再通过环境变量 OLLAMA_NUM_CTX 配置。
_num_ctx = os.getenv("OLLAMA_NUM_CTX")

OLLAMA_OPTIONS = {
    "temperature": OLLAMA_TEMPERATURE,
    "top_p": OLLAMA_TOP_P,
    "num_predict": OLLAMA_NUM_PREDICT,
}

if _num_ctx:
    OLLAMA_OPTIONS["num_ctx"] = int(_num_ctx)

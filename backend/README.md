## 1. Python虚拟环境：
### 使用uv创建虚拟环境并指定虚拟环境的路径及名称：
```
uv venv // 在根目录下生成.venv虚拟环境目录
source .venv/bin/activate // 启动虚拟环境
deactivate // 退出虚拟环境
uv pip install -r requirements.txt // 从 requirements.txt 安装
```

## 启动后端服务并测试：
### 确保当前终端位于 backend 目录，执行：
```
python -m uvicorn main:app --reload

解释这条命令：
参数	      作用
python -m	使用当前 Python 环境运行模块
uvicorn	启动 Web 服务
main	对应 main.py 文件
app	对应 main.py 中的 app 对象
--reload	修改代码后自动重新加载服务
```
### 正常情况下，终端会提示服务运行在 http://127.0.0.1:8000。
### 在 /docs 页面中：
### 1. 找到 GET /health。
### 2. 点击 Try it out，再点击 Execute。
### 3. 确认响应中出现 "status": "ok"。
### 4. 找到 POST /chat。
### 5. 点击 Try it out，在请求体中输入：
```
{
  "message": "你好，我正在学习 AI Agent"
}
```
### 6. 点击 Execute，确认后端返回对应的 reply。
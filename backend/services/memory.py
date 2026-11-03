class ConversationMemory:
  """
  简单的会话记忆管理器。

  当前版本使用 Python 字典保存数据：
  - 不同 conversation_id 对应不同对话
  - 每个对话保存 user 和 assistant 消息
  - 服务重启后数据会丢失
  """

  def __init__(self) -> None:
    self.conversations: dict[str, list[dict]] = {}

  def get_history(self, conversation_id: str) -> list[dict]:
    """
      获取某个会话的历史消息。
      如果会话不存在，则返回空列表。
      """
    return self.conversations.get(conversation_id, []).copy()

  def add_message(self, conversation_id: str, role: str, content: str) -> None:
    """
    向指定会话添加一条消息。
    """
    if conversation_id not in self.conversations:
      self.conversations[conversation_id] = []
    self.conversations[conversation_id].append({
      "role": role,
      "content": content
    })

  def clear_history(self, conversation_id: str) -> None:
    """
    清空指定会话。
    """
    self.conversations.pop(conversation_id, None)

  def get_all_conversations(self) -> list[str]:
    """
    获取当前所有会话 ID。
    """
    return list(self.conversations.keys())
# 创建一个全局记忆管理器
memory = ConversationMemory()
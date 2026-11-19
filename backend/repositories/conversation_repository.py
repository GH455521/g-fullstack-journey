from typing import Any

from database.connection import get_connection

# =========================
# 1. 创建会话
# =========================


def create_conversation(conversation_id: str, title: str = "新对话") -> None:
    """
    创建一个新对话
    """
    connection = get_connection()

    try:
        # 三引号的最大特点是支持多行字符串。在写 SQL 时，经常会遇到很长的、需要换行排版的语句。
        connection.execute(
            """INSERT INTO conversations(id, title) VALUES (?,?)""",
            (conversation_id, title),
        )
        connection.commit()
    except Exception:
        connection.rollback()
        raise
    finally:
        connection.close()


# =========================
# 2. 获取单个会话及消息
# =========================
def get_conversation(conversation_id: str) -> dict[str, Any] | None:
    """
    根据会话ID获取会话及其全部信息。如果会话不存在，返回None
    """
    connection = get_connection()

    try:
        # 查询会话基本信息
        conversation = connection.execute(
            """SELECT id,title,created_at,updated_at FROM conversations WHERE id=?""",
            (conversation_id,),
        ).fetchone()

        if conversation is None:
            return None
        # 查询该会话下的全部消息
        rows = connection.execute(
            """SELECT role, content,created_at FROM messages WHERE conversation_id=? ORDER BY id ASC""",
            (conversation_id,),
        ).fetchall()

        messages = [
            {
                "role": row["role"],
                "content": row["content"],
                "created_at": row["created_at"],
            }
            for row in rows
        ]
        return {
            "conversation_id": conversation["id"],
            "title": conversation["title"],
            "messages": messages,
            "total": len(messages),
        }
    except Exception:
        connection.rollback()
        raise
    finally:
        connection.close()


# =========================
# 3. 获取全部会话
# =========================
def get_all_conversations() -> list[dict[str, Any]]:
    """
    获取全部会话，按照最近更新时间倒序排列
    """
    connection = get_connection()

    try:
        # LEFT JOIN 可以保留没有消息的新对话。如果使用普通 JOIN，还没有消息的会话就不会出现在结果中。
        rows = connection.execute(
            """SELECT c.id,c.title,c.created_at,c.updated_at, COUNT(m.id) AS total FROM conversations AS c LEFT JOIN messages AS m ON c.id=m.conversation_id GROUP BY c.id ORDER BY c.updated_at DESC, c.created_at DESC"""
        ).fetchall()

        return [
            {
                "conversation_id": row["id"],
                "title": row["title"],
                "created_at": row["created_at"],
                "updated_at": row["updated_at"],
                "total": row["total"],
            }
            for row in rows
        ]
    except Exception:
        connection.rollback()
        raise
    finally:
        connection.close()


# =========================
# 4. 添加消息
# =========================
def add_message(conversation_id: str, role: str, content: str) -> None:
    """
    向指定会话添加一条消息，第一条用户消息会自动成为会话标题
    """
    if role not in ("user", "assistant"):
        raise ValueError(f"无效的角色: {role}")
    connection = get_connection()

    try:
        # 1. 查一下该会话当前有多少条消息
        cursor = connection.execute(
            "SELECT COUNT(*) FROM messages WHERE conversation_id = ?",
            (conversation_id,),
        )
        # 执行 SELECT 语句后，结果可能有多行。fetchone() 每次只从结果集里抓取一行。
        message_count = cursor.fetchone()[0]
        is_first_message = message_count == 0  # 如果为 0，说明是第一条
        # 2. 插入消息
        connection.execute(
            """INSERT INTO messages(conversation_id, role, content) VALUES (?, ?, ?)""",
            (conversation_id, role, content),
        )

        # 3. 更新对话时间，如果是第一条用户消息，同事更新对话标题
        if role == "user" and is_first_message:
            title = content.strip()[:30]
            # title = CASE
            #     WHEN title = '新对话' AND ? != ''
            #     THEN ?
            #     ELSE title
            # END
            # 它的判断逻辑是：
            # 如果当前数据库里这个会话的 title 字段仍然是默认值 '新对话'，并且本次发送的消息内容（?）不为空，就把标题更新为这条消息的前 30 个字符；否则保持原样。
            connection.execute(
                """UPDATE conversations SET title = CASE WHEN title='新对话' AND ? != '' THEN ? ELSE title END,updated_at = CURRENT_TIMESTAMP WHERE id = ?""",
                (title, title, conversation_id),
            )
        else:
            connection.execute(
                """UPDATE conversations SET updated_at= CURRENT_TIMESTAMP WHERE id=?""",
                (conversation_id,),
            )
        connection.commit()
    except Exception:
        connection.rollback()
        raise
    finally:
        connection.close()


# =========================
# 5. 更新对话标题
# =========================
def update_conversation_title(conversation_id: str, title: str) -> bool:
    """
    更新对话标题，成功更新返回 True，失败返回 False
    """
    connection = get_connection()

    try:
        cursor = connection.execute(
            """UPDATE conversations SET title = ?,updated_at=CURRENT_TIMESTAMP WHERE id = ?""",
            (title, conversation_id),
        )
        connection.commit()
        return cursor.rowcount > 0
    except Exception:
        connection.rollback()
        raise
    finally:
        connection.close()


# =========================
# 6. 删除会话
# =========================
def delete_conversation(conversation_id: str) -> bool:
    """删除指定会话，messages 表中的关联消息会通过外键级联删除"""
    connection = get_connection()

    try:
        cursor = connection.execute(
            """DELETE FROM conversations WHERE id= ?""", (conversation_id,)
        )
        connection.commit()
        return cursor.rowcount > 0
    except Exception:
        connection.rollback()
        raise
    finally:
        connection.close()

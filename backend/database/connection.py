import sqlite3
from pathlib import Path

# =========================
# 1. 获取数据库文件路径
# =========================

# 当前文件所在目录：backend/database/
# __file__ 表示当前 Python 文件的位置。
# 因此，无论你从项目根目录还是 backend 目录启动服务，数据库都会定位到：backend/my_ai_assistant.db
DATABASE_DIR = Path(__file__).resolve().parent
# backend 目录
BACKEND_DIR = DATABASE_DIR.parent
# 数据库文件：backend/my_ai_assistant.db
DB_PATH = BACKEND_DIR / "my_ai_assistant.db"

# SQL结构文件：backend/database/schema.sql
SCHEMA_PATH = DATABASE_DIR / "schema.sql"

# =========================
# 2. 创建数据库连接
# =========================


def get_connection() -> sqlite3.Connection:
    """
    创建并返回 SQLite 数据库连接
    """
    connection = sqlite3.connect(DB_PATH)

    # 开启外键约束
    connection.execute("PRAGMA foreign_keys = ON")

    # 允许通过字段名称读取查询结果
    # 默认情况下，查询结果是通过数字下标读取：row[0]
    # 设置sqlite3.Row后就可以使用字段名称：row["id"]
    connection.row_factory = sqlite3.Row

    return connection


# =========================
# 3. 初始化数据库
# =========================


def initialize_database() -> None:
    """
    读取schema.sql，创建数据库表和索引
    """

    # 检查 SQL 文件是否存在
    if not SCHEMA_PATH.exists():
        raise FileNotFoundError(f"数据库结构文件不存在：{SCHEMA_PATH}")

    # 读取 SQL 文件
    schema_sql = SCHEMA_PATH.read_text(encoding="utf-8")

    # 创建数据库连接
    connection = get_connection()

    try:
        # 执行 SQL 文件中的全部建表语句
        connection.executescript(schema_sql)

        # 提交事务
        connection.commit()

        print(f"SQLite 数据库初始化成功：{DB_PATH}")

    except Exception:
        connection.rollback()
        raise
    finally:
        # 无论成功还是失败，都关闭连接
        connection.close()

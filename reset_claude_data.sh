#!/bin/bash

# 定义SQLite数据库路径
DB_PATH="$HOME/Library/Application Support/Claude-API-Server/data.sqlite3"

# 检查数据库文件是否存在
if [ ! -f "$DB_PATH" ]; then
    echo "❌ 错误：数据库文件不存在！"
    echo "路径：$DB_PATH"
    exit 1
fi

echo "📌 开始执行Claude-API-Server数据重置操作..."

# 使用sqlite3执行批量SQL操作
sqlite3 "$DB_PATH" << EOF
-- 开启事务，确保操作原子性
BEGIN TRANSACTION;

-- 清空accounts表（保留表结构，仅删除数据）
DELETE FROM accounts;
SELECT '✅ accounts表已清空' AS result;

-- 重置免费请求次数为-99999
UPDATE settings
SET value = '-99999'
WHERE key = 'free_request_count';
SELECT '✅ 免费请求次数已重置为-99999' AS result;

-- 提交事务
COMMIT;

-- 验证修改结果（可选，查看最终值）
SELECT key, value FROM settings WHERE key = 'free_request_count';
EOF

# 检查脚本执行状态
if [ $? -eq 0 ]; then
    echo -e "\n🎉 所有操作执行完成！"
else
    echo -e "\n❌ 操作执行失败，请检查日志！"
    # 回滚事务（如果执行出错）
    sqlite3 "$DB_PATH" "ROLLBACK;"
    exit 1
fi
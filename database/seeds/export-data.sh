#!/bin/bash

# 数据库数据导出脚本
# 用于将当前数据库中的数据导出为初始化 SQL 文件

set -e

# 配置
CONTAINER_NAME="nova-postgres"
DB_NAME="nova_admin"
DB_USER="postgres"
OUTPUT_FILE="database/seeds/exported-data.sql"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

# 颜色输出
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}开始导出数据库数据...${NC}"

# 检查容器是否运行
if ! docker ps | grep -q "$CONTAINER_NAME"; then
    echo -e "${RED}错误: 数据库容器 $CONTAINER_NAME 未运行${NC}"
    echo -e "${YELLOW}请先运行: pnpm docker:up${NC}"
    exit 1
fi

cd "$PROJECT_ROOT"

# 创建临时文件
TEMP_FILE=$(mktemp)

# 使用 pg_dump 导出数据（仅数据，INSERT 格式）
echo -e "${GREEN}正在导出数据（使用 pg_dump）...${NC}"
docker exec "$CONTAINER_NAME" pg_dump -U "$DB_USER" -d "$DB_NAME" \
    --data-only \
    --inserts \
    --no-owner \
    --no-privileges \
    --disable-triggers \
    --table=sys_department \
    --table=sys_department_closure \
    --table=sys_user \
    --table=sys_user_role \
    --table=sys_role \
    --table=sys_role_menu \
    --table=sys_menu \
    --table=sys_menu_closure \
    --table=sys_config \
    --table=sys_i18n \
    --table=sys_dict_type \
    --table=sys_dict_item \
    > "$TEMP_FILE" 2>&1

# 检查导出是否成功
if [ $? -ne 0 ]; then
    echo -e "${RED}导出失败！${NC}"
    cat "$TEMP_FILE"
    rm -f "$TEMP_FILE"
    exit 1
fi

# 添加文件头部和清空数据语句
{
    echo "-- Nova Admin 数据库初始化数据"
    echo "-- 自动导出时间: $(date '+%Y-%m-%d %H:%M:%S')"
    echo "-- 使用方法: psql -U postgres -d nova_admin -f $OUTPUT_FILE"
    echo ""
    echo "-- 清空现有数据 (如果表存在)"
    echo "DO \$\$"
    echo "BEGIN"
    echo "    TRUNCATE TABLE sys_role_menu, sys_user_role, sys_operation_log, sys_i18n, sys_config, sys_menu_closure, sys_menu, sys_role, sys_user, sys_department_closure, sys_department, sys_dict_item, sys_dict_type CASCADE;"
    echo "EXCEPTION"
    echo "    WHEN undefined_table THEN"
    echo "        NULL;"
    echo "END \$\$;"
    echo ""
    cat "$TEMP_FILE"
} > "$OUTPUT_FILE"

rm -f "$TEMP_FILE"

echo -e "${GREEN}数据导出完成！${NC}"
echo -e "${GREEN}导出文件: $OUTPUT_FILE${NC}"
echo -e "${YELLOW}可以使用以下命令导入数据:${NC}"
echo "  docker exec -i $CONTAINER_NAME psql -U $DB_USER -d $DB_NAME < $OUTPUT_FILE"
echo ""
echo -e "${YELLOW}或者使用项目脚本:${NC}"
echo "  pnpm db:seed"

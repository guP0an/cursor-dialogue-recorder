#!/bin/bash

# Cursor Hook: 自动记录对话到后端API
# 这个脚本会在用户提交提示和AI回复时自动调用

# 从环境变量获取配置
API_BASE="${CURSOR_DIALOGUE_API_BASE:-http://localhost:3001/api}"

# 从stdin读取JSON输入
input=$(cat)

# 解析hook事件类型（从hook_event_name或通过脚本名判断）
hook_name="${1:-unknown}"

# 提取关键信息
conversation_id=$(echo "$input" | jq -r '.conversation_id // empty')
generation_id=$(echo "$input" | jq -r '.generation_id // empty')
workspace_root=$(echo "$input" | jq -r '.workspace_roots[0] // empty')
user_email=$(echo "$input" | jq -r '.user_email // empty')

# 根据hook类型处理不同的输入
case "$hook_name" in
  "beforeSubmitPrompt")
    # 捕获用户输入
    prompt=$(echo "$input" | jq -r '.prompt // empty')
    
    if [ -z "$prompt" ]; then
      echo "{\"continue\": true}"
      exit 0
    fi
    
    # 提取仓库名称（从workspace路径）
    repository=$(basename "$workspace_root" 2>/dev/null || echo "unknown")
    
    # 发送到后端API（异步，不阻塞）
    (
      curl -s -X POST "${API_BASE}/dialogues" \
        -H "Content-Type: application/json" \
        -d "{
          \"role\": \"user\",
          \"content\": $(echo "$prompt" | jq -Rs .),
          \"workspace\": $(echo "$workspace_root" | jq -Rs .),
          \"repository\": $(echo "$repository" | jq -Rs .),
          \"conversation_id\": $(echo "$conversation_id" | jq -Rs .),
          \"generation_id\": $(echo "$generation_id" | jq -Rs .)
        }" > /dev/null 2>&1 || true
    ) &
    
    # 返回允许继续（不阻塞用户操作）
    echo "{\"continue\": true}"
    ;;
    
  "afterAgentResponse")
    # 捕获AI回复
    text=$(echo "$input" | jq -r '.text // empty')
    
    if [ -z "$text" ]; then
      echo "{}"
      exit 0
    fi
    
    # 提取仓库名称
    repository=$(basename "$workspace_root" 2>/dev/null || echo "unknown")
    
    # 发送到后端API（异步）
    (
      curl -s -X POST "${API_BASE}/dialogues" \
        -H "Content-Type: application/json" \
        -d "{
          \"role\": \"assistant\",
          \"content\": $(echo "$text" | jq -Rs .),
          \"workspace\": $(echo "$workspace_root" | jq -Rs .),
          \"repository\": $(echo "$repository" | jq -Rs .),
          \"conversation_id\": $(echo "$conversation_id" | jq -Rs .),
          \"generation_id\": $(echo "$generation_id" | jq -Rs .)
        }" > /dev/null 2>&1 || true
    ) &
    
    echo "{}"
    ;;
    
  *)
    # 其他hook类型，不做处理
    echo "{}"
    ;;
esac

exit 0

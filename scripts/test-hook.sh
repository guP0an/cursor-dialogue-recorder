#!/bin/bash

# 测试 Cursor Hook 是否正常工作

echo "🧪 测试 Cursor Hook 配置..."
echo ""

# 检查文件是否存在
echo "1. 检查 Hook 文件..."
if [ -f ".cursor/hooks.json" ]; then
  echo "   ✅ hooks.json 存在"
else
  echo "   ❌ hooks.json 不存在"
  exit 1
fi

if [ -f ".cursor/hooks/record-dialogue.sh" ]; then
  echo "   ✅ record-dialogue.sh 存在"
else
  echo "   ❌ record-dialogue.sh 不存在"
  exit 1
fi

# 检查文件权限
echo ""
echo "2. 检查文件权限..."
if [ -x ".cursor/hooks/record-dialogue.sh" ]; then
  echo "   ✅ record-dialogue.sh 可执行"
else
  echo "   ⚠️  record-dialogue.sh 不可执行，正在修复..."
  chmod +x .cursor/hooks/record-dialogue.sh
  echo "   ✅ 已修复"
fi

# 检查后端是否运行
echo ""
echo "3. 检查后端服务..."
if curl -s http://localhost:3001/api/stats > /dev/null 2>&1; then
  echo "   ✅ 后端服务运行中 (http://localhost:3001)"
else
  echo "   ⚠️  后端服务未运行，请先启动: npm run dev"
fi

# 检查 jq 是否安装（Hook 脚本需要）
echo ""
echo "4. 检查依赖工具..."
if command -v jq &> /dev/null; then
  echo "   ✅ jq 已安装"
else
  echo "   ⚠️  jq 未安装，Hook 需要 jq 来解析 JSON"
  echo "   安装方法: brew install jq (macOS) 或 apt-get install jq (Linux)"
fi

if command -v curl &> /dev/null; then
  echo "   ✅ curl 已安装"
else
  echo "   ❌ curl 未安装，Hook 需要 curl 来发送请求"
  exit 1
fi

# 显示配置信息
echo ""
echo "5. Hook 配置信息:"
echo "   Hook 文件: .cursor/hooks.json"
echo "   Hook 脚本: .cursor/hooks/record-dialogue.sh"
echo "   API 地址: ${CURSOR_DIALOGUE_API_BASE:-http://localhost:3001/api}"

echo ""
echo "✅ 配置检查完成！"
echo ""
echo "📝 下一步："
echo "   1. 确保后端服务运行: npm run dev"
echo "   2. 重启 Cursor（重要！）"
echo "   3. 在 Cursor 中问一个问题，测试是否自动记录"
echo "   4. 访问 http://localhost:3000 查看对话记录"

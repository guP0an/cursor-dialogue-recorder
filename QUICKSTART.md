# 快速启动指南

## 5分钟快速开始

### 1. 安装依赖

```bash
npm run install:all
```

### 2. 配置环境变量（可选，可跳过）

**这一步是可选的！** 不配置也能正常使用所有功能。

如果你想要使用 AI 分析功能，可以运行：

```bash
npm run setup:env
```

然后编辑 `backend/.env` 文件，填入你的 OpenAI API Key（如果不需要可以留空）。

### 3. 启动服务

```bash
npm run dev
```

这将同时启动：
- 后端服务: http://localhost:3001
- 前端界面: http://localhost:3000

### 4. 添加测试数据（可选）

在新的终端窗口中运行：

```bash
npm run test:data
```

### 5. 访问网站

打开浏览器访问: http://localhost:3000

## 功能演示

### 查看对话记录
- 访问首页，查看所有记录的对话
- 可以按日期筛选对话

### 查看每日总结
- 点击导航栏的"每日总结"
- 查看已生成的总结文件
- 点击任意日期查看详细内容

### 查看统计信息
- 点击导航栏的"统计信息"
- 查看对话总数和每日统计

## 手动添加对话

### 通过API

```bash
# 添加用户消息
curl -X POST http://localhost:3001/api/dialogues \
  -H "Content-Type: application/json" \
  -d '{
    "role": "user",
    "content": "你的问题",
    "workspace": "/path/to/workspace",
    "repository": "project-name"
  }'

# 添加AI回复
curl -X POST http://localhost:3001/api/dialogues \
  -H "Content-Type: application/json" \
  -d '{
    "role": "assistant",
    "content": "AI的回复内容",
    "workspace": "/path/to/workspace",
    "repository": "project-name"
  }'
```

### 手动触发分析

```bash
# 分析今天的对话（替换为实际日期）
curl -X POST http://localhost:3001/api/analyze/2024-01-15
```

## 配置AI分析（可选）

**注意：这是可选的！** 不配置也能正常使用所有功能，系统会使用模拟分析。

如果你想要使用真实的 AI 分析功能：

1. 运行配置脚本：
   ```bash
   npm run setup:env
   ```

2. 编辑 `backend/.env` 文件，填入你的 OpenAI API Key:
   ```env
   OPENAI_API_KEY=sk-your-api-key-here
   ```

3. 重启后端服务

**说明：**
- 不配置也能正常使用，系统会使用模拟分析功能
- 配置后可以使用 OpenAI 的 GPT-4 进行更智能的分析
- 获取 API Key: https://platform.openai.com/api-keys

## 自动记录Cursor对话

要自动记录Cursor中的对话，你需要：

1. 查看 `cursor-extension/` 目录中的示例代码
2. 根据Cursor的实际API调整监听逻辑
3. 或者使用文件系统监听（如果Cursor将对话存储在文件中）

## 常见问题

### 端口被占用
- 修改 `frontend/vite.config.ts` 中的端口（前端）
- 修改 `backend/src/index.ts` 中的 PORT（后端）

### 数据存储位置
- 对话日志: `data/dialogues/current.json`
- 每日总结: `data/summaries/YYYY-MM-DD.md`

### 每日分析时间
- 默认每天早上8点自动分析昨天的对话
- 可以在 `backend/src/services/dailyAnalyzer.ts` 中修改时间

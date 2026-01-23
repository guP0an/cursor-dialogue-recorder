# Cursor 对话记录器

一个自动记录 Cursor 中 AI 对话的网站，支持自动分析和生成每日总结。

## 功能特性

- 📝 **自动记录对话**: 自动记录在 Cursor 中与 AI 的所有对话
- 💡 **知识点提取**: 自动提取对话中的重要知识点并详细记录
- 📊 **每日分析**: 每天早上 8 点自动分析昨天的对话，生成 `YYYY-MM-DD.md` 总结文件
- 🌐 **Web 界面**: 美观的 React 界面展示对话记录和每日总结
- 📈 **统计信息**: 查看对话统计和趋势

## 项目结构

```
.
├── frontend/          # React + TypeScript 前端
├── backend/           # Node.js + TypeScript 后端
├── data/              # 数据存储目录（自动创建）
│   ├── dialogues/     # 对话日志
│   └── summaries/     # 每日总结
└── README.md
```

## 安装和运行

### 1. 安装依赖

```bash
npm run install:all
```

### 2. 配置环境变量（可选）

**这一步是可选的！** 如果不配置，系统会使用模拟分析功能，所有功能都能正常使用。

如果你想要使用真实的 AI 分析功能（生成更准确的每日总结），可以配置 OpenAI API Key：

**方法一：自动创建（推荐）**
```bash
# 运行脚本创建 .env 文件模板
node scripts/create-env.js
# 然后编辑 backend/.env 文件，填入你的 OPENAI_API_KEY
```

**方法二：手动创建**
在 `backend` 目录下手动创建 `.env` 文件，内容如下：

**使用 OpenAI（默认）：**
```env
# OpenAI API Key（可选，用于AI分析功能）
OPENAI_API_KEY=your_openai_api_key_here

# 后端服务端口（可选，默认3001）
PORT=3001
```

**关于 AI_MODEL：**
- `AI_MODEL` 是指定使用哪个 AI 模型的参数
- **可以不填**，系统默认使用 `gpt-4`
- 对于火山引擎，需要填写你在火山引擎控制台中看到的模型名称或ID
- 如果不确定，可以先不填，使用默认值试试
- 详细说明请查看 `docs/AI_MODEL说明.md`

**说明：**
- **不配置也能用！** 如果不设置任何 API Key，系统会使用模拟分析功能，所有功能都能正常使用
- 支持 OpenAI 和火山引擎等兼容 OpenAI API 的服务
- 设置后可以使用 AI 模型进行更智能的分析和知识点提取
- `.env` 文件不会被提交到 git（已在 .gitignore 中）

### 3. 启动服务

```bash
# 同时启动前端和后端
npm run dev

# 或者分别启动
npm run dev:frontend  # 前端: http://localhost:3000
npm run dev:backend   # 后端: http://localhost:3001
```

### 4. 添加测试数据（可选）

```bash
# 确保后端服务正在运行，然后执行：
npm run test:data
```

这会添加一些示例对话数据，方便测试系统功能。

## 使用说明

### 记录对话

系统提供了 API 接口来记录对话。你可以通过以下方式使用：

1. **通过 API 手动添加对话**:
   ```bash
   curl -X POST http://localhost:3001/api/dialogues \
     -H "Content-Type: application/json" \
     -d '{
       "role": "user",
       "content": "如何创建一个React组件？",
       "workspace": "/path/to/workspace",
       "repository": "my-project"
     }'
   ```

2. **创建 Cursor 扩展** (推荐):
   创建一个 Cursor 扩展来自动捕获对话。参考 `cursor-extension/` 目录中的示例代码。

### 查看对话记录

访问 http://localhost:3000 查看所有对话记录。

### 查看每日总结

访问 http://localhost:3000/summaries 查看所有生成的每日总结。

### 手动触发分析

如果需要手动分析某一天的对话：

```bash
curl -X POST http://localhost:3001/api/analyze/2024-01-15
```

## API 接口

### 获取所有对话
```
GET /api/dialogues
```

### 获取指定日期的对话
```
GET /api/dialogues/:date
```

### 添加对话
```
POST /api/dialogues
Body: { role: "user" | "assistant", content: string, workspace?: string, repository?: string }
```

### 获取统计信息
```
GET /api/stats
```

### 获取所有总结文件
```
GET /api/summaries
```

### 获取指定日期的总结
```
GET /api/summaries/:date
```

### 手动触发分析
```
POST /api/analyze/:date
```

## Cursor 扩展集成

要自动捕获 Cursor 中的对话，你需要创建一个 Cursor 扩展。由于 Cursor 的扩展 API 可能有所不同，你可以：

1. 检查 Cursor 的扩展文档
2. 使用文件系统监听（如果 Cursor 将对话存储在文件中）
3. 使用 Cursor 的 API（如果有提供）

示例扩展代码请参考 `cursor-extension/` 目录。

## 技术栈

- **前端**: React 18 + TypeScript + Vite
- **后端**: Node.js + Express + TypeScript
- **AI 分析**: OpenAI API (可选)
- **定时任务**: node-cron

## 开发

```bash
# 开发模式
npm run dev

# 构建
npm run build
```

## 注意事项

1. 确保后端服务在运行，前端才能正常工作
2. 如果不设置 `OPENAI_API_KEY`，系统会使用模拟分析功能
3. 每日分析任务在每天早上 8 点自动执行
4. 数据存储在 `data/` 目录中，请定期备份

## 许可证

MIT

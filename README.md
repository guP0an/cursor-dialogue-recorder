# Ai 对话记录器

一个自动记录 Cursor 中 AI 对话的网站，支持自动分析和生成每日总结。

## 功能特性

- 📝 **自动记录对话**: 自动记录在 Cursor 中与 AI 的所有对话
- 💡 **知识点提取**: 自动提取对话中的重要知识点并详细记录
- 📊 **每日分析**: 每天早上 8 点自动分析昨天的对话，生成 `YYYY-MM-DD.md` 总结文件
- 🤖 **Cursor AI 分析**: 直接使用 Cursor 的 AI 能力进行分析，无需 API Key
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

**这一步是可选的！** 如果不配置，系统会使用**智能模拟分析功能**（基于规则和模式匹配），所有功能都能正常使用，并且会自动提取话题、知识点和关键洞察。

如果你想要使用真实的 AI 分析功能（生成更准确的每日总结），有以下三种方式：

**方法一：自动创建（推荐）**
```bash
# 运行脚本创建 .env 文件模板
node scripts/create-env.js
# 然后编辑 backend/.env 文件，填入你的 OPENAI_API_KEY
```

**方法二：手动创建**
在 `backend` 目录下手动创建 `.env` 文件，内容如下：

**方式1：使用 OpenAI（默认）**
```env
# OpenAI API Key（可选，用于AI分析功能）
OPENAI_API_KEY=your_openai_api_key_here

# 后端服务端口（可选，默认3001）
PORT=3001
```

**方式2：使用本地 LLM（如 Ollama）- 无需 API Key**
```env
# 使用本地 LLM，无需 API Key
USE_LOCAL_LLM=true
OLLAMA_BASE_URL=http://localhost:11434/v1
AI_MODEL=llama2  # 或其他本地模型名称

# 后端服务端口（可选，默认3001）
PORT=3001
```

**使用本地 LLM 的步骤：**
1. 安装 Ollama: https://ollama.ai
2. 下载模型: `ollama pull llama2` (或其他模型)
3. 启动 Ollama 服务
4. 在 `.env` 中配置上述选项

**关于 AI_MODEL：**
- `AI_MODEL` 是指定使用哪个 AI 模型的参数
- **可以不填**，系统默认使用 `gpt-4`
- 对于火山引擎，需要填写你在火山引擎控制台中看到的模型名称或ID
- 如果不确定，可以先不填，使用默认值试试
- 详细说明请查看 `docs/AI_MODEL说明.md`

**说明：**
- **不配置也能用！** 如果不设置任何 API Key，系统会使用**智能模拟分析功能**，基于规则和模式匹配自动提取：
  - 📊 主要话题（从用户问题中提取）
  - 💡 知识点总结（从AI回复中提取代码、列表、标题等）
  - 🔍 关键洞察（分析技术领域、问题类型、学习重点等）
- **三种分析方式：**
  1. **智能模拟分析**（默认，无需配置）- 基于规则和模式匹配
  2. **云端 AI 服务**（OpenAI/火山引擎等）- 需要 API Key
  3. **本地 LLM**（Ollama）- 无需 API Key，但需要本地安装
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

#### 🎯 自动记录（推荐）

**使用 Cursor Hooks 自动捕获所有对话！** 这是最简单、最强大的方式。

**安装步骤：**

1. **确认 Hook 文件已存在**（项目已包含）:
   - `.cursor/hooks.json` - Hook 配置
   - `.cursor/hooks/record-dialogue.sh` - Hook 脚本

2. **确保脚本可执行**:
   ```bash
   chmod +x .cursor/hooks/record-dialogue.sh
   ```

3. **重启 Cursor**（重要！）

4. **开始使用** - 现在你在 Cursor 中的所有对话都会自动记录！

**功能特性：**
- ✅ **自动记录** - 无需手动操作
- ✅ **跨会话** - 每个对话框都记录
- ✅ **跨仓库** - 切换项目也记录
- ✅ **完整追踪** - 会话ID、仓库信息完整保存

详细设置指南请参考：[Cursor Hooks 设置文档](./docs/CURSOR_HOOKS_SETUP.md)

#### 手动记录（备选方案）

如果 Hook 无法使用，也可以通过 API 手动添加：

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

### 查看对话记录

访问 http://localhost:3000 查看所有对话记录。

**后台数据在哪里看？**

- **文件**：`backend/data/dialogues/current.json`（原始对话）、`backend/data/summaries/`（每日总结）
- **接口**：`GET http://localhost:3001/api/dialogues`、`GET http://localhost:3001/api/stats`
- **页面**：http://localhost:3000（对话）、http://localhost:3000/summaries（总结）

**只想在本仓库记录？** 用项目里的 `.cursor/hooks.json` 即可。  
**希望任意仓库的 Cursor 对话都记录到本网站？** 需安装「用户级 Hook」：运行 `node scripts/install-user-hooks.js`，详见 [查看后台数据与全仓库记录](./docs/查看后台数据与全仓库记录.md)。

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

### 获取指定会话的对话
```
GET /api/dialogues/conversation/:conversation_id
```

### 获取指定仓库的对话
```
GET /api/dialogues/repository/:repository
```

### 获取所有会话列表
```
GET /api/conversations
```

### 获取所有仓库列表
```
GET /api/repositories
```

### 添加对话
```
POST /api/dialogues
Body: { 
  role: "user" | "assistant", 
  content: string, 
  workspace?: string, 
  repository?: string,
  conversation_id?: string,
  generation_id?: string
}
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

## 使用 Cursor AI 进行自动分析

**无需 API Key！** 你可以直接使用 Cursor 本身的 AI 能力来分析对话。

### 方法 1: 使用 Cursor 命令（推荐）

在 Cursor 中输入：

```
@analyze-dialogues today
```

或

```
@analyze-dialogues 2026-01-23
```

Cursor 会自动：
1. 获取指定日期的对话数据
2. 使用 Cursor 的 AI 能力分析对话
3. 生成结构化的 Markdown 总结
4. 保存总结到文件

### 方法 2: 使用辅助脚本

```bash
# 获取对话数据
node scripts/analyze-with-cursor.js 2026-01-23

# 然后在 Cursor 中使用 AI 分析对话内容
# 最后保存总结
```

### 方法 3: 手动分析

1. 访问 `http://localhost:3001/api/dialogues/{日期}` 获取对话
2. 在 Cursor 中使用 AI 分析这些对话
3. 生成总结并通过 API 保存：`POST /api/analyze-with-cursor/{日期}`

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

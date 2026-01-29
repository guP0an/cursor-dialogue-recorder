# Cursor Hooks 自动记录对话设置指南

## 概述

通过 Cursor Hooks，我们可以**自动捕获**你在 Cursor 中的所有对话，无需手动操作。无论你切换对话框、切换仓库，所有对话都会被自动记录。

## 工作原理

Cursor Hooks 允许我们在特定事件发生时执行脚本：

1. **`beforeSubmitPrompt`**: 当你提交问题给 AI 时触发
2. **`afterAgentResponse`**: 当 AI 回复完成时触发

这些 Hook 会自动将对话发送到后端 API 进行记录。

## 安装步骤

### 1. 确认 Hook 文件已创建

项目已经包含了必要的 Hook 文件：

- `.cursor/hooks.json` - Hook 配置文件
- `.cursor/hooks/record-dialogue.sh` - Hook 执行脚本

### 2. 确保脚本可执行

```bash
chmod +x .cursor/hooks/record-dialogue.sh
```

### 3. 确保后端服务运行

Hook 脚本需要后端 API 运行在 `http://localhost:3001`。如果使用不同的端口，可以设置环境变量：

```bash
export CURSOR_DIALOGUE_API_BASE=http://localhost:3001/api
```

### 4. 重启 Cursor

**重要**: 修改 Hook 配置后，必须**重启 Cursor** 才能生效。

## 验证安装

### 方法 1: 检查 Cursor 设置

1. 打开 Cursor 设置
2. 找到 "Hooks" 选项卡
3. 应该能看到已配置的 hooks

### 方法 2: 测试对话记录

1. 在 Cursor 中问一个问题
2. 等待 AI 回复
3. 访问 http://localhost:3000 查看对话是否被记录

### 方法 3: 查看后端日志

后端控制台应该会显示：
```
📝 记录对话: user - 你的问题...
📝 记录对话: assistant - AI的回复...
```

## 功能特性

### ✅ 自动记录

- **无需手动操作**: 所有对话自动记录
- **跨会话**: 每个对话框都会记录
- **跨仓库**: 切换仓库也会记录

### ✅ 会话管理

- 每个对话会话都有唯一的 `conversation_id`
- 可以按会话查看对话历史
- API: `GET /api/conversations` - 获取所有会话列表
- API: `GET /api/dialogues/conversation/:id` - 获取指定会话的对话

### ✅ 仓库管理

- 自动识别当前工作区/仓库
- 可以按仓库查看对话
- API: `GET /api/repositories` - 获取所有仓库列表
- API: `GET /api/dialogues/repository/:name` - 获取指定仓库的对话

## 配置选项

### 修改 API 地址

如果后端运行在不同地址，可以：

1. **环境变量方式**（推荐）:
   ```bash
   export CURSOR_DIALOGUE_API_BASE=http://your-api:port/api
   ```

2. **修改脚本**:
   编辑 `.cursor/hooks/record-dialogue.sh`，修改 `API_BASE` 变量

### 超时设置

Hook 默认超时为 5 秒。如果网络较慢，可以在 `hooks.json` 中调整：

```json
{
  "hooks": {
    "beforeSubmitPrompt": [
      {
        "command": ".cursor/hooks/record-dialogue.sh beforeSubmitPrompt",
        "timeout": 10
      }
    ]
  }
}
```

## 故障排查

### Hook 没有执行

1. **检查文件权限**:
   ```bash
   ls -la .cursor/hooks/record-dialogue.sh
   # 应该显示 -rwxr-xr-x
   ```

2. **检查路径**:
   - 项目级 hooks: 路径相对于项目根目录
   - 确保使用 `.cursor/hooks/...` 而不是 `./hooks/...`

3. **重启 Cursor**: 修改配置后必须重启

### 对话没有被记录

1. **检查后端是否运行**:
   ```bash
   curl http://localhost:3001/api/stats
   ```

2. **检查网络连接**:
   Hook 脚本使用 `curl` 发送请求，确保网络正常

3. **查看 Cursor Hooks 输出**:
   - 在 Cursor 设置中找到 "Hooks" 选项卡
   - 查看是否有错误信息

### 性能问题

Hook 脚本使用异步方式发送请求，不会阻塞 Cursor 操作。如果仍然感觉卡顿：

1. 检查网络延迟
2. 减少超时时间（但可能导致记录失败）
3. 检查后端性能

## 多仓库支持

### 场景 1: 切换仓库

当你打开不同的项目时：
- Hook 会自动识别新的 `workspace_root`
- 对话会记录对应的 `repository` 名称
- 可以在前端按仓库筛选查看

### 场景 2: 多个对话框

每个 Cursor 对话框都有独立的 `conversation_id`：
- 不同对话框的对话不会混淆
- 可以按会话查看特定对话框的历史

## 高级用法

### 用户级 Hooks（全局生效）

如果你想在所有项目中使用，可以在 `~/.cursor/hooks.json` 创建：

```json
{
  "version": 1,
  "hooks": {
    "beforeSubmitPrompt": [
      {
        "command": "~/path/to/your/script.sh beforeSubmitPrompt"
      }
    ]
  }
}
```

注意：用户级 hooks 的路径是相对于 `~/.cursor/` 目录的。

### 自定义处理

你可以修改 `record-dialogue.sh` 脚本来：
- 添加额外的日志记录
- 过滤敏感信息
- 发送到多个后端
- 添加自定义元数据

## 与现有功能集成

### 自动分析

记录的对话会自动：
- 按日期组织
- 支持每日自动分析（如果配置了定时任务）
- 支持手动分析特定日期/会话/仓库

### Web 界面

访问 http://localhost:3000 可以：
- 查看所有对话
- 按日期、会话、仓库筛选
- 查看统计信息
- 查看生成的总结

## 注意事项

1. **隐私**: Hook 会记录所有对话内容，请确保后端安全
2. **性能**: Hook 使用异步请求，不会影响 Cursor 性能
3. **兼容性**: 需要 Cursor 支持 Hooks 功能（较新版本）
4. **网络**: 需要后端服务可访问

## 总结

通过 Cursor Hooks，我们实现了：

✅ **自动记录** - 无需手动操作  
✅ **跨会话** - 每个对话框都记录  
✅ **跨仓库** - 切换项目也记录  
✅ **完整追踪** - 会话ID、仓库信息完整保存  

现在，无论你在哪个对话框、哪个仓库中使用 Cursor，所有对话都会被自动记录和分析！

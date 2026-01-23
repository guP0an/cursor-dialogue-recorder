# Cursor 扩展 - 对话记录器

这个扩展用于自动捕获 Cursor 中的 AI 对话并发送到后端服务。

## 安装说明

由于 Cursor 的扩展系统可能有所不同，这里提供了几种集成方案：

### 方案 1: 通过 Cursor 扩展 API（如果支持）

如果 Cursor 提供了扩展 API，你可以创建一个扩展来监听对话事件。

### 方案 2: 文件系统监听

如果 Cursor 将对话存储在本地文件中，可以使用文件系统监听器。

### 方案 3: HTTP 代理

在 Cursor 和后端服务之间设置一个代理来捕获对话请求。

## 使用示例

### 通过 Node.js 脚本监听

创建一个独立的 Node.js 脚本来监听 Cursor 的对话：

```javascript
// monitor-cursor.js
const axios = require('axios');
const chokidar = require('chokidar');
const path = require('path');

// 监听 Cursor 的对话日志文件（需要根据实际情况调整路径）
const cursorLogPath = path.join(
  process.env.HOME,
  'Library/Application Support/Cursor/logs'
);

const watcher = chokidar.watch(cursorLogPath, {
  ignored: /(^|[\/\\])\../,
  persistent: true
});

watcher.on('change', async (filePath) => {
  // 解析对话并发送到后端
  // 这里需要根据 Cursor 的实际日志格式来解析
  console.log('检测到文件变化:', filePath);
});
```

### 通过浏览器扩展

如果 Cursor 是基于 Electron 的，可以创建一个浏览器扩展来拦截网络请求。

## 手动测试

你可以使用以下命令手动添加测试对话：

```bash
# 添加用户消息
curl -X POST http://localhost:3001/api/dialogues \
  -H "Content-Type: application/json" \
  -d '{
    "role": "user",
    "content": "如何创建一个React组件？",
    "workspace": "/Users/test/project",
    "repository": "my-project"
  }'

# 添加 AI 回复
curl -X POST http://localhost:3001/api/dialogues \
  -H "Content-Type: application/json" \
  -d '{
    "role": "assistant",
    "content": "要创建一个React组件，你可以使用函数式组件或类组件...",
    "workspace": "/Users/test/project",
    "repository": "my-project"
  }'
```

## 注意事项

- 需要根据 Cursor 的实际 API 或文件结构来调整监听逻辑
- 确保后端服务正在运行
- 可能需要处理权限问题（访问 Cursor 的日志文件）

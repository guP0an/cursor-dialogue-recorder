/**
 * Cursor 对话监听器
 * 这个脚本可以监听 Cursor 的对话并自动发送到后端服务
 */

const axios = require('axios');
const chokidar = require('chokidar');
const path = require('path');
const fs = require('fs');
const os = require('os');

const API_BASE = 'http://localhost:3001/api';

// Cursor 可能的日志路径（需要根据实际情况调整）
const possiblePaths = [
  // macOS
  path.join(os.homedir(), 'Library', 'Application Support', 'Cursor', 'logs'),
  path.join(os.homedir(), '.cursor', 'logs'),
  // Windows
  path.join(os.homedir(), 'AppData', 'Roaming', 'Cursor', 'logs'),
  // Linux
  path.join(os.homedir(), '.config', 'Cursor', 'logs'),
];

let lastProcessed = new Set();

/**
 * 解析对话日志（需要根据 Cursor 的实际格式调整）
 */
function parseDialogueLog(content) {
  // 这里需要根据 Cursor 的实际日志格式来解析
  // 示例解析逻辑
  const dialogues = [];
  
  // 简单的正则匹配示例（需要根据实际格式调整）
  const userPattern = /\[USER\](.*?)(?=\[AI\]|$)/gs;
  const aiPattern = /\[AI\](.*?)(?=\[USER\]|$)/gs;
  
  const userMatches = [...content.matchAll(userPattern)];
  const aiMatches = [...content.matchAll(aiPattern)];
  
  userMatches.forEach((match, index) => {
    dialogues.push({
      role: 'user',
      content: match[1].trim(),
    });
    
    if (aiMatches[index]) {
      dialogues.push({
        role: 'assistant',
        content: aiMatches[index][1].trim(),
      });
    }
  });
  
  return dialogues;
}

/**
 * 发送对话到后端
 */
async function sendDialogue(dialogue, workspace, repository) {
  try {
    await axios.post(`${API_BASE}/dialogues`, {
      role: dialogue.role,
      content: dialogue.content,
      workspace,
      repository,
    });
    console.log(`✅ 已记录对话: ${dialogue.role} - ${dialogue.content.substring(0, 50)}...`);
  } catch (error) {
    console.error('❌ 发送对话失败:', error.message);
  }
}

/**
 * 处理文件变化
 */
async function handleFileChange(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const fileHash = require('crypto').createHash('md5').update(content).digest('hex');
    
    // 避免重复处理
    if (lastProcessed.has(fileHash)) {
      return;
    }
    lastProcessed.add(fileHash);
    
    // 解析对话
    const dialogues = parseDialogueLog(content);
    
    // 提取工作区和仓库信息
    const workspace = path.dirname(filePath);
    const repository = path.basename(path.dirname(workspace));
    
    // 发送对话
    for (const dialogue of dialogues) {
      await sendDialogue(dialogue, workspace, repository);
    }
  } catch (error) {
    console.error('处理文件失败:', error);
  }
}

/**
 * 启动监听
 */
function startMonitoring() {
  console.log('🔍 开始监听 Cursor 对话...');
  
  // 查找可用的日志路径
  let logPath = null;
  for (const possiblePath of possiblePaths) {
    if (fs.existsSync(possiblePath)) {
      logPath = possiblePath;
      console.log(`📁 找到日志目录: ${logPath}`);
      break;
    }
  }
  
  if (!logPath) {
    console.warn('⚠️  未找到 Cursor 日志目录，请手动指定路径');
    console.log('可能的路径:');
    possiblePaths.forEach(p => console.log(`  - ${p}`));
    return;
  }
  
  // 监听文件变化
  const watcher = chokidar.watch(logPath, {
    ignored: /(^|[\/\\])\../,
    persistent: true,
    ignoreInitial: true,
  });
  
  watcher
    .on('change', (filePath) => {
      console.log(`📝 检测到文件变化: ${filePath}`);
      handleFileChange(filePath);
    })
    .on('error', (error) => {
      console.error('监听错误:', error);
    });
  
  console.log('✅ 监听器已启动');
}

// 启动
startMonitoring();

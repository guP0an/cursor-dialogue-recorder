/**
 * 使用 Cursor AI 分析对话的辅助脚本
 * 
 * 这个脚本可以帮助你在 Cursor 中使用 AI 能力来分析对话
 * 
 * 使用方法：
 * 1. 在 Cursor 中打开这个文件
 * 2. 告诉 Cursor: "请帮我分析今天的对话并生成总结"
 * 3. Cursor 会使用它的 AI 能力来分析对话并生成总结
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');

const API_BASE = 'http://localhost:3001/api';

/**
 * 获取指定日期的对话
 */
async function getDialogues(date) {
  try {
    const response = await axios.get(`${API_BASE}/dialogues/${date}`);
    return response.data.data || [];
  } catch (error) {
    console.error('获取对话失败:', error.message);
    return [];
  }
}

/**
 * 保存 Cursor AI 生成的总结
 */
async function saveSummary(date, summary) {
  try {
    // 方式1: 通过 API 保存
    await axios.post(`${API_BASE}/analyze-with-cursor/${date}`, {
      summary
    });
    console.log(`✅ 总结已保存到: backend/data/summaries/${date}.md`);
    return true;
  } catch (error) {
    // 方式2: 直接保存到文件
    const summariesDir = path.join(__dirname, '..', 'backend', 'data', 'summaries');
    if (!fs.existsSync(summariesDir)) {
      fs.mkdirSync(summariesDir, { recursive: true });
    }
    const filePath = path.join(summariesDir, `${date}.md`);
    fs.writeFileSync(filePath, summary, 'utf-8');
    console.log(`✅ 总结已保存到: ${filePath}`);
    return true;
  }
}

/**
 * 格式化对话内容供 Cursor AI 分析
 */
function formatDialoguesForAnalysis(dialogues) {
  if (dialogues.length === 0) {
    return '没有对话记录';
  }

  const userMessages = dialogues.filter(d => d.role === 'user');
  const aiMessages = dialogues.filter(d => d.role === 'assistant');

  let formatted = `对话总数: ${dialogues.length}\n`;
  formatted += `用户消息: ${userMessages.length}\n`;
  formatted += `AI回复: ${aiMessages.length}\n\n`;

  formatted += '=== 对话内容 ===\n\n';
  
  dialogues.forEach((dialogue, index) => {
    formatted += `[${dialogue.role === 'user' ? '用户' : 'AI'} ${index + 1}]\n`;
    formatted += `${dialogue.content}\n\n`;
  });

  return formatted;
}

// 导出函数供 Cursor 使用
module.exports = {
  getDialogues,
  saveSummary,
  formatDialoguesForAnalysis
};

// 如果直接运行脚本
if (require.main === module) {
  const date = process.argv[2] || new Date().toISOString().split('T')[0];
  
  console.log(`📊 正在获取 ${date} 的对话...`);
  getDialogues(date).then(dialogues => {
    if (dialogues.length === 0) {
      console.log(`⚠️  ${date} 没有对话记录`);
      return;
    }
    
    console.log(`✅ 获取到 ${dialogues.length} 条对话`);
    console.log('\n=== 对话内容 ===\n');
    console.log(formatDialoguesForAnalysis(dialogues));
    console.log('\n💡 提示: 在 Cursor 中使用 AI 分析这些对话，然后使用 saveSummary() 保存总结');
  });
}

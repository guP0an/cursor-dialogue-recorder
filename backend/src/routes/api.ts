import { Router } from 'express';
import * as path from 'path';
import * as fs from 'fs-extra';
import { dialogueRecorder, dailyAnalyzer } from '../services/instances';

const router = Router();

// 获取所有对话
router.get('/dialogues', (req, res) => {
  try {
    const dialogues = dialogueRecorder.getAllDialogues();
    res.json({ success: true, data: dialogues });
  } catch (error) {
    res.status(500).json({ success: false, error: String(error) });
  }
});

// 获取指定日期的对话
router.get('/dialogues/:date', (req, res) => {
  try {
    const { date } = req.params;
    const dialogues = dialogueRecorder.getDialoguesByDate(date);
    res.json({ success: true, data: dialogues });
  } catch (error) {
    res.status(500).json({ success: false, error: String(error) });
  }
});

// 添加对话（供Cursor扩展调用）
router.post('/dialogues', (req, res) => {
  try {
    const { role, content, workspace, repository, conversation_id, generation_id } = req.body;
    if (!role || !content) {
      return res.status(400).json({ success: false, error: '缺少必要参数' });
    }
    dialogueRecorder.addDialogue(role, content, workspace, repository, conversation_id, generation_id);
    res.json({ success: true, message: '对话已记录' });
  } catch (error) {
    res.status(500).json({ success: false, error: String(error) });
  }
});

// 获取对话统计
router.get('/stats', (req, res) => {
  try {
    const stats = dialogueRecorder.getStats();
    res.json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({ success: false, error: String(error) });
  }
});

// 获取指定会话的对话
router.get('/dialogues/conversation/:conversation_id', (req, res) => {
  try {
    const { conversation_id } = req.params;
    const dialogues = dialogueRecorder.getDialoguesByConversation(conversation_id);
    res.json({ success: true, data: dialogues });
  } catch (error) {
    res.status(500).json({ success: false, error: String(error) });
  }
});

// 获取指定仓库的对话
router.get('/dialogues/repository/:repository', (req, res) => {
  try {
    const { repository } = req.params;
    const dialogues = dialogueRecorder.getDialoguesByRepository(repository);
    res.json({ success: true, data: dialogues });
  } catch (error) {
    res.status(500).json({ success: false, error: String(error) });
  }
});

// 获取所有会话列表
router.get('/conversations', (req, res) => {
  try {
    const conversations = dialogueRecorder.getConversations();
    res.json({ success: true, data: conversations });
  } catch (error) {
    res.status(500).json({ success: false, error: String(error) });
  }
});

// 获取所有仓库列表
router.get('/repositories', (req, res) => {
  try {
    const repositories = dialogueRecorder.getRepositories();
    res.json({ success: true, data: repositories });
  } catch (error) {
    res.status(500).json({ success: false, error: String(error) });
  }
});

// 获取所有总结文件列表
router.get('/summaries', (req, res) => {
  try {
    const files = dailyAnalyzer.getSummaryFiles();
    res.json({ success: true, data: files });
  } catch (error) {
    res.status(500).json({ success: false, error: String(error) });
  }
});

// 获取指定日期的总结
router.get('/summaries/:date', (req, res) => {
  try {
    const { date } = req.params;
    const summary = dailyAnalyzer.getSummary(date);
    if (summary) {
      res.json({ success: true, data: summary });
    } else {
      res.status(404).json({ success: false, error: '总结不存在' });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: String(error) });
  }
});

// 手动触发分析（用于测试）
router.post('/analyze/:date', async (req, res) => {
  try {
    const { date } = req.params;
    await dailyAnalyzer.analyzeDate(date);
    res.json({ success: true, message: `已分析 ${date} 的对话` });
  } catch (error) {
    res.status(500).json({ success: false, error: String(error) });
  }
});

// 使用 Cursor AI 分析对话（供 Cursor 命令使用）
router.post('/analyze-with-cursor/:date', async (req, res) => {
  try {
    const { date } = req.params;
    const { summary } = req.body; // Cursor AI 生成的总结
    
    if (!summary) {
      return res.status(400).json({ success: false, error: '缺少总结内容' });
    }
    
    // 保存 Cursor AI 生成的总结
    const summariesDir = path.join(process.cwd(), 'data', 'summaries');
    await fs.ensureDir(summariesDir);
    const filePath = path.join(summariesDir, `${date}.md`);
    await fs.writeFile(filePath, summary, 'utf-8');
    
    res.json({ 
      success: true, 
      message: `已保存 Cursor AI 生成的总结`,
      filePath 
    });
  } catch (error) {
    res.status(500).json({ success: false, error: String(error) });
  }
});

export { router as apiRoutes };

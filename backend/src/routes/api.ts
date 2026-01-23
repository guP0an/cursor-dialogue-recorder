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
    const { role, content, workspace, repository } = req.body;
    if (!role || !content) {
      return res.status(400).json({ success: false, error: '缺少必要参数' });
    }
    dialogueRecorder.addDialogue(role, content, workspace, repository);
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

export { router as apiRoutes };

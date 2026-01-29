import * as fs from 'fs-extra';
import * as path from 'path';
import * as cron from 'node-cron';
import { DialogueRecorder, DialogueMessage } from './dialogueRecorder';
import { OpenAIService } from './openaiService';

export class DailyAnalyzer {
  private dialogueRecorder: DialogueRecorder;
  private openaiService: OpenAIService;
  private summariesDir: string;

  constructor(dialogueRecorder?: DialogueRecorder) {
    this.dialogueRecorder = dialogueRecorder || new DialogueRecorder();
    this.openaiService = new OpenAIService();
    this.summariesDir = path.join(process.cwd(), 'data', 'summaries');
    this.ensureDirectories();
  }

  private ensureDirectories(): void {
    fs.ensureDirSync(this.summariesDir);
  }

  /**
   * 启动每日分析任务
   * - 每天早上8点分析昨天的对话
   * - 启动时自动补跑：为所有「有对话但还没总结」的日期生成总结（如 1.27、1.28）
   */
  public start(): void {
    // 每天 8 点分析昨天
    cron.schedule('0 8 * * *', () => {
      this.analyzeYesterday();
    });

    // 启动时补跑：有对话的日期若没有总结文件，自动生成
    this.fillMissingSummaries().catch((err) => {
      console.error('📊 补跑总结失败:', err);
    });

    console.log('📊 每日分析任务已启动，将在每天早上8点分析昨天的对话');
    console.log('📊 启动时会自动为有对话但未生成总结的日期补跑总结');
  }

  /**
   * 补跑缺失的总结：遍历所有有对话的日期，若该日期没有总结文件则生成
   */
  public async fillMissingSummaries(): Promise<void> {
    const stats = this.dialogueRecorder.getStats();
    const datesWithDialogues = Object.keys(stats.byDate).sort();

    if (datesWithDialogues.length === 0) {
      return;
    }

    const missing: string[] = [];
    for (const dateStr of datesWithDialogues) {
      if (!this.getSummary(dateStr)) {
        missing.push(dateStr);
      }
    }

    if (missing.length === 0) {
      return;
    }

    console.log(`📊 补跑总结：以下 ${missing.length} 个日期有对话但无总结，开始生成：${missing.join(', ')}`);
    for (const dateStr of missing) {
      await this.analyzeDate(dateStr);
    }
  }

  /**
   * 分析昨天的对话并生成总结
   */
  public async analyzeYesterday(): Promise<void> {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const dateStr = yesterday.toISOString().split('T')[0];

    await this.analyzeDate(dateStr);
  }

  /**
   * 分析指定日期的对话
   */
  public async analyzeDate(dateStr: string): Promise<void> {
    console.log(`📊 开始分析 ${dateStr} 的对话...`);

    const dialogues = this.dialogueRecorder.getDialoguesByDate(dateStr);

    if (dialogues.length === 0) {
      console.log(`⚠️  ${dateStr} 没有对话记录`);
      return;
    }

    try {
      const summary = await this.openaiService.analyzeDialogues(dialogues, dateStr);
      const filePath = path.join(this.summariesDir, `${dateStr}.md`);

      fs.writeFileSync(filePath, summary, 'utf-8');
      console.log(`✅ 已生成总结文件: ${filePath}`);
    } catch (error) {
      console.error(`❌ 分析失败:`, error);
    }
  }

  /**
   * 获取所有总结文件列表（仅日期格式 YYYY-MM-DD.md）
   */
  public getSummaryFiles(): string[] {
    try {
      const datePattern = /^\d{4}-\d{2}-\d{2}\.md$/;
      return fs.readdirSync(this.summariesDir)
        .filter(file => datePattern.test(file))
        .sort()
        .reverse();
    } catch (error) {
      console.error('获取总结文件列表失败:', error);
      return [];
    }
  }

  /**
   * 获取指定日期的总结内容
   */
  public getSummary(dateStr: string): string | null {
    const filePath = path.join(this.summariesDir, `${dateStr}.md`);
    try {
      if (fs.existsSync(filePath)) {
        return fs.readFileSync(filePath, 'utf-8');
      }
    } catch (error) {
      console.error(`读取总结文件失败: ${filePath}`, error);
    }
    return null;
  }
}

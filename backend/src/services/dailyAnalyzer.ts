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
   * 每天早上8点分析昨天的对话
   */
  public start(): void {
    // 每天8点执行
    cron.schedule('0 8 * * *', () => {
      this.analyzeYesterday();
    });

    console.log('📊 每日分析任务已启动，将在每天早上8点分析昨天的对话');
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
   * 获取所有总结文件列表
   */
  public getSummaryFiles(): string[] {
    try {
      return fs.readdirSync(this.summariesDir)
        .filter(file => file.endsWith('.md'))
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

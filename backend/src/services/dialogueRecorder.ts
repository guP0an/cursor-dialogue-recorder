import * as fs from 'fs-extra';
import * as path from 'path';
import { EventEmitter } from 'events';

export interface DialogueMessage {
  id: string;
  timestamp: string;
  role: 'user' | 'assistant';
  content: string;
  workspace?: string;
  repository?: string;
  conversation_id?: string;
  generation_id?: string;
}

export class DialogueRecorder extends EventEmitter {
  private logDir: string;
  private currentLogFile: string;
  private dialogues: DialogueMessage[] = [];

  constructor() {
    super();
    this.logDir = path.join(process.cwd(), 'data', 'dialogues');
    this.currentLogFile = path.join(this.logDir, 'current.json');
    this.ensureDirectories();
    this.loadExistingDialogues();
  }

  private ensureDirectories(): void {
    fs.ensureDirSync(this.logDir);
  }

  private loadExistingDialogues(): void {
    try {
      if (fs.existsSync(this.currentLogFile)) {
        const data = fs.readFileSync(this.currentLogFile, 'utf-8');
        this.dialogues = JSON.parse(data);
      }
    } catch (error) {
      console.error('加载现有对话失败:', error);
      this.dialogues = [];
    }
  }

  private saveDialogues(): void {
    try {
      fs.writeFileSync(this.currentLogFile, JSON.stringify(this.dialogues, null, 2), 'utf-8');
    } catch (error) {
      console.error('保存对话失败:', error);
    }
  }

  /**
   * 记录对话消息
   * 这个方法可以通过Cursor扩展API调用，或者通过文件系统监听
   */
  public recordDialogue(message: DialogueMessage): void {
    this.dialogues.push(message);
    this.saveDialogues();
    this.emit('dialogue', message);
    console.log(`📝 记录对话: ${message.role} - ${message.content.substring(0, 50)}...`);
  }

  /**
   * 手动添加对话（用于测试或通过API）
   */
  public addDialogue(
    role: 'user' | 'assistant',
    content: string,
    workspace?: string,
    repository?: string,
    conversation_id?: string,
    generation_id?: string
  ): void {
    const message: DialogueMessage = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      role,
      content,
      workspace,
      repository,
      conversation_id,
      generation_id,
    };
    this.recordDialogue(message);
  }

  /**
   * 获取所有对话
   */
  public getAllDialogues(): DialogueMessage[] {
    return this.dialogues;
  }

  /**
   * 获取指定日期的对话
   */
  public getDialoguesByDate(date: string): DialogueMessage[] {
    return this.dialogues.filter(d => {
      const dialogueDate = new Date(d.timestamp).toISOString().split('T')[0];
      return dialogueDate === date;
    });
  }

  /**
   * 获取指定会话的对话
   */
  public getDialoguesByConversation(conversation_id: string): DialogueMessage[] {
    return this.dialogues.filter(d => d.conversation_id === conversation_id);
  }

  /**
   * 获取指定仓库的对话
   */
  public getDialoguesByRepository(repository: string): DialogueMessage[] {
    return this.dialogues.filter(d => d.repository === repository);
  }

  /**
   * 获取所有会话列表
   */
  public getConversations(): Array<{ id: string; repository?: string; workspace?: string; count: number; lastMessage: string }> {
    const conversations = new Map<string, { repository?: string; workspace?: string; messages: DialogueMessage[] }>();
    
    this.dialogues.forEach(d => {
      if (d.conversation_id) {
        if (!conversations.has(d.conversation_id)) {
          conversations.set(d.conversation_id, {
            repository: d.repository,
            workspace: d.workspace,
            messages: [],
          });
        }
        conversations.get(d.conversation_id)!.messages.push(d);
      }
    });

    return Array.from(conversations.entries()).map(([id, data]) => ({
      id,
      repository: data.repository,
      workspace: data.workspace,
      count: data.messages.length,
      lastMessage: data.messages[data.messages.length - 1]?.timestamp || '',
    })).sort((a, b) => b.lastMessage.localeCompare(a.lastMessage));
  }

  /**
   * 获取所有仓库列表
   */
  public getRepositories(): Array<{ name: string; count: number }> {
    const repos = new Map<string, number>();
    
    this.dialogues.forEach(d => {
      if (d.repository) {
        repos.set(d.repository, (repos.get(d.repository) || 0) + 1);
      }
    });

    return Array.from(repos.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }

  /**
   * 启动监听（这里可以监听Cursor的对话文件或API）
   */
  public start(): void {
    console.log('🎯 对话记录器已启动');
    // 这里可以添加监听Cursor对话的逻辑
    // 例如：监听Cursor的对话日志文件，或通过Cursor扩展API
    this.setupCursorListener();
  }

  /**
   * 设置Cursor监听器
   * 注意：这需要根据Cursor的实际API或文件位置进行调整
   */
  private setupCursorListener(): void {
    // 方案1: 监听Cursor的对话日志文件（如果存在）
    // 需要找到Cursor存储对话的位置
    const possiblePaths = [
      path.join(process.env.HOME || '', '.cursor', 'logs'),
      path.join(process.env.HOME || '', 'Library', 'Application Support', 'Cursor', 'logs'),
    ];

    // 方案2: 通过HTTP API接收对话（需要Cursor扩展支持）
    // 这里我们提供一个API端点供扩展调用
  }

  /**
   * 获取对话统计信息
   */
  public getStats(): { total: number; byDate: Record<string, number> } {
    const byDate: Record<string, number> = {};
    this.dialogues.forEach(d => {
      const date = new Date(d.timestamp).toISOString().split('T')[0];
      byDate[date] = (byDate[date] || 0) + 1;
    });
    return {
      total: this.dialogues.length,
      byDate,
    };
  }
}

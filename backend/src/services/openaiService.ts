import OpenAI from 'openai';
import { DialogueMessage } from './dialogueRecorder';

export class OpenAIService {
  private client: OpenAI | null = null;

  constructor() {
    // 支持多种配置方式
    const apiKey = process.env.OPENAI_API_KEY || process.env.AI_API_KEY;
    const baseURL = process.env.OPENAI_BASE_URL || process.env.AI_BASE_URL;
    const model = process.env.AI_MODEL || 'gpt-4';

    if (apiKey) {
      const config: any = {
        apiKey,
        ...(baseURL && { baseURL }),
      };
      this.client = new OpenAI(config);
      console.log(`✅ AI服务已配置: ${baseURL || 'OpenAI默认'} (模型: ${model})`);
    } else {
      console.warn('⚠️  未设置 AI API Key，将使用模拟分析功能');
      console.warn('   提示: 可以设置 OPENAI_API_KEY 或 AI_API_KEY 来启用AI分析');
    }
  }

  /**
   * 分析对话并生成每日总结
   */
  public async analyzeDialogues(dialogues: DialogueMessage[], date: string): Promise<string> {
    if (!this.client) {
      return this.generateMockSummary(dialogues, date);
    }

    try {
      // 构建对话上下文（不包含时间和用户信息）
      const dialogueText = dialogues.map(d => d.content).join('\n\n');

      // 提取知识点
      const knowledgePoints = await this.extractKnowledgePoints(dialogues);

      // 生成总结
      const prompt = `请分析以下对话记录，生成一份详细的每日总结报告。

日期: ${date}
对话总数: ${dialogues.length}

对话内容:
${dialogueText}

请按照以下格式生成Markdown格式的总结：

# ${date} 对话总结

## 📊 概览
- 对话总数: ${dialogues.length}
- 用户消息: ${dialogues.filter(d => d.role === 'user').length}
- AI回复: ${dialogues.filter(d => d.role === 'assistant').length}

## 🎯 主要话题
列出今天讨论的主要话题和问题（只列出话题内容，不需要时间戳和用户标识）

## 💡 知识点总结
${knowledgePoints.map(kp => `### ${kp.title}\n${kp.content}`).join('\n\n')}

## 🔍 关键洞察
总结今天对话中的关键洞察和建议

**重要要求：**
- 不要包含任何时间信息
- 不要包含"用户"、"AI"等角色标识
- 只关注内容本身，以知识点的形式呈现
- 用中文生成，格式要清晰易读`;

      const model = process.env.AI_MODEL || 'gpt-4';
      const completion = await this.client.chat.completions.create({
        model,
        messages: [
          {
            role: 'system',
            content: '你是一个专业的对话分析助手，擅长从对话中提取关键信息、知识点和洞察。',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
      });

      return completion.choices[0]?.message?.content || this.generateMockSummary(dialogues, date);
    } catch (error) {
      console.error('OpenAI API调用失败:', error);
      return this.generateMockSummary(dialogues, date);
    }
  }

  /**
   * 提取知识点
   */
  private async extractKnowledgePoints(dialogues: DialogueMessage[]): Promise<Array<{ title: string; content: string }>> {
    if (!this.client) {
      return this.extractMockKnowledgePoints(dialogues);
    }

    try {
      const dialogueText = dialogues
        .filter(d => d.role === 'assistant')
        .map(d => d.content)
        .join('\n\n');

      const prompt = `从以下AI回复中提取重要的知识点，每个知识点需要包含：
1. 标题（简洁明了）
2. 详细内容（包括定义、用法、示例等）

AI回复内容:
${dialogueText}

请以JSON格式返回，必须是一个包含knowledgePoints数组的对象，格式：
{
  "knowledgePoints": [
    {
      "title": "知识点标题",
      "content": "详细内容..."
    }
  ]
}`;

      const model = process.env.AI_MODEL || 'gpt-4';
      const completion = await this.client.chat.completions.create({
        model,
        messages: [
          {
            role: 'system',
            content: '你是一个专业的知识点提取助手，擅长从技术对话中提取和整理知识点。请始终返回有效的JSON格式。',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.5,
        response_format: { type: 'json_object' },
      });

      const response = completion.choices[0]?.message?.content;
      if (response) {
        try {
          const parsed = JSON.parse(response);
          return Array.isArray(parsed.knowledgePoints) ? parsed.knowledgePoints : [];
        } catch (e) {
          console.error('解析知识点JSON失败:', e);
          return [];
        }
      }
    } catch (error) {
      console.error('提取知识点失败:', error);
    }

    return this.extractMockKnowledgePoints(dialogues);
  }

  /**
   * 生成模拟总结（当没有API Key时）
   */
  private generateMockSummary(dialogues: DialogueMessage[], date: string): string {
    const userMessages = dialogues.filter(d => d.role === 'user');
    const aiMessages = dialogues.filter(d => d.role === 'assistant');

    // 提取主要话题（从用户消息中）
    const topics = userMessages.map(m => m.content).join('\n\n');

    // 提取知识点（从AI回复中）
    const knowledgePoints = aiMessages.map(m => m.content).join('\n\n');

    return `# ${date} 对话总结

## 📊 概览
- 对话总数: ${dialogues.length}
- 用户消息: ${userMessages.length}
- AI回复: ${aiMessages.length}

## 🎯 主要话题

${topics}

## 💡 知识点总结

${knowledgePoints}

## 🔍 关键洞察

基于今天的对话内容，主要关注了以下技术主题和学习要点。这些对话涵盖了前端开发、性能优化和编程基础等重要内容。

---
*注: 这是模拟总结，请设置 OPENAI_API_KEY 环境变量以启用AI分析功能*
`;
  }

  /**
   * 提取模拟知识点
   */
  private extractMockKnowledgePoints(dialogues: DialogueMessage[]): Array<{ title: string; content: string }> {
    // 简单的关键词提取
    const keywords = new Set<string>();
    dialogues.forEach(d => {
      const words = d.content.match(/\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b/g);
      if (words) {
        words.forEach(w => keywords.add(w));
      }
    });

    return Array.from(keywords).slice(0, 5).map(kw => ({
      title: kw,
      content: `关于 ${kw} 的讨论和说明`,
    }));
  }
}

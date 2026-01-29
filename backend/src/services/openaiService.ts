import OpenAI from 'openai';
import { DialogueMessage } from './dialogueRecorder';

export class OpenAIService {
  private client: OpenAI | null = null;

  constructor() {
    // 支持多种配置方式
    const apiKey = process.env.OPENAI_API_KEY || process.env.AI_API_KEY;
    let baseURL = process.env.OPENAI_BASE_URL || process.env.AI_BASE_URL;
    const model = process.env.AI_MODEL || 'gpt-4';

    // 检查是否使用本地 LLM (Ollama)
    const useLocalLLM = process.env.USE_LOCAL_LLM === 'true' || process.env.OLLAMA_BASE_URL;
    if (useLocalLLM && !baseURL) {
      baseURL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434/v1';
      console.log('🔧 检测到本地 LLM 配置，将使用本地模型');
    }

    if (apiKey || useLocalLLM) {
      const config: any = {
        apiKey: apiKey || 'ollama', // Ollama 不需要真实的 API Key
        ...(baseURL && { baseURL }),
      };
      this.client = new OpenAI(config);
      const serviceName = useLocalLLM ? '本地 LLM (Ollama)' : (baseURL || 'OpenAI默认');
      console.log(`✅ AI服务已配置: ${serviceName} (模型: ${model})`);
    } else {
      console.warn('⚠️  未设置 AI API Key，将使用智能模拟分析功能');
      console.warn('   提示: 可以设置以下选项之一来启用AI分析:');
      console.warn('   1. OPENAI_API_KEY 或 AI_API_KEY - 使用云端AI服务');
      console.warn('   2. USE_LOCAL_LLM=true 和 OLLAMA_BASE_URL - 使用本地LLM (如Ollama)');
      console.warn('   3. 不设置 - 使用智能模拟分析（基于规则和模式匹配）');
    }
  }

  /**
   * 分析对话并生成每日总结
   */
  public async analyzeDialogues(dialogues: DialogueMessage[], date: string): Promise<string> {
    // 如果没有配置客户端，使用智能模拟分析
    if (!this.client) {
      return this.generateMockSummary(dialogues, date);
    }
    
    // 尝试使用 AI 服务，失败时回退到智能模拟分析

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

      const model = process.env.AI_MODEL || (process.env.USE_LOCAL_LLM ? 'llama2' : 'gpt-4');
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

      const result = completion.choices[0]?.message?.content;
      if (result && result.trim().length > 100) {
        return result;
      } else {
        console.warn('AI返回内容过短，使用智能模拟分析');
        return this.generateMockSummary(dialogues, date);
      }
    } catch (error) {
      console.error('AI API调用失败，回退到智能模拟分析:', error);
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

      const model = process.env.AI_MODEL || (process.env.USE_LOCAL_LLM ? 'llama2' : 'gpt-4');
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
        ...(process.env.USE_LOCAL_LLM ? {} : { response_format: { type: 'json_object' } }),
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
   * 生成智能模拟总结（当没有API Key时）
   * 使用规则和模式匹配来生成更智能的总结
   */
  private generateMockSummary(dialogues: DialogueMessage[], date: string): string {
    const userMessages = dialogues.filter(d => d.role === 'user');
    const aiMessages = dialogues.filter(d => d.role === 'assistant');

    // 智能提取主要话题
    const topics = this.extractTopics(userMessages);
    
    // 智能提取知识点
    const knowledgePoints = this.extractSmartKnowledgePoints(aiMessages);
    
    // 生成关键洞察
    const insights = this.generateInsights(dialogues);

    return `# ${date} 对话总结

## 📊 概览
- 对话总数: ${dialogues.length}
- 用户消息: ${userMessages.length}
- AI回复: ${aiMessages.length}

## 🎯 主要话题

${topics.map((topic, i) => `${i + 1}. ${topic}`).join('\n')}

## 💡 知识点总结

${knowledgePoints.map((kp, i) => `### ${i + 1}. ${kp.title}\n\n${kp.content}`).join('\n\n')}

## 🔍 关键洞察

${insights}

---
*注: 这是基于规则和模式匹配的智能分析总结。设置 OPENAI_API_KEY 环境变量可获得更准确的AI分析*
`;
  }

  /**
   * 提取模拟知识点（改进版）
   */
  private extractMockKnowledgePoints(dialogues: DialogueMessage[]): Array<{ title: string; content: string }> {
    return this.extractSmartKnowledgePoints(
      dialogues.filter(d => d.role === 'assistant')
    );
  }

  /**
   * 智能提取话题
   */
  private extractTopics(userMessages: DialogueMessage[]): string[] {
    const topics = new Set<string>();
    
    userMessages.forEach(msg => {
      const content = msg.content;
      
      // 提取问题（以问号结尾的句子）
      const questions = content.match(/[^。！？]*[？?]/g);
      if (questions) {
        questions.forEach(q => {
          const cleanQ = q.trim().replace(/[？?]/g, '').substring(0, 100);
          if (cleanQ.length > 5) {
            topics.add(cleanQ);
          }
        });
      }
      
      // 提取关键短语（包含技术关键词）
      const techKeywords = ['实现', '如何', '为什么', '怎么', '优化', '修复', '创建', '添加', '修改', '设计'];
      techKeywords.forEach(keyword => {
        const regex = new RegExp(`[^。！？]*${keyword}[^。！？]*`, 'g');
        const matches = content.match(regex);
        if (matches) {
          matches.forEach(m => {
            const clean = m.trim().substring(0, 80);
            if (clean.length > 5) {
              topics.add(clean);
            }
          });
        }
      });
    });
    
    return Array.from(topics).slice(0, 10);
  }

  /**
   * 智能提取知识点
   */
  private extractSmartKnowledgePoints(aiMessages: DialogueMessage[]): Array<{ title: string; content: string }> {
    const knowledgePoints: Array<{ title: string; content: string }> = [];
    const seenTitles = new Set<string>();
    
    aiMessages.forEach(msg => {
      const content = msg.content;
      
      // 提取代码块和说明
      const codeBlocks = content.match(/```[\s\S]*?```/g);
      if (codeBlocks) {
        codeBlocks.forEach((block, idx) => {
          const lines = block.split('\n');
          const lang = lines[0]?.replace(/```/, '').trim() || '代码';
          const code = lines.slice(1, -1).join('\n');
          
          // 查找代码块前的说明
          const beforeBlock = content.substring(0, content.indexOf(block));
          const explanation = beforeBlock.split('\n').slice(-3).join(' ').trim();
          
          const title = `${lang} 示例 ${idx + 1}`;
          if (!seenTitles.has(title) && code.length > 20) {
            seenTitles.add(title);
            knowledgePoints.push({
              title,
              content: explanation || `关于 ${lang} 的代码示例:\n\n\`\`\`${lang}\n${code}\n\`\`\``
            });
          }
        });
      }
      
      // 提取列表项（通常包含知识点）
      const listItems = content.match(/^[-*•]\s+.+$/gm);
      if (listItems && listItems.length > 2) {
        const title = '要点总结';
        if (!seenTitles.has(title)) {
          seenTitles.add(title);
          knowledgePoints.push({
            title,
            content: listItems.slice(0, 10).join('\n')
          });
        }
      }
      
      // 提取标题和段落（Markdown格式）
      const headings = content.match(/^#{1,3}\s+.+$/gm);
      if (headings) {
        headings.forEach((heading, idx) => {
          const title = heading.replace(/^#+\s+/, '').trim();
          if (!seenTitles.has(title) && title.length < 50) {
            seenTitles.add(title);
            // 提取标题后的内容
            const headingIndex = content.indexOf(heading);
            const nextHeading = content.substring(headingIndex + heading.length)
              .match(/^#{1,3}\s+.+$/m);
            const endIndex = nextHeading ? content.indexOf(nextHeading[0], headingIndex) : content.length;
            const sectionContent = content.substring(headingIndex + heading.length, endIndex)
              .trim()
              .substring(0, 500);
            
            if (sectionContent.length > 20) {
              knowledgePoints.push({
                title,
                content: sectionContent
              });
            }
          }
        });
      }
    });
    
    // 如果没有提取到知识点，使用关键词方法
    if (knowledgePoints.length === 0) {
      const keywords = new Set<string>();
      aiMessages.forEach(d => {
        // 提取技术术语（大写字母开头的单词组合）
        const techTerms = d.content.match(/\b[A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+)*\b/g);
        if (techTerms) {
          techTerms.forEach(term => {
            if (term.length > 3 && term.length < 30) {
              keywords.add(term);
            }
          });
        }
      });
      
      Array.from(keywords).slice(0, 5).forEach(kw => {
        knowledgePoints.push({
          title: kw,
          content: `关于 ${kw} 的讨论和说明`
        });
      });
    }
    
    return knowledgePoints.slice(0, 8);
  }

  /**
   * 生成关键洞察
   */
  private generateInsights(dialogues: DialogueMessage[]): string {
    const insights: string[] = [];
    
    // 分析对话模式
    const userMessages = dialogues.filter(d => d.role === 'user');
    const aiMessages = dialogues.filter(d => d.role === 'assistant');
    
    // 计算平均消息长度
    const avgUserLength = userMessages.reduce((sum, m) => sum + m.content.length, 0) / userMessages.length || 0;
    const avgAiLength = aiMessages.reduce((sum, m) => sum + m.content.length, 0) / aiMessages.length || 0;
    
    // 分析技术领域
    const techDomains = this.detectTechDomains(dialogues);
    if (techDomains.length > 0) {
      insights.push(`主要涉及的技术领域：${techDomains.join('、')}`);
    }
    
    // 分析问题类型
    const questionTypes = this.analyzeQuestionTypes(userMessages);
    if (questionTypes.length > 0) {
      insights.push(`讨论的问题类型：${questionTypes.join('、')}`);
    }
    
    // 分析学习重点
    if (avgAiLength > 500) {
      insights.push('AI回复较为详细，说明进行了深入的技术讨论和知识传递');
    }
    
    if (userMessages.length > aiMessages.length * 0.8) {
      insights.push('用户提问较多，体现了积极的学习和探索态度');
    }
    
    // 提取常见主题
    const commonThemes = this.extractCommonThemes(dialogues);
    if (commonThemes.length > 0) {
      insights.push(`反复出现的主题：${commonThemes.join('、')}`);
    }
    
    return insights.length > 0 
      ? insights.map((insight, i) => `${i + 1}. ${insight}`).join('\n')
      : '基于今天的对话内容，主要关注了技术学习和问题解决。这些对话涵盖了多个技术主题和实用知识点。';
  }

  /**
   * 检测技术领域
   */
  private detectTechDomains(dialogues: DialogueMessage[]): string[] {
    const domains = new Set<string>();
    const domainKeywords: Record<string, string[]> = {
      '前端开发': ['React', 'Vue', 'Angular', 'JavaScript', 'TypeScript', 'CSS', 'HTML', '组件', '前端'],
      '后端开发': ['Node.js', 'Express', 'API', '数据库', '服务器', '后端', '路由'],
      '数据库': ['数据库', 'SQL', 'MongoDB', 'PostgreSQL', 'MySQL', '查询'],
      'DevOps': ['Docker', '部署', 'CI/CD', '服务器', '环境配置'],
      '算法': ['算法', '数据结构', '排序', '搜索', '复杂度'],
      '设计模式': ['设计模式', '架构', '模式', '最佳实践'],
      '工具使用': ['Git', 'npm', '工具', '配置', '环境'],
    };
    
    const allContent = dialogues.map(d => d.content).join(' ');
    
    Object.entries(domainKeywords).forEach(([domain, keywords]) => {
      const matchCount = keywords.filter(kw => 
        allContent.toLowerCase().includes(kw.toLowerCase())
      ).length;
      if (matchCount >= 2) {
        domains.add(domain);
      }
    });
    
    return Array.from(domains);
  }

  /**
   * 分析问题类型
   */
  private analyzeQuestionTypes(userMessages: DialogueMessage[]): string[] {
    const types = new Set<string>();
    
    userMessages.forEach(msg => {
      const content = msg.content.toLowerCase();
      
      if (content.includes('如何') || content.includes('怎么') || content.includes('how')) {
        types.add('实现方法');
      }
      if (content.includes('为什么') || content.includes('why')) {
        types.add('原因分析');
      }
      if (content.includes('错误') || content.includes('问题') || content.includes('error')) {
        types.add('问题排查');
      }
      if (content.includes('优化') || content.includes('改进') || content.includes('optimize')) {
        types.add('性能优化');
      }
      if (content.includes('创建') || content.includes('添加') || content.includes('create')) {
        types.add('功能开发');
      }
    });
    
    return Array.from(types);
  }

  /**
   * 提取常见主题
   */
  private extractCommonThemes(dialogues: DialogueMessage[]): string[] {
    const wordFreq: Record<string, number> = {};
    const stopWords = new Set(['的', '了', '是', '在', '和', '有', '我', '你', '他', '她', '它', '这', '那', '一个', '可以', '应该', '需要', '如果', '但是', '因为', '所以']);
    
    dialogues.forEach(d => {
      // 提取中文词汇（2-4字）
      const chineseWords = d.content.match(/[\u4e00-\u9fa5]{2,4}/g);
      if (chineseWords) {
        chineseWords.forEach(word => {
          if (!stopWords.has(word) && word.length >= 2) {
            wordFreq[word] = (wordFreq[word] || 0) + 1;
          }
        });
      }
    });
    
    // 返回出现频率最高的词汇
    return Object.entries(wordFreq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([word]) => word);
  }
}

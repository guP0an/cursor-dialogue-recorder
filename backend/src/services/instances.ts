/**
 * 共享服务实例
 * 确保所有服务使用同一个实例，避免数据不同步
 */

import { DialogueRecorder } from './dialogueRecorder';
import { DailyAnalyzer } from './dailyAnalyzer';

// 创建单例实例
export const dialogueRecorder = new DialogueRecorder();
export const dailyAnalyzer = new DailyAnalyzer(dialogueRecorder);

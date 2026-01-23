import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import { apiRoutes } from './routes/api';
import { dialogueRecorder, dailyAnalyzer } from './services/instances';

// 加载环境变量
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use('/api', apiRoutes);

// 启动服务
dialogueRecorder.start();
dailyAnalyzer.start();

app.listen(PORT, () => {
  console.log(`🚀 后端服务运行在 http://localhost:${PORT}`);
  console.log(`📝 对话记录器已启动`);
  console.log(`📊 每日分析器已启动`);
});

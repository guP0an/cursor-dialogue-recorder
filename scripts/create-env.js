/**
 * 创建 .env 文件脚本
 * 帮助用户快速创建环境变量配置文件
 */

const fs = require('fs');
const path = require('path');

const backendDir = path.join(__dirname, '..', 'backend');
const envPath = path.join(backendDir, '.env');
const envExamplePath = path.join(backendDir, '.env.example');

// 检查 .env 文件是否已存在
if (fs.existsSync(envPath)) {
  console.log('⚠️  .env 文件已存在，跳过创建');
  console.log(`   文件位置: ${envPath}`);
  process.exit(0);
}

// 创建 .env.example 文件（如果不存在）
const envExampleContent = `# AI API 配置 (可选)
# 如果不设置，系统会使用智能模拟分析功能（基于规则和模式匹配）
# 设置后可以使用真实的AI分析功能，生成更准确的每日总结

# 方式1: 使用 OpenAI (默认)
OPENAI_API_KEY=your_openai_api_key_here

# 方式2: 使用火山引擎或其他兼容 OpenAI API 的服务
# AI_API_KEY=your_api_key_here
# AI_BASE_URL=https://ark.cn-beijing.volces.com/api/v3
# AI_MODEL=your_model_name

# 方式3: 使用本地 LLM (如 Ollama) - 无需 API Key
# USE_LOCAL_LLM=true
# OLLAMA_BASE_URL=http://localhost:11434/v1
# AI_MODEL=llama2  # 或其他本地模型名称

# 后端服务端口（可选，默认3001）
PORT=3001
`;

if (!fs.existsSync(envExamplePath)) {
  fs.writeFileSync(envExamplePath, envExampleContent, 'utf-8');
  console.log('✅ 已创建 .env.example 文件');
}

// 创建 .env 文件
const envContent = `# AI API 配置 (可选)
# 如果不设置，系统会使用智能模拟分析功能（基于规则和模式匹配）
# 设置后可以使用真实的AI分析功能，生成更准确的每日总结

# 方式1: 使用 OpenAI (默认)
# 获取 API Key: https://platform.openai.com/api-keys
OPENAI_API_KEY=

# 方式2: 使用火山引擎或其他兼容 OpenAI API 的服务
# AI_API_KEY=db0c94c8-0d7a-4ad0-855d-93b9b7d01bc4
# AI_BASE_URL=https://ark.cn-beijing.volces.com/api/v3
# AI_MODEL=your_model_name

# 方式3: 使用本地 LLM (如 Ollama) - 无需 API Key
# 首先安装 Ollama: https://ollama.ai
# 然后运行: ollama pull llama2
# USE_LOCAL_LLM=true
# OLLAMA_BASE_URL=http://localhost:11434/v1
# AI_MODEL=llama2

# 后端服务端口（可选，默认3001）
PORT=3001
`;

fs.writeFileSync(envPath, envContent, 'utf-8');
console.log('✅ 已创建 .env 文件');
console.log(`   文件位置: ${envPath}`);
console.log('');
console.log('📝 下一步：');
console.log('   1. 编辑 backend/.env 文件');
console.log('   2. 如果需要使用AI分析功能，填入你的 OPENAI_API_KEY');
console.log('   3. 如果不需要AI分析，可以留空（系统会使用模拟分析）');
console.log('');
console.log('💡 提示：');
console.log('   - 不配置 API Key 也能正常使用所有功能（使用智能模拟分析）');
console.log('   - 智能模拟分析会自动提取话题、知识点和关键洞察');
console.log('   - 配置后可以获得更智能的AI分析和知识点提取');
console.log('   - 支持 OpenAI、火山引擎和本地 LLM (Ollama)');
console.log('   - OpenAI API Key: https://platform.openai.com/api-keys');
console.log('');
console.log('🌋 火山引擎配置示例：');
console.log('   AI_API_KEY=db0c94c8-0d7a-4ad0-855d-93b9b7d01bc4');
console.log('   AI_BASE_URL=https://ark.cn-beijing.volces.com/api/v3');
console.log('   AI_MODEL=your_model_name');
console.log('');
console.log('🖥️  本地 LLM (Ollama) 配置示例：');
console.log('   1. 安装 Ollama: https://ollama.ai');
console.log('   2. 运行: ollama pull llama2');
console.log('   3. 在 .env 中设置:');
console.log('      USE_LOCAL_LLM=true');
console.log('      OLLAMA_BASE_URL=http://localhost:11434/v1');
console.log('      AI_MODEL=llama2');

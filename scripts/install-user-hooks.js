#!/usr/bin/env node
/**
 * 安装「用户级」Cursor Hooks，让任意仓库的 Cursor 对话都被记录到本网站
 *
 * 当前项目里的 .cursor/hooks.json 是「项目级」的：
 * - 只有打开「本仓库」时才会记录对话
 * - 你用 Cursor 打开别的仓库时，那个仓库没有我们的 Hook，所以记录不到
 *
 * 运行本脚本后，会在 ~/.cursor/ 下安装用户级 Hook：
 * - 无论打开哪个仓库，对话都会发到本网站后端
 *
 * 使用：在项目根目录执行
 *   node scripts/install-user-hooks.js
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

const HOME = os.homedir();
const CURSOR_DIR = path.join(HOME, '.cursor');
const CURSOR_HOOKS_DIR = path.join(CURSOR_DIR, 'hooks');
const PROJECT_HOOK_SCRIPT = path.join(__dirname, '..', '.cursor', 'hooks', 'record-dialogue.sh');

const USER_HOOKS_JSON = {
  version: 1,
  hooks: {
    beforeSubmitPrompt: [
      { command: './hooks/record-dialogue.sh beforeSubmitPrompt', timeout: 5 }
    ],
    afterAgentResponse: [
      { command: './hooks/record-dialogue.sh afterAgentResponse', timeout: 5 }
    ]
  }
};

function main() {
  console.log('📌 安装用户级 Cursor Hooks（任意仓库的对话都会记录到本网站）\n');

  if (!fs.existsSync(PROJECT_HOOK_SCRIPT)) {
    console.error('❌ 找不到项目内 Hook 脚本:', PROJECT_HOOK_SCRIPT);
    process.exit(1);
  }

  if (!fs.existsSync(CURSOR_DIR)) {
    fs.mkdirSync(CURSOR_DIR, { recursive: true });
  }
  if (!fs.existsSync(CURSOR_HOOKS_DIR)) {
    fs.mkdirSync(CURSOR_HOOKS_DIR, { recursive: true });
  }

  const destScript = path.join(CURSOR_HOOKS_DIR, 'record-dialogue.sh');
  fs.copyFileSync(PROJECT_HOOK_SCRIPT, destScript);
  fs.chmodSync(destScript, 0o755);
  console.log('✅ 已复制 Hook 脚本到:', destScript);

  const hooksJsonPath = path.join(CURSOR_DIR, 'hooks.json');
  fs.writeFileSync(hooksJsonPath, JSON.stringify(USER_HOOKS_JSON, null, 2), 'utf8');
  console.log('✅ 已写入用户级配置:', hooksJsonPath);

  console.log('\n📋 说明：');
  console.log('  - 用户级 Hook 会对「所有用 Cursor 打开的仓库」生效');
  console.log('  - 请重启 Cursor 后，在任意仓库里提问测试');
  console.log('  - 后端需运行在 http://localhost:3001，否则设置 CURSOR_DIALOGUE_API_BASE');
  console.log('\n查看后台数据：');
  console.log('  - 文件：backend/data/dialogues/current.json');
  console.log('  - 接口：GET http://localhost:3001/api/dialogues');
  console.log('  - 页面：http://localhost:3000');
}

main();

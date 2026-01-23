/**
 * 添加测试数据脚本
 * 用于测试系统功能
 */

const axios = require('axios');

const API_BASE = 'http://localhost:3001/api';

const testDialogues = [
  {
    role: 'user',
    content: '如何创建一个React组件？',
    workspace: '/Users/test/project',
    repository: 'my-project',
  },
  {
    role: 'assistant',
    content: '要创建一个React组件，你可以使用函数式组件或类组件。函数式组件是推荐的方式：\n\n```jsx\nfunction MyComponent() {\n  return <div>Hello World</div>;\n}\n```\n\n或者使用箭头函数：\n\n```jsx\nconst MyComponent = () => {\n  return <div>Hello World</div>;\n};\n```',
    workspace: '/Users/test/project',
    repository: 'my-project',
  },
  {
    role: 'user',
    content: 'TypeScript中的泛型是什么？',
    workspace: '/Users/test/project',
    repository: 'my-project',
  },
  {
    role: 'assistant',
    content: 'TypeScript中的泛型（Generics）是一种创建可重用组件的工具，它允许你创建可以处理多种数据类型的组件，而不是单一的数据类型。\n\n基本语法：\n```typescript\nfunction identity<T>(arg: T): T {\n  return arg;\n}\n```\n\n这里的 `<T>` 是类型变量，可以在函数中使用。',
    workspace: '/Users/test/project',
    repository: 'my-project',
  },
  {
    role: 'user',
    content: '如何优化React应用的性能？',
    workspace: '/Users/test/project',
    repository: 'my-project',
  },
  {
    role: 'assistant',
    content: '优化React应用性能的几种方法：\n\n1. **使用React.memo**: 防止不必要的重新渲染\n2. **使用useMemo和useCallback**: 缓存计算结果和函数\n3. **代码分割**: 使用React.lazy和Suspense\n4. **虚拟化长列表**: 使用react-window或react-virtualized\n5. **优化状态管理**: 避免不必要的状态更新',
    workspace: '/Users/test/project',
    repository: 'my-project',
  },
];

async function addTestData() {
  console.log('📝 开始添加测试数据...\n');

  for (let i = 0; i < testDialogues.length; i++) {
    const dialogue = testDialogues[i];
    try {
      await axios.post(`${API_BASE}/dialogues`, dialogue);
      console.log(`✅ [${i + 1}/${testDialogues.length}] 已添加: ${dialogue.role} - ${dialogue.content.substring(0, 50)}...`);
      
      // 添加延迟，模拟真实对话
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.error(`❌ 添加失败:`, error.message);
    }
  }

  console.log('\n✨ 测试数据添加完成！');
  console.log(`访问 http://localhost:3000 查看对话记录`);
}

// 检查后端是否运行
axios.get(`${API_BASE}/stats`)
  .then(() => {
    addTestData();
  })
  .catch((error) => {
    console.error('❌ 无法连接到后端服务！');
    console.error('请确保后端服务正在运行: npm run dev:backend');
    process.exit(1);
  });

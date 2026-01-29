import { useState, useEffect } from 'react';
import './ThemeToggle.css';

export function ThemeToggle() {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    // 从 localStorage 读取保存的主题，如果没有则默认使用亮色模式
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    return savedTheme || 'light';
  });

  useEffect(() => {
    // 应用主题到 document
    if (theme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
    // 保存到 localStorage
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  return (
    <button 
      className="theme-toggle"
      onClick={toggleTheme}
      title={theme === 'light' ? '切换到暗色模式' : '切换到亮色模式'}
      aria-label={theme === 'light' ? '切换到暗色模式' : '切换到亮色模式'}
    >
      <span className="theme-icon">
        {theme === 'light' ? '🌙' : '☀️'}
      </span>
      {/* <span className="theme-text"></span> */}
    </button>
  );
}

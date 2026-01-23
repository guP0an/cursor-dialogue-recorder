import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import { ResizableSidebar } from './ResizableSidebar';
import './SummaryView.css';

const API_BASE = '/api';

interface TocItem {
  id: string;
  text: string;
  level: number;
}

function SummaryView() {
  const { date } = useParams<{ date: string }>();
  const navigate = useNavigate();
  const [summary, setSummary] = useState<string>('');
  const [summaryFiles, setSummaryFiles] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tocVisible, setTocVisible] = useState(false);

  // 从 Markdown 内容中提取目录
  const toc = useMemo(() => {
    if (!summary) return [];
    
    const lines = summary.split('\n');
    const tocItems: TocItem[] = [];
    
    lines.forEach((line) => {
      const match = line.match(/^(#{1,3})\s+(.+)$/);
      if (match) {
        const level = match[1].length;
        let text = match[2].trim();
        // 移除 emoji 用于显示，但保留原始文本
        const displayText = text.replace(/[📊🎯💡🔍]/g, '').trim();
        // 生成 ID（移除 emoji 和特殊字符）
        const id = text
          .replace(/[📊🎯💡🔍]/g, '')
          .replace(/[^\w\s\u4e00-\u9fa5-]/g, '')
          .replace(/\s+/g, '-')
          .toLowerCase();
        if (id) {
          tocItems.push({ id, text: displayText || text, level });
        }
      }
    });
    
    return tocItems;
  }, [summary]);

  // 滚动到指定标题
  const scrollToHeading = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  useEffect(() => {
    loadSummaryFiles();
  }, []);

  useEffect(() => {
    if (date) {
      loadSummary(date);
    } else if (summaryFiles.length > 0) {
      // 如果没有指定日期，跳转到最新的总结
      const latestDate = summaryFiles[0].replace('.md', '');
      navigate(`/summaries/${latestDate}`, { replace: true });
    }
  }, [date, summaryFiles, navigate]);

  const loadSummaryFiles = async () => {
    try {
      const response = await axios.get(`${API_BASE}/summaries`);
      setSummaryFiles(response.data.data);
      setLoading(false);
    } catch (err) {
      console.error('加载总结列表失败:', err);
      setLoading(false);
    }
  };

  const loadSummary = async (dateStr: string) => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE}/summaries/${dateStr}`);
      setSummary(response.data.data);
      setError(null);
    } catch (err) {
      setError('加载总结失败');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDateClick = (file: string) => {
    const dateStr = file.replace('.md', '');
    navigate(`/summaries/${dateStr}`);
  };

  if (loading && !date) {
    return <div className="loading">加载中...</div>;
  }

  return (
    <div className="summary-view">
      <ResizableSidebar
        defaultWidth={280}
        minWidth={200}
        maxWidth={400}
        collapsedWidth={60}
        position="left"
        className="summary-sidebar-wrapper"
      >
        <div className="summary-sidebar">
          <div className="sidebar-header">
            <h3>每日总结</h3>
          </div>
          <nav className="summary-date-nav">
            {summaryFiles.length === 0 ? (
              <div className="empty-dates">暂无总结</div>
            ) : (
              summaryFiles.map((file) => {
                const dateStr = file.replace('.md', '');
                const isActive = dateStr === date;
                return (
                  <button
                    key={dateStr}
                    className={`date-item ${isActive ? 'active' : ''}`}
                    onClick={() => handleDateClick(file)}
                    title={dateStr}
                  >
                    <span className="date-icon">📅</span>
                    <span className="date-text">{dateStr}</span>
                  </button>
                );
              })
            )}
          </nav>
        </div>
      </ResizableSidebar>
      <main className="summary-main-content">
        <div className="card">
          <div className="summary-header">
            <h2>{date || '选择日期'} 对话总结</h2>
            {summary && toc.length > 0 && (
              <button
                className="toc-toggle-btn"
                onClick={() => setTocVisible(!tocVisible)}
                title={tocVisible ? '隐藏目录' : '显示目录'}
              >
                {tocVisible ? '✕' : '📑'}
              </button>
            )}
          </div>
          {error && <div className="error">{error}</div>}
          {summary ? (
            <div className="summary-content">
              <ReactMarkdown
                components={{
                  h1: ({ node, children, ...props }) => {
                    const text = String(children);
                    const id = text
                      .replace(/[📊🎯💡🔍]/g, '')
                      .replace(/[^\w\s\u4e00-\u9fa5-]/g, '')
                      .replace(/\s+/g, '-')
                      .toLowerCase();
                    return <h1 id={id} {...props}>{children}</h1>;
                  },
                  h2: ({ node, children, ...props }) => {
                    const text = String(children);
                    const id = text
                      .replace(/[📊🎯💡🔍]/g, '')
                      .replace(/[^\w\s\u4e00-\u9fa5-]/g, '')
                      .replace(/\s+/g, '-')
                      .toLowerCase();
                    return <h2 id={id} {...props}>{children}</h2>;
                  },
                  h3: ({ node, children, ...props }) => {
                    const text = String(children);
                    const id = text
                      .replace(/[📊🎯💡🔍]/g, '')
                      .replace(/[^\w\s\u4e00-\u9fa5-]/g, '')
                      .replace(/\s+/g, '-')
                      .toLowerCase();
                    return <h3 id={id} {...props}>{children}</h3>;
                  },
                }}
              >
                {summary}
              </ReactMarkdown>
            </div>
          ) : date ? (
            <div className="empty-state">
              <p>该日期的总结尚未生成</p>
            </div>
          ) : (
            <div className="empty-state">
              <p>请从侧边栏选择一个日期</p>
            </div>
          )}
        </div>
      </main>
      {summary && toc.length > 0 && tocVisible && (
        <aside className="toc-sidebar-wrapper">
          <div className="toc-sidebar">
            <div className="sidebar-header">
              <h3>目录</h3>
            </div>
            <nav className="toc-nav">
              {toc.map((item) => (
                <button
                  key={item.id}
                  className={`toc-item level-${item.level}`}
                  onClick={() => scrollToHeading(item.id)}
                  title={item.text}
                >
                  {item.text}
                </button>
              ))}
            </nav>
          </div>
        </aside>
      )}
    </div>
  );
}

export default SummaryView;

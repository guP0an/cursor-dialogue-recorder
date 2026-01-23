import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './SummaryList.css';

const API_BASE = '/api';

function SummaryList() {
  const [summaries, setSummaries] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSummaries();
  }, []);

  const loadSummaries = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE}/summaries`);
      setSummaries(response.data.data);
      setError(null);
    } catch (err) {
      setError('加载总结列表失败');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">加载中...</div>;
  }

  return (
    <div className="summary-list">
      <div className="card">
        <h2>每日总结</h2>
        {error && <div className="error">{error}</div>}
        {summaries.length === 0 ? (
          <div className="empty-state">
            <p>暂无总结文件</p>
            <p className="hint">系统会在每天早上8点自动分析昨天的对话并生成总结</p>
          </div>
        ) : (
          <div className="summaries-grid">
            {summaries.map((file) => {
              const date = file.replace('.md', '');
              return (
                <Link
                  key={date}
                  to={`/summaries/${date}`}
                  className="summary-card"
                >
                  <div className="summary-date">{date}</div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default SummaryList;

import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import './SummaryView.css';

const API_BASE = '/api';

function SummaryView() {
  const { date } = useParams<{ date: string }>();
  const [summary, setSummary] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (date) {
      loadSummary(date);
    }
  }, [date]);

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

  if (loading) {
    return <div className="loading">加载中...</div>;
  }

  return (
    <div className="summary-view">
      <div className="card">
        <div className="summary-header">
          <Link to="/summaries" className="back-link">
            ← 返回列表
          </Link>
          <h2>{date} 对话总结</h2>
        </div>
        {error && <div className="error">{error}</div>}
        {summary ? (
          <div className="summary-content">
            <ReactMarkdown>{summary}</ReactMarkdown>
          </div>
        ) : (
          <div className="empty-state">
            <p>该日期的总结尚未生成</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default SummaryView;

import { useState, useEffect } from 'react';
import axios from 'axios';
import './Stats.css';

const API_BASE = '/api';

interface StatsData {
  total: number;
  byDate: Record<string, number>;
}

function Stats() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE}/stats`);
      setStats(response.data.data);
      setError(null);
    } catch (err) {
      setError('加载统计信息失败');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">加载中...</div>;
  }

  if (!stats) {
    return <div className="error">无法加载统计信息</div>;
  }

  const dates = Object.keys(stats.byDate).sort().reverse();
  const maxCount = Math.max(...Object.values(stats.byDate), 1);

  return (
    <div className="stats">
      <div className="card">
        <h2>统计信息</h2>
        {error && <div className="error">{error}</div>}
        <div className="stats-overview">
          <div className="stat-card">
            <div className="stat-value">{stats.total}</div>
            <div className="stat-label">总对话数</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{dates.length}</div>
            <div className="stat-label">有记录的天数</div>
          </div>
        </div>
        <div className="stats-details">
          <h3>每日对话统计</h3>
          <div className="stats-list">
            {dates.map((date) => {
              const count = stats.byDate[date];
              const percentage = (count / maxCount) * 100;
              return (
                <div key={date} className="stat-item">
                  <div className="stat-date">{date}</div>
                  <div className="stat-bar-container">
                    <div
                      className="stat-bar"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <div className="stat-count">{count}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Stats;

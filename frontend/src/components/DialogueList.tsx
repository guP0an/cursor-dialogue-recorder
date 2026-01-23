import { useState, useEffect } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import './DialogueList.css';

const API_BASE = '/api';

interface Dialogue {
  id: string;
  timestamp: string;
  role: 'user' | 'assistant';
  content: string;
  workspace?: string;
  repository?: string;
}

function DialogueList() {
  const [dialogues, setDialogues] = useState<Dialogue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterDate, setFilterDate] = useState<string>('');

  useEffect(() => {
    loadDialogues();
  }, [filterDate]);

  const loadDialogues = async () => {
    try {
      setLoading(true);
      const url = filterDate 
        ? `${API_BASE}/dialogues/${filterDate}`
        : `${API_BASE}/dialogues`;
      const response = await axios.get(url);
      setDialogues(response.data.data);
      setError(null);
    } catch (err) {
      setError('加载对话失败');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilterDate(e.target.value);
  };

  const clearFilter = () => {
    setFilterDate('');
  };

  if (loading) {
    return <div className="loading">加载中...</div>;
  }

  return (
    <div className="dialogue-list">
      <div className="card">
        <h2>对话记录</h2>
        <div className="filter-controls">
          <input
            type="date"
            value={filterDate}
            onChange={handleDateChange}
            placeholder="筛选日期"
          />
          {filterDate && (
            <button onClick={clearFilter} className="clear-btn">
              清除筛选
            </button>
          )}
        </div>
        {error && <div className="error">{error}</div>}
        {dialogues.length === 0 ? (
          <div className="empty-state">
            <p>暂无对话记录</p>
            <p className="hint">对话将通过Cursor扩展自动记录</p>
          </div>
        ) : (
          <div className="dialogues">
            {dialogues.map((dialogue) => (
              <div
                key={dialogue.id}
                className={`dialogue-item ${dialogue.role}`}
              >
                <div className="dialogue-header">
                  <span className="role-badge">
                    {dialogue.role === 'user' ? '用户' : 'AI'}
                  </span>
                  <span className="timestamp">
                    {format(new Date(dialogue.timestamp), 'yyyy-MM-dd HH:mm:ss', {
                      locale: zhCN,
                    })}
                  </span>
                  {dialogue.repository && (
                    <span className="repository">{dialogue.repository}</span>
                  )}
                </div>
                <div className="dialogue-content">{dialogue.content}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default DialogueList;

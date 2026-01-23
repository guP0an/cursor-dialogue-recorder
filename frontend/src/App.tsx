import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import './App.css';
import DialogueList from './components/DialogueList';
import SummaryView from './components/SummaryView';
import SummaryList from './components/SummaryList';
import Stats from './components/Stats';

const API_BASE = '/api';

function NavLink({ to, children }: { to: string; children: React.ReactNode }) {
  const location = useLocation();
  const isActive = location.pathname === to || (to !== '/' && location.pathname.startsWith(to));
  
  return (
    <Link to={to} className={isActive ? 'active' : ''}>
      {children}
    </Link>
  );
}

function App() {
  return (
    <Router>
      <div className="app">
        <aside className="app-sidebar">
          <div className="sidebar-header">
            <h1>Cursor 对话记录器</h1>
          </div>
          <nav className="sidebar-nav">
            <NavLink to="/">对话记录</NavLink>
            <NavLink to="/summaries">每日总结</NavLink>
            <NavLink to="/stats">统计信息</NavLink>
          </nav>
        </aside>
        <main className="app-main">
          <Routes>
            <Route path="/" element={<DialogueList />} />
            <Route path="/summaries" element={<SummaryList />} />
            <Route path="/summaries/:date" element={<SummaryView />} />
            <Route path="/stats" element={<Stats />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;

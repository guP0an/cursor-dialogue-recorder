import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import './App.css';
import DialogueList from './components/DialogueList';
import SummaryView from './components/SummaryView';
import Stats from './components/Stats';
import { ResizableSidebar } from './components/ResizableSidebar';
import { ThemeToggle } from './components/ThemeToggle';

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
        <ResizableSidebar
          defaultWidth={200}
          minWidth={200}
          maxWidth={400}
          collapsedWidth={60}
          position="left"
          className="app-sidebar-wrapper"
        >
          <div className="app-sidebar">
            <div className="sidebar-header">
              <h1>Ai 对话记录器</h1>
            </div>
            <nav className="sidebar-nav">
              <NavLink to="/">
                <span className="nav-icon">💬</span>
                <span className="nav-text">对话记录</span>
              </NavLink>
              <NavLink to="/summaries">
                <span className="nav-icon">📄</span>
                <span className="nav-text">每日总结</span>
              </NavLink>
              <NavLink to="/stats">
                <span className="nav-icon">📊</span>
                <span className="nav-text">统计信息</span>
              </NavLink>
            </nav>
            <ThemeToggle />
          </div>
        </ResizableSidebar>
        <main className="app-main">
          <Routes>
            <Route path="/" element={<DialogueList />} />
            <Route path="/summaries" element={<SummaryView />} />
            <Route path="/summaries/:date" element={<SummaryView />} />
            <Route path="/stats" element={<Stats />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;

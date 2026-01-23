import { useState, useRef, useEffect, ReactNode } from 'react';
import './ResizableSidebar.css';

interface ResizableSidebarProps {
  children: ReactNode;
  defaultWidth?: number;
  minWidth?: number;
  maxWidth?: number;
  collapsedWidth?: number;
  position?: 'left' | 'right';
  className?: string;
}

export function ResizableSidebar({
  children,
  defaultWidth = 280,
  minWidth = 200,
  maxWidth = 500,
  collapsedWidth = 60,
  position = 'left',
  className = '',
}: ResizableSidebarProps) {
  const [width, setWidth] = useState(defaultWidth);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const dragStartX = useRef(0);
  const dragStartWidth = useRef(defaultWidth);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;

      const delta = position === 'left' 
        ? e.clientX - dragStartX.current 
        : dragStartX.current - e.clientX;
      
      const newWidth = Math.max(minWidth, Math.min(maxWidth, dragStartWidth.current + delta));
      setWidth(newWidth);
      
      // 实时更新 CSS 变量
      if (className.includes('app-sidebar-wrapper')) {
        document.documentElement.style.setProperty('--main-sidebar-width', `${newWidth}px`);
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isDragging, minWidth, maxWidth, position]);

  const handleDragStart = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    dragStartX.current = e.clientX;
    dragStartWidth.current = width;
  };

  const handleToggle = () => {
    if (isCollapsed) {
      setIsCollapsed(false);
      setWidth(defaultWidth);
    } else {
      setIsCollapsed(true);
      setWidth(collapsedWidth);
    }
  };

  const currentWidth = isCollapsed ? collapsedWidth : width;

  // 更新 CSS 变量以便其他元素使用
  useEffect(() => {
    if (className.includes('app-sidebar-wrapper')) {
      document.documentElement.style.setProperty('--main-sidebar-width', `${currentWidth}px`);
    }
  }, [currentWidth, className]);

  return (
    <aside
      ref={sidebarRef}
      className={`resizable-sidebar ${isCollapsed ? 'collapsed' : ''} ${className}`}
      style={{ 
        width: `${currentWidth}px`,
        '--sidebar-width': `${currentWidth}px`
      } as React.CSSProperties}
    >
      <div className="sidebar-content">
        {children}
      </div>
      <div
        className={`sidebar-resizer ${position}`}
        onMouseDown={handleDragStart}
        title="拖拽调整宽度"
      />
      <button
        className="sidebar-toggle-btn"
        onClick={handleToggle}
        title={isCollapsed ? '展开' : '收起'}
      >
        {isCollapsed ? '→' : '←'}
      </button>
    </aside>
  );
}

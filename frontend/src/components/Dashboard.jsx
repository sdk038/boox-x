import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from './Sidebar';
import AdminPanel from './AdminPanel';
import AIAssistant from './AIAssistant';
import Boards from './Boards';
import Files from './Files';
import Settings from './Settings';
import Profile from './Profile';
import { useAuth } from '../context/AuthContext';
import '../pages/Dashboard.css';

// Маппинг табов на URL-хэши
const TAB_ROUTES = {
  home: 'home',
  boards: 'boards',
  files: 'files',
  profile: 'profile',
  settings: 'settings',
  admin: 'admin',
  ai: 'ai'
};

// Названия страниц для title
const TAB_TITLES = {
  home: 'Главная',
  boards: 'Доски',
  files: 'Файлы',
  profile: 'Профиль',
  settings: 'Настройки',
  admin: 'Админ панель',
  ai: 'AI Ассистент'
};

// Получить таб из хэша URL
const getTabFromHash = () => {
  const hash = window.location.hash.replace('#/', '').replace('#', '');
  return TAB_ROUTES[hash] ? hash : 'boards';
};

const HomeContent = ({ user }) => {
  return (
    <div className="content-section">
      <h1>Добро пожаловать, {user?.name}! 👋</h1>
      <p className="subtitle">Управляйте своими проектами эффективно</p>
      
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-info">
            <h2>24</h2>
            <p>Активных задач</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-info">
            <h2>18</h2>
            <p>Выполнено</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🎯</div>
          <div className="stat-info">
            <h2>4</h2>
            <p>Проектов</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⏱️</div>
          <div className="stat-info">
            <h2>89%</h2>
            <p>Продуктивность</p>
          </div>
        </div>
      </div>

      <div className="recent-activity">
        <h2>Последняя активность</h2>
        <div className="activity-list">
          <div className="activity-item">
            <div className="activity-icon">✅</div>
            <div className="activity-details">
              <p><strong>Задача выполнена:</strong> Создать дизайн логотипа</p>
              <span className="activity-time">2 часа назад</span>
            </div>
          </div>
          <div className="activity-item">
            <div className="activity-icon">📝</div>
            <div className="activity-details">
              <p><strong>Новая задача:</strong> Подготовить презентацию</p>
              <span className="activity-time">4 часа назад</span>
            </div>
          </div>
          <div className="activity-item">
            <div className="activity-icon">💬</div>
            <div className="activity-details">
              <p><strong>Комментарий:</strong> Отличная работа с макетами!</p>
              <span className="activity-time">Вчера</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState(getTabFromHash);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const [isSidebarPinned, setIsSidebarPinned] = useState(false);
  const { user, updateUser } = useAuth();

  // Обновляем URL хэш при смене таба
  const handleTabChange = useCallback((tab) => {
    setActiveTab(tab);
    window.location.hash = `#/${tab}`;
    document.title = `${TAB_TITLES[tab] || 'Daler AI'} — Daler AI`;
  }, []);

  // Слушаем кнопки назад/вперед в браузере
  useEffect(() => {
    const handleHashChange = () => {
      const tab = getTabFromHash();
      setActiveTab(tab);
      document.title = `${TAB_TITLES[tab] || 'Daler AI'} — Daler AI`;
    };

    window.addEventListener('hashchange', handleHashChange);

    // Устанавливаем хэш при первом рендере если его нет
    if (!window.location.hash) {
      window.location.hash = '#/boards';
    }
    document.title = `${TAB_TITLES[activeTab] || 'Daler AI'} — Daler AI`;

    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleUserUpdate = (updatedUser) => {
    if (updateUser) updateUser(updatedUser);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return <HomeContent user={user} />;
      case 'boards':
        return <Boards />;
      case 'files':
        return <Files />;
      case 'profile':
        return <Profile user={user} onUserUpdate={handleUserUpdate} />;
      case 'settings':
        return <Settings user={user} />;
      case 'admin':
        return <AdminPanel />;
      case 'ai':
        return <AIAssistant />;
      default:
        return <Boards />;
    }
  };

  return (
    <div className="dashboard">
      <Sidebar 
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        onExpandChange={setIsSidebarExpanded}
        isPinned={isSidebarPinned}
        onPinToggle={() => setIsSidebarPinned(!isSidebarPinned)}
      />
      <div className={`dashboard-content ${(isSidebarExpanded || isSidebarPinned) ? 'sidebar-expanded' : ''}`}>
        {renderContent()}
      </div>
    </div>
  );
};

export default Dashboard;

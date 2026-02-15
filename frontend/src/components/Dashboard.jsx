import React, { useState } from 'react';
import Sidebar from './Sidebar';
import AdminPanel from './AdminPanel';
import AIAssistant from './AIAssistant';
import Boards from './Boards';
import Files from './Files';
import Settings from './Settings';
import Profile from './Profile';
import { useAuth } from '../context/AuthContext';
import '../pages/Dashboard.css';

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
  const [activeTab, setActiveTab] = useState('boards');
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const [isSidebarPinned, setIsSidebarPinned] = useState(false);
  const { user } = useAuth();

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return <HomeContent user={user} />;
      case 'boards':
        return <Boards />;
      case 'files':
        return <Files />;
      case 'profile':
        return <Profile user={user} />;
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
        setActiveTab={setActiveTab}
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

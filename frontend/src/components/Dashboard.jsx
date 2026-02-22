import React, { useState, useEffect, Suspense, lazy } from 'react';
import Sidebar from './Sidebar';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { trackingAPI, boardsAPI, tasksAPI, filesAPI } from '../services/api';
import '../pages/Dashboard.css';

const AdminPanel = lazy(() => import('./AdminPanel'));
const AIAssistant = lazy(() => import('./AIAssistant'));
const Boards = lazy(() => import('./Boards'));
const Files = lazy(() => import('./Files'));
const Settings = lazy(() => import('./SettingsPage'));
const Presentations = lazy(() => import('./Presentations'));

const TAB_ROUTES = {
  home: 'home',
  boards: 'boards',
  files: 'files',
  presentations: 'presentations',
  settings: 'settings',
  admin: 'admin',
  ai: 'ai'
};

// Получить таб из хэша URL
const getTabFromHash = () => {
  const hash = window.location.hash.replace('#/', '').replace('#', '');
  return TAB_ROUTES[hash] ? hash : 'home';
};

// Время суток для приветствия
const getGreeting = (t) => {
  const hour = new Date().getHours();
  if (hour < 6) return t('dashboard.greetingNight');
  if (hour < 12) return t('dashboard.greetingMorning');
  if (hour < 18) return t('dashboard.greetingDay');
  return t('dashboard.greetingEvening');
};

// Сколько времени прошло
const timeAgo = (date, t, language) => {
  const now = new Date();
  const d = new Date(date);
  const diff = Math.floor((now - d) / 1000);
  if (diff < 60) return t('dashboard.justNow');
  if (diff < 3600) return `${Math.floor(diff / 60)} ${t('dashboard.minAgo')}`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} ${t('dashboard.hoursAgo')}`;
  if (diff < 172800) return t('dashboard.yesterday');
  return d.toLocaleDateString(language === 'en' ? 'en-US' : 'ru-RU');
};

// eslint-disable-next-line no-unused-vars
const getActivityIcon = (action) => {
  const icons = {
    'login': '🔐', 'register': '✨', 'logout': '👋',
    'create_board': '📋', 'update_board': '✏️', 'delete_board': '🗑️',
    'create_task': '➕', 'update_task': '📝', 'delete_task': '❌',
    'upload_file': '📤', 'delete_file': '🗑️',
    'update_profile': '👤', 'update_settings': '⚙️',
    'ai_chat': '🤖', 'ai_generate_project': '🚀',
    'ai_generate_presentation': '📊', 'page_view': '👁️',
    'change_theme': '🎨'
  };
  return icons[action] || '📌';
};

// eslint-disable-next-line no-unused-vars
const getActivityText = (action) => {
  const texts = {
    'login': 'Вход в систему', 'register': 'Регистрация', 'logout': 'Выход из системы',
    'create_board': 'Создана доска', 'update_board': 'Обновлена доска', 'delete_board': 'Удалена доска',
    'create_task': 'Создана задача', 'update_task': 'Обновлена задача', 'delete_task': 'Удалена задача',
    'upload_file': 'Загружен файл', 'delete_file': 'Удалён файл',
    'update_profile': 'Обновлён профиль', 'update_settings': 'Изменены настройки',
    'ai_chat': 'AI чат', 'ai_generate_project': 'AI генерация проекта',
    'ai_generate_presentation': 'AI презентация', 'page_view': 'Просмотр страницы',
    'change_theme': 'Смена темы'
  };
  return texts[action] || action;
};

const HomeContent = ({ user, onNavigate }) => {
  const { t, language } = useLanguage();
  const [stats, setStats] = useState({ boards: 0, tasks: 0, files: 0 });
  const [recentBoards, setRecentBoards] = useState([]);
  const [loading, setLoading] = useState(true);

  const isGuest = !user?.email;

  useEffect(() => {
    if (!isGuest) {
      loadHomeData();
    } else {
      setLoading(false);
    }
  }, [isGuest]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadHomeData = async () => {
    try {
      const [boardsRes, tasksRes, filesRes] = await Promise.all([
        boardsAPI.getAll().catch(() => ({ data: { boards: [] } })),
        tasksAPI.getAll().catch(() => ({ data: { tasks: [] } })),
        filesAPI.getAll().catch(() => ({ data: { files: [] } }))
      ]);

      const boards = boardsRes.data.boards || boardsRes.data || [];
      const tasks = tasksRes.data.tasks || tasksRes.data || [];
      const files = filesRes.data.files || filesRes.data || [];

      setStats({
        boards: Array.isArray(boards) ? boards.length : 0,
        tasks: Array.isArray(tasks) ? tasks.length : 0,
        files: Array.isArray(files) ? files.length : 0
      });

      if (Array.isArray(boards)) {
        setRecentBoards(boards.slice(0, 3));
      }
    } catch (error) {
      console.error('Ошибка загрузки данных:', error);
    } finally {
      setLoading(false);
    }
  };

  const features = [
    {
      icon: '📋',
      title: language === 'en' ? 'Kanban boards' : 'Канбан доски',
      description: language === 'en' ? 'Create projects and manage tasks with flexible Kanban boards' : 'Создавайте проекты, управляйте задачами с помощью удобных Kanban-досок',
      action: 'boards',
      color: '#4066ff'
    },
    {
      icon: '🤖',
      title: language === 'en' ? 'AI Assistant' : 'AI Ассистент',
      description: language === 'en' ? 'Generate projects, tasks, presentations and get answers with AI' : 'Генерация проектов, задач, презентаций и ответов на любые вопросы через AI',
      action: 'ai',
      color: '#8b5cf6'
    },
    {
      icon: '📁',
      title: language === 'en' ? 'File storage' : 'Файловое хранилище',
      description: language === 'en' ? 'Upload and keep your project files in one place' : 'Загружайте и храните файлы ваших проектов в одном месте',
      action: 'files',
      color: '#10b981'
    },
    {
      icon: '⚙️',
      title: t('settings.title'),
      description: language === 'en' ? 'Customize theme, notifications and language' : 'Настройте тему, уведомления и язык — всё под вас',
      action: 'settings',
      color: '#f59e0b'
    }
  ];

  return (
    <div className="content-section">
      {/* Welcome Banner */}
      <div className="home-welcome-banner">
        <div className="home-welcome-text">
          <h1>{getGreeting(t)}, {user?.name}! 👋</h1>
          <p className="subtitle">{t('dashboard.subtitle')}</p>
        </div>
        <div className="home-welcome-date">
          {new Date().toLocaleDateString(language === 'en' ? 'en-US' : 'ru-RU', {
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </div>
      </div>

      {/* Real Stats */}
      <div className="home-stats-grid">
        <div className="home-stat-card" onClick={() => onNavigate('boards')}>
          <div className="home-stat-icon" style={{ background: 'linear-gradient(135deg, #4066ff, #6d5bfa)' }}>📋</div>
          <div className="home-stat-info">
            <h2>{loading ? '...' : stats.boards}</h2>
            <p>{t('dashboard.boardsCount')}</p>
          </div>
        </div>
        <div className="home-stat-card" onClick={() => onNavigate('boards')}>
          <div className="home-stat-icon" style={{ background: 'linear-gradient(135deg, #10b981, #34d399)' }}>✅</div>
          <div className="home-stat-info">
            <h2>{loading ? '...' : stats.tasks}</h2>
            <p>{t('dashboard.tasksCount')}</p>
          </div>
        </div>
        <div className="home-stat-card" onClick={() => onNavigate('files')}>
          <div className="home-stat-icon" style={{ background: 'linear-gradient(135deg, #f59e0b, #fbbf24)' }}>📁</div>
          <div className="home-stat-info">
            <h2>{loading ? '...' : stats.files}</h2>
            <p>{t('dashboard.filesCount')}</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="home-quick-actions">
        <button className="home-quick-btn" onClick={() => onNavigate('boards')}>
          <span>📋</span> {t('dashboard.createBoard')}
        </button>
        <button className="home-quick-btn" onClick={() => onNavigate('ai')}>
          <span>🤖</span> {t('dashboard.askAI')}
        </button>
        <button className="home-quick-btn" onClick={() => onNavigate('files')}>
          <span>📤</span> {t('dashboard.uploadFile')}
        </button>
        <button className="home-quick-btn" onClick={() => onNavigate('settings')}>
          <span>⚙️</span> {t('settings.title')}
        </button>
      </div>

      {/* Features Section */}
      <div className="home-section-title">
        <h2>{t('dashboard.whatCanDo')}</h2>
        <p>{t('dashboard.whatCanDoDesc')}</p>
      </div>

      <div className="home-features-grid">
        {features.map((feature, i) => (
          <div 
            key={i} 
            className="home-feature-card"
            onClick={() => onNavigate(feature.action)}
          >
            <div className="home-feature-icon" style={{ background: feature.color + '18', color: feature.color }}>
              {feature.icon}
            </div>
            <div className="home-feature-content">
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </div>
            <div className="home-feature-arrow">→</div>
          </div>
        ))}
      </div>

      {/* Recent Boards */}
      {recentBoards.length > 0 && (
        <>
          <div className="home-section-title">
            <h2>{t('dashboard.recentProjects')}</h2>
          </div>
          <div className="home-recent-boards">
            {recentBoards.map((board) => (
              <div 
                key={board._id} 
                className="home-board-card"
                onClick={() => onNavigate('boards')}
              >
                <div 
                  className="home-board-color" 
                  style={{ background: board.color || '#4066ff' }}
                />
                <div className="home-board-info">
                  <h4>{board.title || board.name}</h4>
                  <p>{board.description || t('dashboard.noDescription')}</p>
                </div>
                <span className="home-board-date">
                  {timeAgo(board.createdAt || board.updatedAt, t, language)}
                </span>
              </div>
            ))}
            <div 
              className="home-board-card home-board-add"
              onClick={() => onNavigate('boards')}
            >
              <span className="home-board-add-icon">+</span>
              <p>{t('dashboard.createNewProject')}</p>
            </div>
          </div>
        </>
      )}

      {/* AI Promo */}
      <div className="home-ai-promo" onClick={() => onNavigate('ai')}>
        <div className="home-ai-promo-content">
          <div className="home-ai-promo-icon">🤖</div>
          <div>
            <h3>{t('dashboard.tryAI')}</h3>
            <p>{t('dashboard.tryAIDesc')}</p>
          </div>
        </div>
        <button className="home-ai-promo-btn">{t('dashboard.try')} →</button>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState(getTabFromHash);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const [isSidebarPinned, setIsSidebarPinned] = useState(false);
  const { user } = useAuth();
  const TAB_TITLES = {
    home: t('dashboard.tabTitles.home'),
    boards: t('dashboard.tabTitles.boards'),
    files: t('dashboard.tabTitles.files'),
    presentations: t('dashboard.tabTitles.presentations'),
    settings: t('dashboard.tabTitles.settings'),
    admin: t('dashboard.tabTitles.admin'),
    ai: t('dashboard.tabTitles.ai')
  };

  // Обновляем URL хэш при смене таба + трекинг
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    window.location.hash = `#/${tab}`;
    document.title = `${TAB_TITLES[tab] || 'Daler AI'} — Daler AI`;
    // Отслеживаем переход на страницу
    trackingAPI.track('page_view', `Просмотр: ${TAB_TITLES[tab] || tab}`, tab);
  };

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
      window.location.hash = '#/home';
    }
    document.title = `${TAB_TITLES[activeTab] || 'Daler AI'} — Daler AI`;

    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return <HomeContent user={user} onNavigate={handleTabChange} />;
      case 'boards':
        return <Boards />;
      case 'files':
        return <Files />;
      case 'settings':
        return <Settings user={user} />;
      case 'admin':
        return <AdminPanel />;
      case 'ai':
        return <AIAssistant />;
      case 'presentations':
        return <Presentations />;
      default:
        return <HomeContent user={user} onNavigate={handleTabChange} />;
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
        <Suspense fallback={<div className="content-section" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}><div className="spinner" /></div>}>
          {renderContent()}
        </Suspense>
      </div>
    </div>
  );
};

export default Dashboard;

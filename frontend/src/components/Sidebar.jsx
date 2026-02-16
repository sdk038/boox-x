import React, { useState } from 'react';
import { HomeAlt1, Dashboard, Gear, Folder, SignOut, Pin } from 'akar-icons';
import { useAuth } from '../context/AuthContext';
import Logo from './Logo';
import '../pages/Sidebar.css';

const Sidebar = ({ activeTab, setActiveTab, onExpandChange, isPinned, onPinToggle }) => {
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    if (window.confirm('Вы действительно хотите выйти?')) {
      logout();
    }
  };

  const handleMouseEnter = () => {
    if (!isPinned && onExpandChange) {
      onExpandChange(true);
    }
  };

  const handleMouseLeave = () => {
    if (!isPinned && onExpandChange) {
      onExpandChange(false);
    }
  };

  const handleMobileTabChange = (tab) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <aside 
        className={`sidebar ${isPinned ? 'pinned' : ''}`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div className="left">
          <div 
            className="avatar" 
            onClick={() => setActiveTab('profile')}
            style={{ cursor: 'pointer' }}
            title="Мой профиль"
          >
            {user?.avatar ? (
              <img src={user.avatar} alt="Avatar" className="avatar-img" />
            ) : (
              user?.name?.charAt(0).toUpperCase() || 'U'
            )}
          </div>

          <button
            className={activeTab === 'home' ? 'active' : ''}
            onClick={() => setActiveTab('home')}
            title="Home"
          >
            <HomeAlt1 size={20} />
          </button>

          <button
            className={activeTab === 'ai' ? 'active' : ''}
            onClick={() => setActiveTab('ai')}
            title="AI"
          >
            <span style={{ fontSize: '20px' }}>🤖</span>
          </button>

          <button
            className={`bottom-btn ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
            title="Settings"
          >
            <Gear size={20} />
          </button>

          <button
            className="bottom-btn logout-btn"
            onClick={handleLogout}
            title="Выйти"
          >
            <SignOut size={20} />
          </button>
        </div>

        <div className="right">
          <div className="right-header">
            <div className="header-text">
              <div className="sidebar-brand">
                <Logo size={32} />
                <h1>Daler AI</h1>
              </div>
              <p className="user-name">Привет, {user?.name}!</p>
            </div>
            <button 
              className={`pin-button ${isPinned ? 'active' : ''}`}
              onClick={onPinToggle}
              title={isPinned ? 'Открепить' : 'Закрепить'}
            >
              <Pin size={18} />
            </button>
          </div>

          <nav className="buttons">
            <button
              className={activeTab === 'ai' ? 'active' : ''}
              onClick={() => setActiveTab('ai')}
            >
              <i><span style={{ fontSize: '24px' }}>🤖</span></i>
              <span>AI</span>
            </button>

            <button
              className={activeTab === 'boards' ? 'active' : ''}
              onClick={() => setActiveTab('boards')}
            >
              <i><Dashboard size={24} /></i>
              <span>Boards</span>
            </button>

            <button
              className={activeTab === 'files' ? 'active' : ''}
              onClick={() => setActiveTab('files')}
            >
              <i><Folder size={24} /></i>
              <span>Files</span>
            </button>

            {user?.role === 'admin' && (
              <button
                className={activeTab === 'admin' ? 'active' : ''}
                onClick={() => setActiveTab('admin')}
              >
                <i><span style={{ fontSize: '24px' }}>🛡️</span></i>
                <span>Admin</span>
              </button>
            )}
          </nav>
        </div>
      </aside>

      {/* Mobile Bottom Navigation */}
      <nav className="mobile-nav">
        <button
          className={`mobile-nav-btn ${activeTab === 'home' ? 'active' : ''}`}
          onClick={() => handleMobileTabChange('home')}
        >
          <HomeAlt1 size={22} />
          <span>Главная</span>
        </button>
        <button
          className={`mobile-nav-btn ${activeTab === 'ai' ? 'active' : ''}`}
          onClick={() => handleMobileTabChange('ai')}
        >
          <span className="mobile-nav-icon">🤖</span>
          <span>AI</span>
        </button>
        <button
          className={`mobile-nav-btn ${activeTab === 'boards' ? 'active' : ''}`}
          onClick={() => handleMobileTabChange('boards')}
        >
          <Dashboard size={22} />
          <span>Доски</span>
        </button>
        <button
          className={`mobile-nav-btn mobile-more-btn ${mobileMenuOpen ? 'active' : ''}`}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <span className="mobile-nav-icon">☰</span>
          <span>Ещё</span>
        </button>
      </nav>

      {/* Mobile "More" Menu */}
      {mobileMenuOpen && (
        <div className="mobile-menu-overlay" onClick={() => setMobileMenuOpen(false)}>
          <div className="mobile-menu" onClick={(e) => e.stopPropagation()}>
            <div className="mobile-menu-header">
              <div className="mobile-menu-avatar">
                {user?.avatar ? (
                  <img src={user.avatar} alt="Avatar" className="mobile-avatar-img" />
                ) : (
                  user?.name?.charAt(0).toUpperCase() || 'U'
                )}
              </div>
              <div>
                <h3>{user?.name}</h3>
                <p>{user?.email}</p>
              </div>
            </div>
            <div className="mobile-menu-items">
              <button onClick={() => handleMobileTabChange('profile')}>
                <span>👤</span> Профиль
              </button>
              <button onClick={() => handleMobileTabChange('files')}>
                <span>📁</span> Файлы
              </button>
              <button onClick={() => handleMobileTabChange('settings')}>
                <span>⚙️</span> Настройки
              </button>
              {user?.role === 'admin' && (
                <button onClick={() => handleMobileTabChange('admin')}>
                  <span>🛡️</span> Админ
                </button>
              )}
              <button className="mobile-menu-logout" onClick={handleLogout}>
                <span>🚪</span> Выйти
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;
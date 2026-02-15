import React from 'react';
import { HomeAlt1, Dashboard, Gear, Folder, SignOut, Pin } from 'akar-icons';
import { useAuth } from '../context/AuthContext';
import '../pages/Sidebar.css';

const Sidebar = ({ activeTab, setActiveTab, onExpandChange, isPinned, onPinToggle }) => {
  const { user, logout } = useAuth();

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

  return (
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
          {user?.name?.charAt(0).toUpperCase() || 'U'}
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
            <h1>Daler AI</h1>
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
  );
};

export default Sidebar;
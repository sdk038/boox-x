import React, { useState, useEffect } from 'react';
import { settingsAPI, authAPI } from '../services/api';

const Settings = ({ user }) => {
  // Инициализируем darkMode из localStorage
  const savedDark = localStorage.getItem('darkMode') === 'true';

  const [settings, setSettings] = useState({
    notifications: true,
    emailUpdates: false,
    darkMode: savedDark
  });
  const [loading, setLoading] = useState(true);
  const [editProfileModal, setEditProfileModal] = useState(false);
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || ''
  });
  const [saveStatus, setSaveStatus] = useState('');

  // Загрузка настроек при монтировании
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await settingsAPI.get();
      if (response.data.success) {
        const userSettings = response.data.settings;
        const isDark = userSettings.theme === 'dark';
        setSettings({
          notifications: userSettings.notifications?.push || true,
          emailUpdates: userSettings.notifications?.email || false,
          darkMode: isDark
        });
        
        // Синхронизируем localStorage и body class с сервером
        localStorage.setItem('darkMode', isDark);
        if (isDark) {
          document.body.classList.add('dark-theme');
        } else {
          document.body.classList.remove('dark-theme');
        }
      }
    } catch (error) {
      console.log('Настройки не найдены, используем по умолчанию');
    } finally {
      setLoading(false);
    }
  };

  const applyTheme = (isDark) => {
    localStorage.setItem('darkMode', isDark);
    if (isDark) {
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.remove('dark-theme');
    }
  };

  const handleToggle = async (setting) => {
    const newSettings = { ...settings, [setting]: !settings[setting] };
    setSettings(newSettings);

    // Применяем тему сразу (до сохранения на сервер)
    if (setting === 'darkMode') {
      applyTheme(newSettings.darkMode);
    }

    // Сохраняем в backend
    try {
      const settingsData = {
        notifications: {
          push: newSettings.notifications,
          email: newSettings.emailUpdates
        },
        theme: newSettings.darkMode ? 'dark' : 'light'
      };

      await settingsAPI.update(settingsData);

      setSaveStatus('✅ Сохранено');
      setTimeout(() => setSaveStatus(''), 2000);
    } catch (error) {
      console.error('Ошибка сохранения настроек:', error);
      setSaveStatus('❌ Ошибка');
      setTimeout(() => setSaveStatus(''), 2000);
    }
  };

  const handleProfileUpdate = async () => {
    try {
      const response = await authAPI.updateProfile(profileData);
      if (response.data.success) {
        // Обновляем локальное хранилище
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        localStorage.setItem('currentUser', JSON.stringify({
          ...currentUser,
          name: profileData.name,
          email: profileData.email
        }));
        
        setSaveStatus('✅ Профиль обновлен');
        setEditProfileModal(false);
        setTimeout(() => {
          setSaveStatus('');
          window.location.reload(); // Перезагружаем чтобы обновить имя везде
        }, 1500);
      }
    } catch (error) {
      console.error('Ошибка обновления профиля:', error);
      setSaveStatus('❌ Ошибка обновления');
      setTimeout(() => setSaveStatus(''), 2000);
    }
  };

  if (loading) {
    return (
      <div className="content-section">
        <h1>Настройки</h1>
        <p>Загрузка...</p>
      </div>
    );
  }

  return (
    <div className="content-section">
      <h1>Настройки</h1>
      {saveStatus && <div className="save-status">{saveStatus}</div>}
      
      <div className="settings-container">
        <div className="settings-section">
          <h2>Информация профиля</h2>
          <div className="profile-info">
            <div className="profile-avatar">
              {user?.avatar ? (
                <img src={user.avatar} alt="Avatar" className="avatar-img" />
              ) : (
                user?.name?.charAt(0).toUpperCase()
              )}
            </div>
            <div className="profile-details">
              <h3>{user?.name}</h3>
              <p>{user?.email}</p>
              <button 
                className="btn-secondary"
                onClick={() => setEditProfileModal(true)}
              >
                Редактировать профиль
              </button>
            </div>
          </div>
        </div>
        
        <div className="settings-section">
          <h2>Настройки уведомлений</h2>
          <div className="setting-item">
            <div className="setting-info">
              <h4>Push уведомления</h4>
              <p>Получать уведомления о новых задачах</p>
            </div>
            <label className="toggle">
              <input 
                type="checkbox" 
                checked={settings.notifications}
                onChange={() => handleToggle('notifications')}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>
          <div className="setting-item">
            <div className="setting-info">
              <h4>Email уведомления</h4>
              <p>Получать обновления на email</p>
            </div>
            <label className="toggle">
              <input 
                type="checkbox" 
                checked={settings.emailUpdates}
                onChange={() => handleToggle('emailUpdates')}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>
        </div>

        <div className="settings-section">
          <h2>Внешний вид</h2>
          <div className="setting-item">
            <div className="setting-info">
              <h4>Темная тема</h4>
              <p>Переключить на темную тему</p>
            </div>
            <label className="toggle">
              <input 
                type="checkbox" 
                checked={settings.darkMode}
                onChange={() => handleToggle('darkMode')}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>
        </div>
      </div>

      {/* Модальное окно редактирования профиля */}
      {editProfileModal && (
        <div className="modal-overlay" onClick={() => setEditProfileModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Редактировать профиль</h2>
            <div className="form-group">
              <label>Имя</label>
              <input
                type="text"
                value={profileData.name}
                onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                placeholder="Введите имя"
              />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={profileData.email}
                onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                placeholder="Введите email"
              />
            </div>
            <div className="modal-actions">
              <button 
                className="btn-secondary" 
                onClick={() => setEditProfileModal(false)}
              >
                Отмена
              </button>
              <button 
                className="btn-primary" 
                onClick={handleProfileUpdate}
              >
                Сохранить
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;

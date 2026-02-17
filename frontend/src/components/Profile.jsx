import React, { useState, useRef, useCallback, useEffect } from 'react';
import { authAPI, boardsAPI, tasksAPI, filesAPI } from '../services/api';

const Profile = ({ user, onUserUpdate }) => {
  const [editMode, setEditMode] = useState(false);
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    bio: user?.bio || 'Расскажите о себе...',
    location: user?.location || '',
    phone: user?.phone || ''
  });
  const [saveStatus, setSaveStatus] = useState('');
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar || null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const fileInputRef = useRef(null);
  const longPressTimer = useRef(null);
  const isLongPress = useRef(false);

  const handleSave = async () => {
    try {
      const response = await authAPI.updateProfile(profileData);
      if (response.data.success) {
        // Обновляем локальное хранилище
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        localStorage.setItem('currentUser', JSON.stringify({
          ...currentUser,
          ...profileData
        }));
        
        setSaveStatus('✅ Профиль обновлен');
        setEditMode(false);
        setTimeout(() => setSaveStatus(''), 2000);
      }
    } catch (error) {
      console.error('Ошибка обновления профиля:', error);
      setSaveStatus('❌ Ошибка обновления');
      setTimeout(() => setSaveStatus(''), 2000);
    }
  };

  const handleCancel = () => {
    setProfileData({
      name: user?.name || '',
      email: user?.email || '',
      bio: user?.bio || 'Расскажите о себе...',
      location: user?.location || '',
      phone: user?.phone || ''
    });
    setEditMode(false);
  };

  // Long press — открывает модалку с увеличенной авой
  const handleAvatarPointerDown = useCallback((e) => {
    isLongPress.current = false;
    longPressTimer.current = setTimeout(() => {
      isLongPress.current = true;
      if (avatarPreview) {
        setShowAvatarModal(true);
      }
    }, 600); // 0.6 сек для удобства
  }, [avatarPreview]);

  const handleAvatarPointerUp = useCallback(() => {
    clearTimeout(longPressTimer.current);
    // Короткий клик — открыть выбор файла (только если не было long press)
    if (!isLongPress.current) {
      fileInputRef.current?.click();
    }
  }, []);

  const handleAvatarPointerLeave = useCallback(() => {
    clearTimeout(longPressTimer.current);
  }, []);

  const handleReplaceAvatar = () => {
    setShowAvatarModal(false);
    fileInputRef.current?.click();
  };

  const handleDeleteAvatarFromModal = async () => {
    setShowAvatarModal(false);
    await handleDeleteAvatar();
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Проверка размера (макс 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setSaveStatus('❌ Файл слишком большой (макс 2MB)');
      setTimeout(() => setSaveStatus(''), 3000);
      return;
    }

    // Проверка типа
    if (!file.type.startsWith('image/')) {
      setSaveStatus('❌ Разрешены только изображения');
      setTimeout(() => setSaveStatus(''), 3000);
      return;
    }

    // Превью
    const reader = new FileReader();
    reader.onload = (e) => setAvatarPreview(e.target.result);
    reader.readAsDataURL(file);

    // Загрузка
    setUploadingAvatar(true);
    try {
      const formData = new FormData();
      formData.append('avatar', file);
      const response = await authAPI.uploadAvatar(formData);
      
      if (response.data.success) {
        // Обновляем пользователя в localStorage
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        currentUser.avatar = response.data.avatar;
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        
        if (onUserUpdate) onUserUpdate({ ...user, avatar: response.data.avatar });
        
        setSaveStatus('✅ Аватар обновлен');
        setTimeout(() => setSaveStatus(''), 2000);
      }
    } catch (error) {
      console.error('Ошибка загрузки аватара:', error);
      setSaveStatus('❌ Ошибка загрузки');
      setAvatarPreview(user?.avatar || null);
      setTimeout(() => setSaveStatus(''), 2000);
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleDeleteAvatar = async () => {
    try {
      const response = await authAPI.deleteAvatar();
      if (response.data.success) {
        setAvatarPreview(null);
        
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        currentUser.avatar = null;
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        
        if (onUserUpdate) onUserUpdate({ ...user, avatar: null });
        
        setSaveStatus('✅ Аватар удален');
        setTimeout(() => setSaveStatus(''), 2000);
      }
    } catch (error) {
      console.error('Ошибка удаления аватара:', error);
      setSaveStatus('❌ Ошибка удаления');
      setTimeout(() => setSaveStatus(''), 2000);
    }
  };

  const [realStats, setRealStats] = useState({ boards: 0, tasks: 0, files: 0 });
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const [boardsRes, tasksRes, filesRes] = await Promise.all([
          boardsAPI.getAll().catch(() => ({ data: { boards: [] } })),
          tasksAPI.getAll().catch(() => ({ data: { tasks: [] } })),
          filesAPI.getAll().catch(() => ({ data: { files: [] } }))
        ]);
        const boards = boardsRes.data.boards || boardsRes.data || [];
        const tasks = tasksRes.data.tasks || tasksRes.data || [];
        const files = filesRes.data.files || filesRes.data || [];
        setRealStats({
          boards: Array.isArray(boards) ? boards.length : 0,
          tasks: Array.isArray(tasks) ? tasks.length : 0,
          files: Array.isArray(files) ? files.length : 0
        });
      } catch (e) {
        console.error('Ошибка загрузки статистики:', e);
      } finally {
        setStatsLoading(false);
      }
    };
    loadStats();
  }, []);

  const stats = [
    { label: 'Досок', value: statsLoading ? '...' : realStats.boards, icon: '📋' },
    { label: 'Задач', value: statsLoading ? '...' : realStats.tasks, icon: '✅' },
    { label: 'Файлов', value: statsLoading ? '...' : realStats.files, icon: '📁' }
  ];

  const memberDays = Math.floor((Date.now() - new Date(user?.createdAt || Date.now()).getTime()) / (1000 * 60 * 60 * 24));
  const memberText = memberDays === 0 ? 'Сегодня' : memberDays === 1 ? '1 день' : `${memberDays} дн.`;

  return (
    <div className="content-section profile-page">
      <h1>Мой профиль</h1>
      {saveStatus && <div className="save-status">{saveStatus}</div>}

      <div className="profile-container">
        {/* Основная информация */}
        <div className="profile-header-card">
          <div className="profile-header-content">
            <div 
              className="profile-avatar-wrapper"
              onPointerDown={handleAvatarPointerDown}
              onPointerUp={handleAvatarPointerUp}
              onPointerLeave={handleAvatarPointerLeave}
              onContextMenu={(e) => e.preventDefault()}
            >
              {avatarPreview ? (
                <img src={avatarPreview} alt="Avatar" className="profile-avatar-large profile-avatar-img" />
              ) : (
                <div className="profile-avatar-large">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="profile-avatar-overlay">
                {uploadingAvatar ? '⏳' : '📷'}
              </div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleAvatarChange}
                accept="image/*"
                style={{ display: 'none' }}
              />
            </div>
            <div className="profile-header-info">
              {editMode ? (
                <input
                  type="text"
                  className="profile-input-large"
                  value={profileData.name}
                  onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                  placeholder="Ваше имя"
                />
              ) : (
                <h2>{user?.name}</h2>
              )}
              {editMode ? (
                <input
                  type="email"
                  className="profile-input"
                  value={profileData.email}
                  onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                  placeholder="Email"
                />
              ) : (
                <p className="profile-email">{user?.email}</p>
              )}
              <div className="profile-badge">
                {user?.role === 'admin' ? '👑 Администратор' : '👤 Пользователь'}
              </div>
            </div>
            <div className="profile-actions">
              {editMode ? (
                <>
                  <button className="btn-primary" onClick={handleSave}>
                    💾 Сохранить
                  </button>
                  <button className="btn-secondary" onClick={handleCancel}>
                    ✕ Отмена
                  </button>
                </>
              ) : (
                <button className="btn-primary" onClick={() => setEditMode(true)}>
                  ✏️ Редактировать
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Статистика */}
        <div className="profile-stats-card">
          <h3>📊 Статистика</h3>
          <div className="profile-stats-grid">
            {stats.map((stat, index) => (
              <div key={index} className="profile-stat-item">
                <div className="profile-stat-icon">{stat.icon}</div>
                <div className="profile-stat-value">{stat.value}</div>
                <div className="profile-stat-label">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Детальная информация */}
        <div className="profile-details-card">
          <h3>📋 Информация</h3>
          
          <div className="profile-field">
            <label>👤 Имя</label>
            {editMode ? (
              <input
                type="text"
                value={profileData.name}
                onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                placeholder="Введите имя"
              />
            ) : (
              <p>{user?.name}</p>
            )}
          </div>

          <div className="profile-field">
            <label>📧 Email</label>
            {editMode ? (
              <input
                type="email"
                value={profileData.email}
                onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                placeholder="Введите email"
              />
            ) : (
              <p>{user?.email}</p>
            )}
          </div>

          <div className="profile-field">
            <label>📝 О себе</label>
            {editMode ? (
              <textarea
                value={profileData.bio}
                onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                placeholder="Расскажите о себе"
                rows="3"
              />
            ) : (
              <p>{profileData.bio}</p>
            )}
          </div>

          <div className="profile-field">
            <label>📍 Местоположение</label>
            {editMode ? (
              <input
                type="text"
                value={profileData.location}
                onChange={(e) => setProfileData({ ...profileData, location: e.target.value })}
                placeholder="Город, страна"
              />
            ) : (
              <p>{profileData.location || 'Не указано'}</p>
            )}
          </div>

          <div className="profile-field">
            <label>📱 Телефон</label>
            {editMode ? (
              <input
                type="tel"
                value={profileData.phone}
                onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                placeholder="+7 (999) 123-45-67"
              />
            ) : (
              <p>{profileData.phone || 'Не указано'}</p>
            )}
          </div>

          <div className="profile-field">
            <label>📅 Дата регистрации</label>
            <p>{new Date(user?.createdAt || Date.now()).toLocaleDateString('ru-RU', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}</p>
          </div>

          <div className="profile-field">
            <label>🔐 Роль</label>
            <p className="profile-role-badge">
              {user?.role === 'admin' ? '👑 Администратор' : '👤 Пользователь'}
            </p>
          </div>
        </div>

        {/* Членство */}
        <div className="profile-activity-card">
          <h3>🏆 Ваш аккаунт</h3>
          <div className="profile-activity-list">
            <div className="profile-activity-item">
              <div className="profile-activity-icon">📅</div>
              <div className="profile-activity-content">
                <p className="profile-activity-action">
                  <strong>Дата регистрации:</strong> {new Date(user?.createdAt || Date.now()).toLocaleDateString('ru-RU', { year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
                <span className="profile-activity-time">С нами уже {memberText}</span>
              </div>
            </div>
            <div className="profile-activity-item">
              <div className="profile-activity-icon">{user?.role === 'admin' ? '👑' : '👤'}</div>
              <div className="profile-activity-content">
                <p className="profile-activity-action">
                  <strong>Роль:</strong> {user?.role === 'admin' ? 'Администратор' : 'Пользователь'}
                </p>
                <span className="profile-activity-time">{user?.role === 'admin' ? 'Полный доступ к системе' : 'Стандартный доступ'}</span>
              </div>
            </div>
            <div className="profile-activity-item">
              <div className="profile-activity-icon">📊</div>
              <div className="profile-activity-content">
                <p className="profile-activity-action">
                  <strong>Всего создано:</strong> {statsLoading ? '...' : `${realStats.boards} досок, ${realStats.tasks} задач, ${realStats.files} файлов`}
                </p>
                <span className="profile-activity-time">Ваша продуктивность</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Модалка увеличенного аватара */}
      {showAvatarModal && (
        <div className="avatar-modal-overlay" onClick={() => setShowAvatarModal(false)}>
          <div className="avatar-modal" onClick={(e) => e.stopPropagation()}>
            <button className="avatar-modal-close" onClick={() => setShowAvatarModal(false)}>✕</button>
            <div className="avatar-modal-image">
              {avatarPreview ? (
                <img src={avatarPreview} alt="Avatar" />
              ) : (
                <div className="avatar-modal-placeholder">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div className="avatar-modal-actions">
              <button className="avatar-modal-btn replace" onClick={handleReplaceAvatar}>
                🔄 Заменить аву
              </button>
              <button className="avatar-modal-btn delete" onClick={handleDeleteAvatarFromModal}>
                🗑 Удалить аву
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;

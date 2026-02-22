import React, { useEffect, useState } from 'react';
import { authAPI, settingsAPI, trackingAPI } from '../services/api';
import { useLanguage } from '../context/LanguageContext';

const SettingsPage = ({ user }) => {
  const { language, setLanguage, t } = useLanguage();
  const savedDark = localStorage.getItem('darkMode') === 'true';
  const [settings, setSettings] = useState({
    notifications: true,
    emailUpdates: false,
    darkMode: savedDark,
    language: language || 'ru'
  });
  const [loading, setLoading] = useState(true);
  const [editProfileModal, setEditProfileModal] = useState(false);
  const [profileData, setProfileData] = useState({ name: user?.name || '', email: user?.email || '' });
  const [saveStatus, setSaveStatus] = useState('');

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const response = await settingsAPI.get();
        if (response.data.success) {
          const userSettings = response.data.settings;
          const isDark = userSettings.theme === 'dark';
          const lang = userSettings.language || localStorage.getItem('language') || 'ru';
          setSettings({
            notifications: userSettings.notifications?.push || true,
            emailUpdates: userSettings.notifications?.email || false,
            darkMode: isDark,
            language: lang
          });
          setLanguage(lang);
          localStorage.setItem('darkMode', isDark);
          document.body.classList.toggle('dark-theme', isDark);
        }
      } catch (_) {
        // keep defaults
      } finally {
        setLoading(false);
      }
    };
    loadSettings();
  }, [setLanguage]);

  const persistSettings = async (nextSettings) => {
    await settingsAPI.update({
      notifications: { push: nextSettings.notifications, email: nextSettings.emailUpdates },
      theme: nextSettings.darkMode ? 'dark' : 'light',
      language: nextSettings.language || language
    });
  };

  const handleToggle = async (setting) => {
    const nextSettings = { ...settings, [setting]: !settings[setting] };
    setSettings(nextSettings);
    if (setting === 'darkMode') {
      localStorage.setItem('darkMode', nextSettings.darkMode);
      document.body.classList.toggle('dark-theme', nextSettings.darkMode);
      trackingAPI.track('change_theme', `Theme: ${nextSettings.darkMode ? 'dark' : 'light'}`, 'settings');
    }
    try {
      await persistSettings(nextSettings);
      setSaveStatus(t('settings.saved'));
      setTimeout(() => setSaveStatus(''), 2000);
    } catch (error) {
      console.error('Settings save error:', error);
      setSaveStatus(t('settings.saveError'));
      setTimeout(() => setSaveStatus(''), 2000);
    }
  };

  const handleLanguageChange = async (nextLanguage) => {
    const lang = nextLanguage === 'en' ? 'en' : 'ru';
    const nextSettings = { ...settings, language: lang };
    setSettings(nextSettings);
    setLanguage(lang);
    try {
      await persistSettings(nextSettings);
      setSaveStatus(t('settings.saved'));
      setTimeout(() => setSaveStatus(''), 2000);
    } catch (error) {
      console.error('Language save error:', error);
      setSaveStatus(t('settings.saveError'));
      setTimeout(() => setSaveStatus(''), 2000);
    }
  };

  const handleProfileUpdate = async () => {
    try {
      const response = await authAPI.updateProfile(profileData);
      if (response.data.success) {
        const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
        localStorage.setItem('currentUser', JSON.stringify({ ...currentUser, name: profileData.name, email: profileData.email }));
        setSaveStatus(t('settings.profileUpdated'));
        setEditProfileModal(false);
        setTimeout(() => {
          setSaveStatus('');
          window.location.reload();
        }, 1200);
      }
    } catch (error) {
      console.error('Profile update error:', error);
      setSaveStatus(t('settings.updateError'));
      setTimeout(() => setSaveStatus(''), 2000);
    }
  };

  if (loading) {
    return <div className="content-section"><h1>{t('settings.title')}</h1><p>{t('common.loading')}</p></div>;
  }

  return (
    <div className="content-section">
      <h1>{t('settings.title')}</h1>
      {saveStatus && <div className="save-status">{saveStatus}</div>}
      <div className="settings-container">
        <div className="settings-section">
          <h2>{t('settings.profileInfo')}</h2>
          <div className="profile-info">
            <div className="profile-avatar">{user?.avatar ? <img src={user.avatar} alt="Avatar" className="avatar-img" /> : user?.name?.charAt(0).toUpperCase()}</div>
            <div className="profile-details">
              <h3>{user?.name}</h3><p>{user?.email}</p>
              <button className="btn-secondary" onClick={() => setEditProfileModal(true)}>{t('settings.editProfile')}</button>
            </div>
          </div>
        </div>
        <div className="settings-section">
          <h2>{t('settings.notifications')}</h2>
          <div className="setting-item">
            <div className="setting-info"><h4>{t('settings.pushNotifications')}</h4><p>{t('settings.pushNotificationsDesc')}</p></div>
            <label className="toggle"><input type="checkbox" checked={settings.notifications} onChange={() => handleToggle('notifications')} /><span className="toggle-slider"></span></label>
          </div>
          <div className="setting-item">
            <div className="setting-info"><h4>{t('settings.emailNotifications')}</h4><p>{t('settings.emailNotificationsDesc')}</p></div>
            <label className="toggle"><input type="checkbox" checked={settings.emailUpdates} onChange={() => handleToggle('emailUpdates')} /><span className="toggle-slider"></span></label>
          </div>
        </div>
        <div className="settings-section">
          <h2>{t('settings.appearance')}</h2>
          <div className="setting-item">
            <div className="setting-info"><h4>{t('settings.darkTheme')}</h4><p>{t('settings.darkThemeDesc')}</p></div>
            <label className="toggle"><input type="checkbox" checked={settings.darkMode} onChange={() => handleToggle('darkMode')} /><span className="toggle-slider"></span></label>
          </div>
          <div className="setting-item">
            <div className="setting-info"><h4>{t('settings.language')}</h4><p>{t('settings.languageDesc')}</p></div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className={settings.language === 'ru' ? 'btn-primary' : 'btn-secondary'} onClick={() => handleLanguageChange('ru')}>{t('settings.languageRu')}</button>
              <button className={settings.language === 'en' ? 'btn-primary' : 'btn-secondary'} onClick={() => handleLanguageChange('en')}>{t('settings.languageEn')}</button>
            </div>
          </div>
        </div>
      </div>
      {editProfileModal && (
        <div className="modal-overlay" onClick={() => setEditProfileModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>{t('settings.editProfileTitle')}</h2>
            <div className="form-group"><label>{t('settings.name')}</label><input type="text" value={profileData.name} onChange={(e) => setProfileData({ ...profileData, name: e.target.value })} placeholder={t('settings.enterName')} /></div>
            <div className="form-group"><label>{t('settings.email')}</label><input type="email" value={profileData.email} onChange={(e) => setProfileData({ ...profileData, email: e.target.value })} placeholder={t('settings.enterEmail')} /></div>
            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setEditProfileModal(false)}>{t('common.cancel')}</button>
              <button className="btn-primary" onClick={handleProfileUpdate}>{t('common.save')}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsPage;

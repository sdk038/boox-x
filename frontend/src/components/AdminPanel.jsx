import React, { useState, useEffect } from 'react';
import { adminAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import '../pages/AdminPanel.css';

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState('stats');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [activities, setActivities] = useState([]);
  const [monitoring, setMonitoring] = useState(null);
  const [selectedUserMonitor, setSelectedUserMonitor] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (activeTab === 'stats') loadStats();
    else if (activeTab === 'users') loadUsers();
    else if (activeTab === 'activity') loadActivity();
    else if (activeTab === 'monitoring') loadMonitoring();
  }, [activeTab]);

  const loadStats = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getStats();
      setStats(response.data.stats);
    } catch (error) {
      console.error('Ошибка загрузки статистики:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getAllUsers();
      setUsers(response.data.users);
    } catch (error) {
      console.error('Ошибка загрузки пользователей:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadActivity = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getActivity(1, 100);
      setActivities(response.data.activities);
    } catch (error) {
      console.error('Ошибка загрузки активности:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMonitoring = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getMonitoringSummary();
      setMonitoring(response.data.monitoring);
    } catch (error) {
      console.error('Ошибка загрузки мониторинга:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUserMonitor = async (userId) => {
    try {
      setLoading(true);
      const response = await adminAPI.getUserMonitor(userId);
      setSelectedUserMonitor(response.data);
    } catch (error) {
      console.error('Ошибка загрузки мониторинга пользователя:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    if (window.confirm(`Изменить роль пользователя на "${newRole}"?`)) {
      try {
        await adminAPI.updateUserRole(userId, newRole);
        loadUsers();
        alert('Роль успешно изменена');
      } catch (error) {
        alert('Ошибка при изменении роли: ' + error.response?.data?.message);
      }
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    if (window.confirm(`Вы уверены что хотите удалить пользователя "${userName}"? Это действие нельзя отменить!`)) {
      try {
        await adminAPI.deleteUser(userId);
        loadUsers();
        alert('Пользователь удален');
      } catch (error) {
        alert('Ошибка при удалении: ' + error.response?.data?.message);
      }
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString('ru-RU');
  };

  const getActionLabel = (action) => {
    const labels = {
      'login': '🔐 Вход',
      'register': '✨ Регистрация',
      'logout': '👋 Выход',
      'create_board': '📋 Создание доски',
      'update_board': '✏️ Обновление доски',
      'delete_board': '🗑️ Удаление доски',
      'create_task': '➕ Создание задачи',
      'update_task': '📝 Обновление задачи',
      'delete_task': '❌ Удаление задачи',
      'upload_file': '📤 Загрузка файла',
      'delete_file': '🗑️ Удаление файла',
      'update_profile': '👤 Обновление профиля',
      'update_settings': '⚙️ Изменение настроек',
      'upload_avatar': '🖼️ Загрузка аватара',
      'delete_avatar': '🖼️ Удаление аватара',
      'page_view': '👁️ Просмотр страницы',
      'tab_switch': '🔄 Переключение вкладки',
      'ai_chat': '🤖 AI чат',
      'ai_generate_project': '🚀 AI генерация проекта',
      'ai_create_project': '📂 Создание AI проекта',
      'ai_generate_task': '📝 AI генерация задачи',
      'ai_analyze_project': '📊 AI анализ проекта',
      'ai_generate_presentation': '📊 AI презентация',
      'search': '🔍 Поиск',
      'change_theme': '🎨 Смена темы',
      'click': '👆 Клик',
      'custom': '📌 Другое'
    };
    return labels[action] || action;
  };

  const getActionColor = (action) => {
    if (action.startsWith('ai_')) return '#8b5cf6';
    if (action === 'login' || action === 'register') return '#10b981';
    if (action === 'page_view' || action === 'tab_switch') return '#3b82f6';
    if (action.includes('delete')) return '#ef4444';
    if (action.includes('create') || action.includes('upload')) return '#f59e0b';
    if (action === 'search') return '#06b6d4';
    return '#4066ff';
  };

  if (user?.role !== 'admin') {
    return (
      <div className="admin-panel">
        <div className="access-denied">
          <h1>🚫 Доступ запрещен</h1>
          <p>У вас нет прав администратора</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-panel">
      <div className="admin-header">
        <h1>⚙️ Панель администратора</h1>
        <div className="admin-tabs">
          <button 
            className={activeTab === 'stats' ? 'active' : ''}
            onClick={() => { setActiveTab('stats'); setSelectedUserMonitor(null); }}
          >
            📊 Статистика
          </button>
          <button 
            className={activeTab === 'users' ? 'active' : ''}
            onClick={() => { setActiveTab('users'); setSelectedUserMonitor(null); }}
          >
            👥 Пользователи
          </button>
          <button 
            className={activeTab === 'activity' ? 'active' : ''}
            onClick={() => { setActiveTab('activity'); setSelectedUserMonitor(null); }}
          >
            📝 Активность
          </button>
          <button 
            className={activeTab === 'monitoring' ? 'active' : ''}
            onClick={() => { setActiveTab('monitoring'); setSelectedUserMonitor(null); }}
          >
            🔍 Мониторинг
          </button>
        </div>
      </div>

      <div className="admin-content">
        {loading ? (
          <div className="loading">Загрузка...</div>
        ) : (
          <>
            {activeTab === 'stats' && stats && (
              <StatsView stats={stats} />
            )}
            {activeTab === 'users' && (
              selectedUserMonitor ? (
                <UserMonitorView 
                  data={selectedUserMonitor}
                  getActionLabel={getActionLabel}
                  getActionColor={getActionColor}
                  formatDate={formatDate}
                  onBack={() => setSelectedUserMonitor(null)}
                />
              ) : (
                <UsersView 
                  users={users} 
                  onRoleChange={handleRoleChange}
                  onDelete={handleDeleteUser}
                  onMonitor={(userId) => loadUserMonitor(userId)}
                />
              )
            )}
            {activeTab === 'activity' && (
              <ActivityView 
                activities={activities}
                getActionLabel={getActionLabel}
                getActionColor={getActionColor}
                formatDate={formatDate}
              />
            )}
            {activeTab === 'monitoring' && monitoring && (
              <MonitoringView 
                monitoring={monitoring}
                getActionLabel={getActionLabel}
                getActionColor={getActionColor}
                formatDate={formatDate}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};

// ===================== STATS VIEW =====================
const StatsView = ({ stats }) => (
  <div className="stats-view">
    <div className="stat-cards">
      <div className="stat-card">
        <div className="stat-icon">👥</div>
        <div className="stat-info">
          <h3>{stats.totalUsers}</h3>
          <p>Всего пользователей</p>
          <span className="stat-badge">+{stats.newUsersLastMonth} за месяц</span>
        </div>
      </div>
      <div className="stat-card">
        <div className="stat-icon">📋</div>
        <div className="stat-info">
          <h3>{stats.totalBoards}</h3>
          <p>Досок создано</p>
        </div>
      </div>
      <div className="stat-card">
        <div className="stat-icon">✅</div>
        <div className="stat-info">
          <h3>{stats.totalTasks}</h3>
          <p>Задач создано</p>
        </div>
      </div>
      <div className="stat-card">
        <div className="stat-icon">📁</div>
        <div className="stat-info">
          <h3>{stats.totalFiles}</h3>
          <p>Файлов загружено</p>
        </div>
      </div>
      <div className="stat-card">
        <div className="stat-icon">⚡</div>
        <div className="stat-info">
          <h3>{stats.activityToday}</h3>
          <p>Активность сегодня</p>
        </div>
      </div>
    </div>

    <div className="top-users">
      <h2>🏆 Топ активных пользователей</h2>
      <div className="users-list">
        {stats.topUsers.map((u, index) => (
          <div key={u._id} className="top-user-item">
            <span className="rank">#{index + 1}</span>
            <div className="user-details">
              <strong>{u.name}</strong>
              <span>{u.email}</span>
            </div>
            <span className="activity-count">{u.activityCount} действий</span>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// ===================== USERS VIEW =====================
const UsersView = ({ users, onRoleChange, onDelete, onMonitor }) => (
  <div className="users-view">
    <h2>Всего пользователей: {users.length}</h2>
    <div className="users-table-container">
      <table className="users-table">
        <thead>
          <tr>
            <th>Пользователь</th>
            <th>Email</th>
            <th>Роль</th>
            <th>Регистрация</th>
            <th>Последний вход</th>
            <th>Статистика</th>
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
          {users.map(u => (
            <tr key={u._id}>
              <td>
                <div className="user-cell">
                  <div className="user-avatar">
                    {u.avatar ? (
                      <img src={u.avatar} alt="" className="user-avatar-img" />
                    ) : (
                      u.name?.charAt(0).toUpperCase()
                    )}
                  </div>
                  <strong>{u.name}</strong>
                </div>
              </td>
              <td>{u.email}</td>
              <td>
                <select 
                  className={`role-select ${u.role}`}
                  value={u.role}
                  onChange={(e) => onRoleChange(u._id, e.target.value)}
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </td>
              <td>{new Date(u.createdAt).toLocaleDateString('ru-RU')}</td>
              <td>
                {u.lastLogin 
                  ? new Date(u.lastLogin).toLocaleString('ru-RU')
                  : 'Не входил'
                }
              </td>
              <td>
                <div className="user-stats">
                  <span>📋 {u.stats?.boards || 0}</span>
                  <span>✅ {u.stats?.tasks || 0}</span>
                  <span>⚡ {u.stats?.activities || 0}</span>
                </div>
              </td>
              <td>
                <div className="user-actions-btns">
                  <button 
                    className="btn-monitor-user"
                    onClick={() => onMonitor(u._id)}
                    title="Мониторинг пользователя"
                  >
                    🔍 Мониторинг
                  </button>
                  <button 
                    className="btn-delete-user"
                    onClick={() => onDelete(u._id, u.name)}
                  >
                    🗑️ Удалить
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

// ===================== ACTIVITY VIEW =====================
const ActivityView = ({ activities, getActionLabel, getActionColor, formatDate }) => (
  <div className="activity-view">
    <h2>Логи активности: {activities.length}</h2>
    <div className="activity-list">
      {activities.map(activity => (
        <div key={activity._id} className="activity-item" style={{ borderLeftColor: getActionColor(activity.action) }}>
          <div className="activity-icon">
            {getActionLabel(activity.action).split(' ')[0]}
          </div>
          <div className="activity-details">
            <div className="activity-header">
              <strong>{activity.user?.name || 'Неизвестно'}</strong>
              <span className="activity-action" style={{ background: getActionColor(activity.action) }}>
                {getActionLabel(activity.action)}
              </span>
            </div>
            {activity.details && (
              <p className="activity-description">{activity.details}</p>
            )}
            <div className="activity-meta">
              <span>📧 {activity.user?.email}</span>
              <span>🌐 {activity.ipAddress || 'N/A'}</span>
              <span>🕒 {formatDate(activity.timestamp)}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

// ===================== MONITORING VIEW =====================
const MonitoringView = ({ monitoring, getActionLabel, getActionColor, formatDate }) => {
  return (
    <div className="monitoring-view">
      {/* Карточки онлайн-статистики */}
      <div className="monitor-cards">
        <div className="monitor-card online">
          <div className="monitor-card-icon">🟢</div>
          <div className="monitor-card-info">
            <h3>{monitoring.activeUsersLastHour}</h3>
            <p>Онлайн (1 час)</p>
          </div>
        </div>
        <div className="monitor-card active">
          <div className="monitor-card-icon">👥</div>
          <div className="monitor-card-info">
            <h3>{monitoring.activeUsersLast24h}</h3>
            <p>Активных (24ч)</p>
          </div>
        </div>
        <div className="monitor-card devices">
          <div className="monitor-card-icon">📱</div>
          <div className="monitor-card-info">
            <h3>{monitoring.deviceStats?.length || 0}</h3>
            <p>Типов устройств</p>
          </div>
        </div>
        <div className="monitor-card actions">
          <div className="monitor-card-icon">⚡</div>
          <div className="monitor-card-info">
            <h3>{monitoring.topActions?.reduce((sum, a) => sum + a.count, 0) || 0}</h3>
            <p>Действий (24ч)</p>
          </div>
        </div>
      </div>

      <div className="monitor-grid">
        {/* Популярные страницы */}
        <div className="monitor-section">
          <h3>📄 Популярные страницы (24ч)</h3>
          <div className="monitor-list">
            {monitoring.popularPages?.length > 0 ? (
              monitoring.popularPages.map((page, i) => (
                <div key={i} className="monitor-list-item">
                  <div className="monitor-list-rank">#{i + 1}</div>
                  <div className="monitor-list-info">
                    <strong>{page._id || 'Неизвестно'}</strong>
                    <span>{page.views} просмотров • {page.uniqueUsers} пользователей</span>
                  </div>
                  <div className="monitor-list-bar">
                    <div 
                      className="monitor-list-bar-fill" 
                      style={{ width: `${(page.views / (monitoring.popularPages[0]?.views || 1)) * 100}%` }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <p className="monitor-empty">Нет данных</p>
            )}
          </div>
        </div>

        {/* Топ действий */}
        <div className="monitor-section">
          <h3>🎯 Топ действий (24ч)</h3>
          <div className="monitor-list">
            {monitoring.topActions?.length > 0 ? (
              monitoring.topActions.map((action, i) => (
                <div key={i} className="monitor-list-item">
                  <span 
                    className="monitor-action-badge"
                    style={{ background: getActionColor(action._id) }}
                  >
                    {getActionLabel(action._id)}
                  </span>
                  <strong className="monitor-action-count">{action.count}</strong>
                </div>
              ))
            ) : (
              <p className="monitor-empty">Нет данных</p>
            )}
          </div>
        </div>

        {/* Устройства */}
        <div className="monitor-section">
          <h3>📱 Устройства (24ч)</h3>
          <div className="monitor-devices">
            {monitoring.deviceStats?.length > 0 ? (
              monitoring.deviceStats.map((device, i) => (
                <div key={i} className="monitor-device-item">
                  <span className="monitor-device-icon">
                    {device._id === 'mobile' ? '📱' : device._id === 'tablet' ? '📟' : '💻'}
                  </span>
                  <span className="monitor-device-name">{device._id || 'Неизвестно'}</span>
                  <strong>{device.count}</strong>
                </div>
              ))
            ) : (
              <p className="monitor-empty">Нет данных</p>
            )}
          </div>
        </div>

        {/* Активность по часам */}
        <div className="monitor-section">
          <h3>📈 Активность сегодня по часам</h3>
          <div className="monitor-hourly-chart">
            {Array.from({ length: 24 }, (_, hour) => {
              const data = monitoring.hourlyToday?.find(h => h._id === hour);
              const count = data?.count || 0;
              const maxCount = Math.max(...(monitoring.hourlyToday?.map(h => h.count) || [1]));
              return (
                <div key={hour} className="monitor-hour-bar" title={`${hour}:00 — ${count} действий`}>
                  <div 
                    className="monitor-hour-fill"
                    style={{ height: `${maxCount > 0 ? (count / maxCount) * 100 : 0}%` }}
                  />
                  <span className="monitor-hour-label">{hour}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Лента в реальном времени */}
      <div className="monitor-section monitor-feed">
        <h3>🔴 Лента действий (в реальном времени)</h3>
        <div className="monitor-feed-list">
          {monitoring.latestActions?.map((action, i) => (
            <div key={i} className="monitor-feed-item">
              <div className="monitor-feed-avatar">
                {action.user?.avatar ? (
                  <img src={action.user.avatar} alt="" />
                ) : (
                  action.user?.name?.charAt(0)?.toUpperCase() || '?'
                )}
              </div>
              <div className="monitor-feed-content">
                <div className="monitor-feed-header">
                  <strong>{action.user?.name || 'Неизвестно'}</strong>
                  <span 
                    className="monitor-feed-action"
                    style={{ background: getActionColor(action.action) }}
                  >
                    {getActionLabel(action.action)}
                  </span>
                </div>
                {action.details && <p className="monitor-feed-details">{action.details}</p>}
                <span className="monitor-feed-time">{formatDate(action.timestamp)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ===================== USER MONITOR VIEW =====================
const UserMonitorView = ({ data, getActionLabel, getActionColor, formatDate, onBack }) => {
  const { user: monitoredUser, monitoring: m } = data;
  const [viewTab, setViewTab] = useState('overview');

  return (
    <div className="user-monitor-view">
      <button className="btn-back" onClick={onBack}>← Назад к списку</button>
      
      {/* Шапка пользователя */}
      <div className="user-monitor-header">
        <div className="user-monitor-avatar">
          {monitoredUser.avatar ? (
            <img src={monitoredUser.avatar} alt="" />
          ) : (
            monitoredUser.name?.charAt(0)?.toUpperCase() || '?'
          )}
        </div>
        <div className="user-monitor-info">
          <h2>{monitoredUser.name}</h2>
          <p>{monitoredUser.email}</p>
          <div className="user-monitor-badges">
            <span className={`badge ${monitoredUser.role}`}>
              {monitoredUser.role === 'admin' ? '👑 Администратор' : '👤 Пользователь'}
            </span>
            <span className="badge">📅 Регистрация: {new Date(monitoredUser.createdAt).toLocaleDateString('ru-RU')}</span>
            {monitoredUser.lastLogin && (
              <span className="badge">🕒 Последний вход: {formatDate(monitoredUser.lastLogin)}</span>
            )}
          </div>
        </div>
        <div className="user-monitor-total">
          <h3>{m.totalActions}</h3>
          <p>всего действий</p>
        </div>
      </div>

      {/* Вкладки */}
      <div className="user-monitor-tabs">
        <button className={viewTab === 'overview' ? 'active' : ''} onClick={() => setViewTab('overview')}>
          📊 Обзор
        </button>
        <button className={viewTab === 'timeline' ? 'active' : ''} onClick={() => setViewTab('timeline')}>
          📜 Хронология
        </button>
        <button className={viewTab === 'pages' ? 'active' : ''} onClick={() => setViewTab('pages')}>
          📄 Страницы
        </button>
        <button className={viewTab === 'ai' ? 'active' : ''} onClick={() => setViewTab('ai')}>
          🤖 AI
        </button>
        <button className={viewTab === 'devices' ? 'active' : ''} onClick={() => setViewTab('devices')}>
          📱 Устройства
        </button>
      </div>

      {/* Содержимое вкладок */}
      <div className="user-monitor-content">
        {viewTab === 'overview' && (
          <div className="user-monitor-overview">
            {/* Статистика по действиям */}
            <div className="monitor-section">
              <h3>🎯 Статистика действий</h3>
              <div className="action-stats-grid">
                {m.actionStats?.map((stat, i) => (
                  <div key={i} className="action-stat-item">
                    <span 
                      className="action-stat-badge"
                      style={{ background: getActionColor(stat._id) }}
                    >
                      {getActionLabel(stat._id)}
                    </span>
                    <strong>{stat.count}</strong>
                    <span className="action-stat-last">
                      Последний: {new Date(stat.lastTime).toLocaleDateString('ru-RU')}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Активность по часам */}
            <div className="monitor-section">
              <h3>⏰ Активность по часам (7 дней)</h3>
              <div className="monitor-hourly-chart">
                {Array.from({ length: 24 }, (_, hour) => {
                  const data = m.hourlyActivity?.find(h => h._id === hour);
                  const count = data?.count || 0;
                  const maxCount = Math.max(...(m.hourlyActivity?.map(h => h.count) || [1]));
                  return (
                    <div key={hour} className="monitor-hour-bar" title={`${hour}:00 — ${count} действий`}>
                      <div 
                        className="monitor-hour-fill"
                        style={{ height: `${maxCount > 0 ? (count / maxCount) * 100 : 0}%` }}
                      />
                      <span className="monitor-hour-label">{hour}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Активность по дням */}
            <div className="monitor-section">
              <h3>📅 Активность по дням (30 дней)</h3>
              <div className="daily-activity-chart">
                {m.dailyActivity?.map((day, i) => {
                  const maxCount = Math.max(...(m.dailyActivity?.map(d => d.count) || [1]));
                  return (
                    <div key={i} className="daily-bar" title={`${day._id}: ${day.count} действий`}>
                      <div 
                        className="daily-bar-fill"
                        style={{ height: `${(day.count / maxCount) * 100}%` }}
                      />
                      <span className="daily-bar-label">
                        {new Date(day._id).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' })}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {viewTab === 'timeline' && (
          <div className="user-monitor-timeline">
            <h3>📜 Хронология действий</h3>
            <div className="timeline-list">
              {m.recentActivity?.map((activity, i) => (
                <div key={i} className="timeline-item">
                  <div className="timeline-dot" style={{ background: getActionColor(activity.action) }} />
                  <div className="timeline-content">
                    <div className="timeline-header">
                      <span 
                        className="timeline-action"
                        style={{ background: getActionColor(activity.action) }}
                      >
                        {getActionLabel(activity.action)}
                      </span>
                      <span className="timeline-time">{formatDate(activity.timestamp)}</span>
                    </div>
                    {activity.details && <p className="timeline-details">{activity.details}</p>}
                    {activity.page && <span className="timeline-page">📄 {activity.page}</span>}
                    <div className="timeline-meta">
                      {activity.device && <span>📱 {activity.device}</span>}
                      {activity.browser && <span>🌐 {activity.browser}</span>}
                      {activity.ipAddress && <span>🔗 {activity.ipAddress}</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {viewTab === 'pages' && (
          <div className="user-monitor-pages">
            <h3>📄 Посещённые страницы</h3>
            <div className="pages-list">
              {m.pageViews?.length > 0 ? (
                m.pageViews.map((page, i) => (
                  <div key={i} className="page-view-item">
                    <div className="page-view-rank">#{i + 1}</div>
                    <div className="page-view-info">
                      <strong>{page._id}</strong>
                      <span>{page.count} посещений • Последний: {new Date(page.lastVisit).toLocaleDateString('ru-RU')}</span>
                    </div>
                    <div className="monitor-list-bar">
                      <div 
                        className="monitor-list-bar-fill"
                        style={{ width: `${(page.count / (m.pageViews[0]?.count || 1)) * 100}%` }}
                      />
                    </div>
                  </div>
                ))
              ) : (
                <p className="monitor-empty">Нет данных о посещениях</p>
              )}
            </div>
          </div>
        )}

        {viewTab === 'ai' && (
          <div className="user-monitor-ai">
            <h3>🤖 Использование AI</h3>
            <div className="ai-usage-list">
              {m.aiUsage?.length > 0 ? (
                m.aiUsage.map((usage, i) => (
                  <div key={i} className="ai-usage-item">
                    <span 
                      className="ai-usage-badge"
                      style={{ background: '#8b5cf6' }}
                    >
                      {getActionLabel(usage._id)}
                    </span>
                    <strong>{usage.count} раз</strong>
                    <span>Последний: {new Date(usage.lastUsed).toLocaleDateString('ru-RU')}</span>
                  </div>
                ))
              ) : (
                <p className="monitor-empty">Пользователь ещё не использовал AI</p>
              )}
            </div>

            {/* AI чат история */}
            {m.recentActivity?.filter(a => a.action === 'ai_chat').length > 0 && (
              <div className="ai-chat-history">
                <h4>💬 Последние AI запросы</h4>
                {m.recentActivity
                  .filter(a => a.action === 'ai_chat')
                  .slice(0, 20)
                  .map((chat, i) => (
                    <div key={i} className="ai-chat-item">
                      <span className="ai-chat-time">{formatDate(chat.timestamp)}</span>
                      <p>{chat.details}</p>
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}

        {viewTab === 'devices' && (
          <div className="user-monitor-devices">
            <h3>📱 Устройства и браузеры</h3>
            <div className="devices-list">
              {m.devices?.length > 0 ? (
                m.devices.map((device, i) => (
                  <div key={i} className="device-item">
                    <span className="device-icon">
                      {device._id.device === 'mobile' ? '📱' : device._id.device === 'tablet' ? '📟' : '💻'}
                    </span>
                    <div className="device-info">
                      <strong>{device._id.device || 'Неизвестно'}</strong>
                      <span>🌐 {device._id.browser || 'N/A'}</span>
                      <span>💻 {device._id.os || 'N/A'}</span>
                    </div>
                    <div className="device-stats">
                      <strong>{device.count} действий</strong>
                      <span>Последний: {new Date(device.lastSeen).toLocaleDateString('ru-RU')}</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="monitor-empty">Нет данных об устройствах</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;

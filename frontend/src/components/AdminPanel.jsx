import React, { useState, useEffect } from 'react';
import { adminAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import '../pages/AdminPanel.css';

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState('stats');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  // eslint-disable-next-line no-unused-vars
  const [selectedUser, setSelectedUser] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    if (activeTab === 'stats') {
      loadStats();
    } else if (activeTab === 'users') {
      loadUsers();
    } else if (activeTab === 'activity') {
      loadActivity();
    }
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
      'delete_file': '🗑️ Удаление файла'
    };
    return labels[action] || action;
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
            onClick={() => setActiveTab('stats')}
          >
            📊 Статистика
          </button>
          <button 
            className={activeTab === 'users' ? 'active' : ''}
            onClick={() => setActiveTab('users')}
          >
            👥 Пользователи
          </button>
          <button 
            className={activeTab === 'activity' ? 'active' : ''}
            onClick={() => setActiveTab('activity')}
          >
            📝 Активность
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
              <UsersView 
                users={users} 
                onRoleChange={handleRoleChange}
                onDelete={handleDeleteUser}
              />
            )}
            {activeTab === 'activity' && (
              <ActivityView 
                activities={activities}
                getActionLabel={getActionLabel}
                formatDate={formatDate}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};

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
        {stats.topUsers.map((user, index) => (
          <div key={user._id} className="top-user-item">
            <span className="rank">#{index + 1}</span>
            <div className="user-details">
              <strong>{user.name}</strong>
              <span>{user.email}</span>
            </div>
            <span className="activity-count">{user.activityCount} действий</span>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const UsersView = ({ users, onRoleChange, onDelete }) => (
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
          {users.map(user => (
            <tr key={user._id}>
              <td>
                <div className="user-cell">
                  <div className="user-avatar">
                    {user.name?.charAt(0).toUpperCase()}
                  </div>
                  <strong>{user.name}</strong>
                </div>
              </td>
              <td>{user.email}</td>
              <td>
                <select 
                  className={`role-select ${user.role}`}
                  value={user.role}
                  onChange={(e) => onRoleChange(user._id, e.target.value)}
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </td>
              <td>{new Date(user.createdAt).toLocaleDateString('ru-RU')}</td>
              <td>
                {user.lastLogin 
                  ? new Date(user.lastLogin).toLocaleString('ru-RU')
                  : 'Не входил'
                }
              </td>
              <td>
                <div className="user-stats">
                  <span>📋 {user.stats?.boards || 0}</span>
                  <span>✅ {user.stats?.tasks || 0}</span>
                  <span>⚡ {user.stats?.activities || 0}</span>
                </div>
              </td>
              <td>
                <button 
                  className="btn-delete-user"
                  onClick={() => onDelete(user._id, user.name)}
                >
                  🗑️ Удалить
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const ActivityView = ({ activities, getActionLabel, formatDate }) => (
  <div className="activity-view">
    <h2>Логи активности: {activities.length}</h2>
    <div className="activity-list">
      {activities.map(activity => (
        <div key={activity._id} className="activity-item">
          <div className="activity-icon">
            {getActionLabel(activity.action).split(' ')[0]}
          </div>
          <div className="activity-details">
            <div className="activity-header">
              <strong>{activity.user?.name || 'Неизвестно'}</strong>
              <span className="activity-action">{getActionLabel(activity.action)}</span>
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

export default AdminPanel;

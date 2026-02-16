const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  action: {
    type: String,
    required: true,
    enum: [
      // Аутентификация
      'login', 'register', 'logout',
      // Доски
      'create_board', 'update_board', 'delete_board',
      // Задачи
      'create_task', 'update_task', 'delete_task',
      // Файлы
      'upload_file', 'delete_file',
      // Профиль
      'update_profile', 'update_settings', 'upload_avatar', 'delete_avatar',
      // Навигация
      'page_view', 'tab_switch',
      // AI
      'ai_chat', 'ai_generate_project', 'ai_create_project', 'ai_generate_task',
      'ai_analyze_project', 'ai_generate_presentation',
      // Поиск
      'search',
      // Тема
      'change_theme',
      // Общее
      'click', 'custom'
    ]
  },
  details: {
    type: String
  },
  // Метаданные страницы/вкладки
  page: {
    type: String // например: 'home', 'boards', 'ai', 'settings' и т.д.
  },
  // Дополнительные данные (JSON)
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  ipAddress: {
    type: String
  },
  userAgent: {
    type: String
  },
  // Информация о устройстве
  device: {
    type: String // 'desktop', 'mobile', 'tablet'
  },
  browser: {
    type: String
  },
  os: {
    type: String
  },
  // Длительность сессии (в секундах)
  sessionDuration: {
    type: Number
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

// Индексы для быстрого поиска
activityLogSchema.index({ user: 1, timestamp: -1 });
activityLogSchema.index({ action: 1, timestamp: -1 });
activityLogSchema.index({ page: 1, timestamp: -1 });
activityLogSchema.index({ timestamp: -1 });

module.exports = mongoose.model('ActivityLog', activityLogSchema);

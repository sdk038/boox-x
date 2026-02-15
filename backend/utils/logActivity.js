const ActivityLog = require('../models/ActivityLog');

const logActivity = async (userId, action, details = '', req = null) => {
  try {
    const activityData = {
      user: userId,
      action,
      details
    };

    // Добавляем IP и User-Agent если есть request объект
    if (req) {
      activityData.ipAddress = req.ip || req.connection.remoteAddress;
      activityData.userAgent = req.headers['user-agent'];
    }

    await ActivityLog.create(activityData);
  } catch (error) {
    console.error('Ошибка логирования активности:', error);
  }
};

module.exports = logActivity;

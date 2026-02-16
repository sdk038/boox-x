const ActivityLog = require('../models/ActivityLog');
const UAParser = require('ua-parser-js');

const logActivity = async (userId, action, details = '', req = null) => {
  try {
    const activityData = {
      user: userId,
      action,
      details
    };

    // Добавляем IP, User-Agent и информацию об устройстве если есть request объект
    if (req) {
      activityData.ipAddress = req.ip || req.connection?.remoteAddress;
      activityData.userAgent = req.headers?.['user-agent'];

      // Парсим информацию о устройстве
      try {
        const parser = new UAParser(req.headers?.['user-agent'] || '');
        const result = parser.getResult();
        activityData.device = result.device?.type || 'desktop';
        activityData.browser = `${result.browser?.name || 'Unknown'} ${result.browser?.version || ''}`.trim();
        activityData.os = `${result.os?.name || 'Unknown'} ${result.os?.version || ''}`.trim();
      } catch (e) {
        // Игнорируем ошибки парсинга UA
      }
    }

    await ActivityLog.create(activityData);
  } catch (error) {
    console.error('Ошибка логирования активности:', error);
  }
};

module.exports = logActivity;

const ActivityLog = require('../models/ActivityLog');
const UAParser = require('ua-parser-js');

// Определение типа устройства из User-Agent
const parseUserAgent = (userAgentStr) => {
  const parser = new UAParser(userAgentStr);
  const result = parser.getResult();
  
  let device = 'desktop';
  if (result.device.type === 'mobile') device = 'mobile';
  else if (result.device.type === 'tablet') device = 'tablet';

  return {
    device,
    browser: `${result.browser.name || 'Unknown'} ${result.browser.version || ''}`.trim(),
    os: `${result.os.name || 'Unknown'} ${result.os.version || ''}`.trim()
  };
};

// @desc    Трекинг действий пользователя
// @route   POST /api/track
// @access  Private
exports.trackEvent = async (req, res) => {
  try {
    const { action, details, page, metadata } = req.body;

    if (!action) {
      return res.status(400).json({ message: 'Действие обязательно' });
    }

    const ua = parseUserAgent(req.headers['user-agent'] || '');

    await ActivityLog.create({
      user: req.user._id,
      action,
      details: details || '',
      page: page || '',
      metadata: metadata || {},
      ipAddress: req.ip || req.connection?.remoteAddress || '',
      userAgent: req.headers['user-agent'] || '',
      device: ua.device,
      browser: ua.browser,
      os: ua.os
    });

    res.json({ success: true });
  } catch (error) {
    // Не блокируем пользователя из-за ошибки трекинга
    console.error('Ошибка трекинга:', error.message);
    res.json({ success: false });
  }
};

// @desc    Батч трекинг (несколько событий за раз)
// @route   POST /api/track/batch
// @access  Private
exports.trackBatch = async (req, res) => {
  try {
    const { events } = req.body;

    if (!events || !Array.isArray(events)) {
      return res.status(400).json({ message: 'Массив событий обязателен' });
    }

    const ua = parseUserAgent(req.headers['user-agent'] || '');

    const logs = events.map(event => ({
      user: req.user._id,
      action: event.action || 'custom',
      details: event.details || '',
      page: event.page || '',
      metadata: event.metadata || {},
      ipAddress: req.ip || req.connection?.remoteAddress || '',
      userAgent: req.headers['user-agent'] || '',
      device: ua.device,
      browser: ua.browser,
      os: ua.os,
      timestamp: event.timestamp ? new Date(event.timestamp) : new Date()
    }));

    await ActivityLog.insertMany(logs);

    res.json({ success: true, tracked: logs.length });
  } catch (error) {
    console.error('Ошибка батч трекинга:', error.message);
    res.json({ success: false });
  }
};

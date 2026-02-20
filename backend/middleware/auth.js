const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Защита маршрутов - требует аутентификации
exports.protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ message: 'Не авторизован, нет токена' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');

    if (!req.user) {
      return res.status(401).json({ message: 'Пользователь не найден' });
    }

    next();
  } catch (error) {
    return res.status(401).json({ message: 'Не авторизован, неверный токен' });
  }
};

// Опциональная авторизация — пропускает гостей, но загружает user если токен есть
exports.optionalAuth = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    req.user = null;
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');
  } catch (_) {
    req.user = null;
  }

  next();
};

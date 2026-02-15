const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Защита маршрутов - требует аутентификации
exports.protect = async (req, res, next) => {
  let token;

  // Проверка наличия токена в заголовках
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  // Проверка существования токена
  if (!token) {
    return res.status(401).json({ message: 'Не авторизован, нет токена' });
  }

  try {
    // Верификация токена
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Получение пользователя из токена
    req.user = await User.findById(decoded.id).select('-password');

    if (!req.user) {
      return res.status(401).json({ message: 'Пользователь не найден' });
    }

    next();
  } catch (error) {
    return res.status(401).json({ message: 'Не авторизован, неверный токен' });
  }
};

const User = require('../models/User');
const Settings = require('../models/Settings');
const generateToken = require('../utils/generateToken');
const logActivity = require('../utils/logActivity');
const multer = require('multer');

// Настройка multer для хранения в памяти (для конвертации в base64)
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // Макс 2MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Разрешены только изображения'), false);
    }
  }
});

exports.uploadAvatar = upload.single('avatar');

// @desc    Регистрация пользователя
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Проверка наличия всех полей
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Пожалуйста, заполните все поля' });
    }

    // Проверка существования пользователя
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'Пользователь с таким email уже существует' });
    }

    // Создание пользователя
    const user = await User.create({ name, email, password });

    // Создание настроек по умолчанию для нового пользователя
    await Settings.create({ user: user._id });

    // Логирование регистрации
    await logActivity(user._id, 'register', `Новый пользователь: ${user.email}`, req);

    if (user) {
      res.status(201).json({
        success: true,
        message: 'Регистрация прошла успешно!',
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          role: user.role,
          createdAt: user.createdAt
        },
        token: generateToken(user._id)
      });
    }
  } catch (error) {
    res.status(500).json({ message: 'Ошибка сервера', error: error.message });
  }
};

// @desc    Вход пользователя
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Проверка наличия всех полей
    if (!email || !password) {
      return res.status(400).json({ message: 'Пожалуйста, введите email и пароль' });
    }

    // Поиск пользователя с паролем
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({ message: 'Неверный email или пароль' });
    }

    // Проверка пароля
    const isPasswordMatch = await user.matchPassword(password);

    if (!isPasswordMatch) {
      return res.status(401).json({ message: 'Неверный email или пароль' });
    }

    // Обновляем lastLogin
    user.lastLogin = new Date();
    await user.save();

    // Логирование входа
    await logActivity(user._id, 'login', `Вход в систему`, req);

    res.json({
      success: true,
      message: 'Вход выполнен успешно!',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt
      },
      token: generateToken(user._id)
    });
  } catch (error) {
    res.status(500).json({ message: 'Ошибка сервера', error: error.message });
  }
};

// @desc    Получить текущего пользователя
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Ошибка сервера', error: error.message });
  }
};

// @desc    Обновить профиль пользователя
// @route   PUT /api/auth/profile
// @access  Private
exports.updateProfile = async (req, res) => {
  try {
    const { name, email } = req.body;

    const user = await User.findById(req.user.id);

    if (user) {
      user.name = name || user.name;
      user.email = email || user.email;

      const updatedUser = await user.save();

      res.json({
        success: true,
        message: 'Профиль обновлен',
        user: {
          id: updatedUser._id,
          name: updatedUser.name,
          email: updatedUser.email,
          avatar: updatedUser.avatar,
          role: updatedUser.role,
          createdAt: updatedUser.createdAt
        }
      });
    }
  } catch (error) {
    res.status(500).json({ message: 'Ошибка сервера', error: error.message });
  }
};

// @desc    Загрузить аватар
// @route   POST /api/auth/avatar
// @access  Private
exports.updateAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Пожалуйста, выберите изображение' });
    }

    // Конвертируем в base64 data URL
    const base64 = req.file.buffer.toString('base64');
    const dataUrl = `data:${req.file.mimetype};base64,${base64}`;

    const user = await User.findById(req.user.id);
    user.avatar = dataUrl;
    await user.save();

    res.json({
      success: true,
      message: 'Аватар обновлен',
      avatar: dataUrl
    });
  } catch (error) {
    res.status(500).json({ message: 'Ошибка сервера', error: error.message });
  }
};

// @desc    Удалить аватар
// @route   DELETE /api/auth/avatar
// @access  Private
exports.deleteAvatar = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    user.avatar = null;
    await user.save();

    res.json({
      success: true,
      message: 'Аватар удален'
    });
  } catch (error) {
    res.status(500).json({ message: 'Ошибка сервера', error: error.message });
  }
};

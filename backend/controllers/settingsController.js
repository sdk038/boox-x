const Settings = require('../models/Settings');

// @desc    Получить настройки пользователя
// @route   GET /api/settings
// @access  Private
exports.getSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne({ user: req.user.id });

    // Если настройки не найдены, создаем их
    if (!settings) {
      settings = await Settings.create({ user: req.user.id });
    }

    res.json({
      success: true,
      settings
    });
  } catch (error) {
    res.status(500).json({ message: 'Ошибка сервера', error: error.message });
  }
};

// @desc    Обновить настройки пользователя
// @route   PUT /api/settings
// @access  Private
exports.updateSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne({ user: req.user.id });

    if (!settings) {
      settings = await Settings.create({
        user: req.user.id,
        ...req.body
      });
    } else {
      settings = await Settings.findOneAndUpdate(
        { user: req.user.id },
        req.body,
        { new: true, runValidators: true }
      );
    }

    res.json({
      success: true,
      message: 'Настройки обновлены',
      settings
    });
  } catch (error) {
    res.status(500).json({ message: 'Ошибка сервера', error: error.message });
  }
};

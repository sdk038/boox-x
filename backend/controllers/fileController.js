const File = require('../models/File');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Настройка хранилища для файлов
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

// Фильтр файлов
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|xls|xlsx|txt|zip/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Неподдерживаемый тип файла'));
  }
};

exports.upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: fileFilter
});

// @desc    Получить все файлы пользователя
// @route   GET /api/files
// @access  Private
exports.getFiles = async (req, res) => {
  try {
    const files = await File.find({ uploadedBy: req.user.id })
      .populate('board', 'name')
      .sort('-uploadedAt');

    res.json({
      success: true,
      count: files.length,
      files
    });
  } catch (error) {
    res.status(500).json({ message: 'Ошибка сервера', error: error.message });
  }
};

// @desc    Загрузить файл
// @route   POST /api/files/upload
// @access  Private
exports.uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Пожалуйста, выберите файл' });
    }

    const file = await File.create({
      name: req.file.originalname,
      originalName: req.file.originalname,
      type: req.file.mimetype,
      size: req.file.size,
      path: req.file.path,
      url: `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`,
      uploadedBy: req.user.id,
      board: req.body.board || null
    });

    res.status(201).json({
      success: true,
      message: 'Файл загружен',
      file
    });
  } catch (error) {
    res.status(500).json({ message: 'Ошибка сервера', error: error.message });
  }
};

// @desc    Удалить файл
// @route   DELETE /api/files/:id
// @access  Private
exports.deleteFile = async (req, res) => {
  try {
    const file = await File.findById(req.params.id);

    if (!file) {
      return res.status(404).json({ message: 'Файл не найден' });
    }

    // Проверка владельца
    if (file.uploadedBy.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Не авторизован для удаления этого файла' });
    }

    // Удаление физического файла
    if (fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }

    await file.deleteOne();

    res.json({
      success: true,
      message: 'Файл удален'
    });
  } catch (error) {
    res.status(500).json({ message: 'Ошибка сервера', error: error.message });
  }
};

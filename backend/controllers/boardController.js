const Board = require('../models/Board');
const Task = require('../models/Task');

// @desc    Получить все доски пользователя
// @route   GET /api/boards
// @access  Private
exports.getBoards = async (req, res) => {
  try {
    const boards = await Board.find({ owner: req.user.id })
      .populate('tasks')
      .sort('-createdAt');

    res.json({
      success: true,
      count: boards.length,
      boards
    });
  } catch (error) {
    res.status(500).json({ message: 'Ошибка сервера', error: error.message });
  }
};

// @desc    Получить одну доску
// @route   GET /api/boards/:id
// @access  Private
exports.getBoard = async (req, res) => {
  try {
    const board = await Board.findById(req.params.id).populate('tasks');

    if (!board) {
      return res.status(404).json({ message: 'Доска не найдена' });
    }

    // Проверка владельца
    if (board.owner.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Не авторизован для доступа к этой доске' });
    }

    res.json({
      success: true,
      board
    });
  } catch (error) {
    res.status(500).json({ message: 'Ошибка сервера', error: error.message });
  }
};

// @desc    Создать доску
// @route   POST /api/boards
// @access  Private
exports.createBoard = async (req, res) => {
  try {
    const { name, color } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Пожалуйста, введите название доски' });
    }

    const board = await Board.create({
      name,
      color: color || '#4066ff',
      owner: req.user.id
    });

    res.status(201).json({
      success: true,
      message: 'Доска создана',
      board
    });
  } catch (error) {
    res.status(500).json({ message: 'Ошибка сервера', error: error.message });
  }
};

// @desc    Обновить доску
// @route   PUT /api/boards/:id
// @access  Private
exports.updateBoard = async (req, res) => {
  try {
    let board = await Board.findById(req.params.id);

    if (!board) {
      return res.status(404).json({ message: 'Доска не найдена' });
    }

    // Проверка владельца
    if (board.owner.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Не авторизован для изменения этой доски' });
    }

    board = await Board.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.json({
      success: true,
      message: 'Доска обновлена',
      board
    });
  } catch (error) {
    res.status(500).json({ message: 'Ошибка сервера', error: error.message });
  }
};

// @desc    Удалить доску
// @route   DELETE /api/boards/:id
// @access  Private
exports.deleteBoard = async (req, res) => {
  try {
    const board = await Board.findById(req.params.id);

    if (!board) {
      return res.status(404).json({ message: 'Доска не найдена' });
    }

    // Проверка владельца
    if (board.owner.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Не авторизован для удаления этой доски' });
    }

    // Удаление всех задач, связанных с доской
    await Task.deleteMany({ board: req.params.id });

    await board.deleteOne();

    res.json({
      success: true,
      message: 'Доска и все связанные задачи удалены'
    });
  } catch (error) {
    res.status(500).json({ message: 'Ошибка сервера', error: error.message });
  }
};

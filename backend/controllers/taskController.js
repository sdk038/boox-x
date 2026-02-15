const Task = require('../models/Task');
const Board = require('../models/Board');

// @desc    Получить все задачи пользователя
// @route   GET /api/tasks
// @access  Private
exports.getTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ createdBy: req.user.id })
      .populate('board', 'name color')
      .populate('assignee', 'name email')
      .sort('-createdAt');

    res.json({
      success: true,
      count: tasks.length,
      tasks
    });
  } catch (error) {
    res.status(500).json({ message: 'Ошибка сервера', error: error.message });
  }
};

// @desc    Получить задачи по доске
// @route   GET /api/boards/:boardId/tasks
// @access  Private
exports.getTasksByBoard = async (req, res) => {
  try {
    const board = await Board.findById(req.params.boardId);

    if (!board) {
      return res.status(404).json({ message: 'Доска не найдена' });
    }

    if (board.owner.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Не авторизован' });
    }

    const tasks = await Task.find({ board: req.params.boardId })
      .populate('assignee', 'name email')
      .sort('-createdAt');

    res.json({
      success: true,
      count: tasks.length,
      tasks
    });
  } catch (error) {
    res.status(500).json({ message: 'Ошибка сервера', error: error.message });
  }
};

// @desc    Создать задачу
// @route   POST /api/tasks
// @access  Private
exports.createTask = async (req, res) => {
  try {
    const { title, description, status, priority, board, assignee, dueDate } = req.body;

    if (!title || !board) {
      return res.status(400).json({ message: 'Пожалуйста, введите название и выберите доску' });
    }

    // Проверка существования доски
    const boardExists = await Board.findById(board);
    if (!boardExists) {
      return res.status(404).json({ message: 'Доска не найдена' });
    }

    if (boardExists.owner.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Не авторизован' });
    }

    const task = await Task.create({
      title,
      description,
      status,
      priority,
      board,
      assignee,
      dueDate,
      createdBy: req.user.id
    });

    // Добавление задачи в доску
    boardExists.tasks.push(task._id);
    await boardExists.save();

    const populatedTask = await Task.findById(task._id)
      .populate('board', 'name color')
      .populate('assignee', 'name email');

    res.status(201).json({
      success: true,
      message: 'Задача создана',
      task: populatedTask
    });
  } catch (error) {
    res.status(500).json({ message: 'Ошибка сервера', error: error.message });
  }
};

// @desc    Обновить задачу
// @route   PUT /api/tasks/:id
// @access  Private
exports.updateTask = async (req, res) => {
  try {
    let task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Задача не найдена' });
    }

    // Проверка владельца
    if (task.createdBy.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Не авторизован для изменения этой задачи' });
    }

    task = await Task.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    }).populate('board', 'name color').populate('assignee', 'name email');

    res.json({
      success: true,
      message: 'Задача обновлена',
      task
    });
  } catch (error) {
    res.status(500).json({ message: 'Ошибка сервера', error: error.message });
  }
};

// @desc    Удалить задачу
// @route   DELETE /api/tasks/:id
// @access  Private
exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Задача не найдена' });
    }

    // Проверка владельца
    if (task.createdBy.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Не авторизован для удаления этой задачи' });
    }

    // Удаление задачи из доски
    await Board.findByIdAndUpdate(task.board, {
      $pull: { tasks: task._id }
    });

    await task.deleteOne();

    res.json({
      success: true,
      message: 'Задача удалена'
    });
  } catch (error) {
    res.status(500).json({ message: 'Ошибка сервера', error: error.message });
  }
};

const User = require('../models/User');
const Board = require('../models/Board');
const Task = require('../models/Task');
const File = require('../models/File');
const ActivityLog = require('../models/ActivityLog');

// @desc    Получить статистику системы
// @route   GET /api/admin/stats
// @access  Private/Admin
exports.getStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalBoards = await Board.countDocuments();
    const totalTasks = await Task.countDocuments();
    const totalFiles = await File.countDocuments();

    // Пользователи за последние 30 дней
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const newUsersLastMonth = await User.countDocuments({ 
      createdAt: { $gte: thirtyDaysAgo } 
    });

    // Активность за сегодня
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const activityToday = await ActivityLog.countDocuments({
      timestamp: { $gte: today }
    });

    // Самые активные пользователи
    const topUsers = await ActivityLog.aggregate([
      {
        $group: {
          _id: '$user',
          activityCount: { $sum: 1 }
        }
      },
      { $sort: { activityCount: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'userInfo'
        }
      },
      { $unwind: '$userInfo' },
      {
        $project: {
          name: '$userInfo.name',
          email: '$userInfo.email',
          activityCount: 1
        }
      }
    ]);

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalBoards,
        totalTasks,
        totalFiles,
        newUsersLastMonth,
        activityToday,
        topUsers
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Ошибка сервера', error: error.message });
  }
};

// @desc    Получить всех пользователей
// @route   GET /api/admin/users
// @access  Private/Admin
exports.getAllUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const users = await User.find()
      .select('-password')
      .sort('-createdAt')
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments();

    // Добавляем статистику для каждого пользователя
    const usersWithStats = await Promise.all(
      users.map(async (user) => {
        const boardCount = await Board.countDocuments({ owner: user._id });
        const taskCount = await Task.countDocuments({ createdBy: user._id });
        const activityCount = await ActivityLog.countDocuments({ user: user._id });

        return {
          ...user.toObject(),
          stats: {
            boards: boardCount,
            tasks: taskCount,
            activities: activityCount
          }
        };
      })
    );

    res.json({
      success: true,
      users: usersWithStats,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Ошибка сервера', error: error.message });
  }
};

// @desc    Получить логи активности
// @route   GET /api/admin/activity
// @access  Private/Admin
exports.getActivity = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;
    const action = req.query.action; // Фильтр по типу действия
    const userId = req.query.userId; // Фильтр по пользователю

    const filter = {};
    if (action) filter.action = action;
    if (userId) filter.user = userId;

    const activities = await ActivityLog.find(filter)
      .populate('user', 'name email')
      .sort('-timestamp')
      .skip(skip)
      .limit(limit);

    const total = await ActivityLog.countDocuments(filter);

    res.json({
      success: true,
      activities,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Ошибка сервера', error: error.message });
  }
};

// @desc    Получить активность конкретного пользователя
// @route   GET /api/admin/users/:id/activity
// @access  Private/Admin
exports.getUserActivity = async (req, res) => {
  try {
    const userId = req.params.id;

    const user = await User.findById(userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }

    const activities = await ActivityLog.find({ user: userId })
      .sort('-timestamp')
      .limit(100);

    const activitySummary = await ActivityLog.aggregate([
      { $match: { user: user._id } },
      {
        $group: {
          _id: '$action',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      success: true,
      user,
      activities,
      summary: activitySummary
    });
  } catch (error) {
    res.status(500).json({ message: 'Ошибка сервера', error: error.message });
  }
};

// @desc    Изменить роль пользователя
// @route   PUT /api/admin/users/:id/role
// @access  Private/Admin
exports.updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;

    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Неверная роль' });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }

    user.role = role;
    await user.save();

    res.json({
      success: true,
      message: `Роль пользователя изменена на ${role}`,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Ошибка сервера', error: error.message });
  }
};

// @desc    Удалить пользователя
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }

    // Не позволяем удалить себя
    if (user._id.toString() === req.user.id) {
      return res.status(400).json({ message: 'Нельзя удалить свой собственный аккаунт' });
    }

    // Удаляем все связанные данные
    await Board.deleteMany({ owner: user._id });
    await Task.deleteMany({ createdBy: user._id });
    await File.deleteMany({ uploadedBy: user._id });
    await ActivityLog.deleteMany({ user: user._id });
    await user.deleteOne();

    res.json({
      success: true,
      message: 'Пользователь и все его данные удалены'
    });
  } catch (error) {
    res.status(500).json({ message: 'Ошибка сервера', error: error.message });
  }
};

// @desc    Получить статистику активности по дням
// @route   GET /api/admin/activity/chart
// @access  Private/Admin
exports.getActivityChart = async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 7;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const activityByDay = await ActivityLog.aggregate([
      {
        $match: {
          timestamp: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$timestamp' }
          },
          count: { $sum: 1 },
          logins: {
            $sum: { $cond: [{ $eq: ['$action', 'login'] }, 1, 0] }
          },
          registers: {
            $sum: { $cond: [{ $eq: ['$action', 'register'] }, 1, 0] }
          }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      success: true,
      data: activityByDay
    });
  } catch (error) {
    res.status(500).json({ message: 'Ошибка сервера', error: error.message });
  }
};

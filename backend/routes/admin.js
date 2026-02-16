const express = require('express');
const router = express.Router();
const {
  getStats,
  getAllUsers,
  getActivity,
  getUserActivity,
  getUserMonitor,
  getMonitoringSummary,
  updateUserRole,
  deleteUser,
  getActivityChart
} = require('../controllers/adminController');
const { protect } = require('../middleware/auth');
const { adminOnly } = require('../middleware/admin');

// Все маршруты требуют аутентификации и прав администратора
router.use(protect);
router.use(adminOnly);

// Статистика
router.get('/stats', getStats);
router.get('/activity/chart', getActivityChart);

// Мониторинг
router.get('/monitoring', getMonitoringSummary);

// Пользователи
router.get('/users', getAllUsers);
router.get('/users/:id/activity', getUserActivity);
router.get('/users/:id/monitor', getUserMonitor);
router.put('/users/:id/role', updateUserRole);
router.delete('/users/:id', deleteUser);

// Логи активности
router.get('/activity', getActivity);

module.exports = router;

const express = require('express');
const router = express.Router();
const {
  generateProject,
  createProjectFromAI,
  generateTask,
  analyzeProject,
  chat
} = require('../controllers/aiController');
const { protect } = require('../middleware/auth');

// Все маршруты требуют аутентификации
router.use(protect);

// Генерация проекта
router.post('/generate-project', generateProject);
router.post('/create-project', createProjectFromAI);

// Генерация задачи
router.post('/generate-task', generateTask);

// Анализ проекта
router.post('/analyze-project', analyzeProject);

// Чат с AI
router.post('/chat', chat);

module.exports = router;

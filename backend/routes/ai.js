const express = require('express');
const router = express.Router();
const {
  generateProject,
  createProjectFromAI,
  generateTask,
  analyzeProject,
  chat,
  generatePresentation
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

// Генерация презентации
router.post('/generate-presentation', generatePresentation);

module.exports = router;

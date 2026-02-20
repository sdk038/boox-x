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
const { protect, optionalAuth } = require('../middleware/auth');

// Доступно гостям (optionalAuth загрузит user если токен есть)
router.post('/generate-presentation', optionalAuth, generatePresentation);
router.post('/chat', optionalAuth, chat);

// Остальные маршруты требуют аутентификации
router.post('/generate-project', protect, generateProject);
router.post('/create-project', protect, createProjectFromAI);
router.post('/generate-task', protect, generateTask);
router.post('/analyze-project', protect, analyzeProject);

module.exports = router;

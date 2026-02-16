const express = require('express');
const router = express.Router();
const { trackEvent, trackBatch } = require('../controllers/trackingController');
const { protect } = require('../middleware/auth');

// Все маршруты требуют аутентификации
router.use(protect);

router.post('/', trackEvent);
router.post('/batch', trackBatch);

module.exports = router;

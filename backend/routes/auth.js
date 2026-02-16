const express = require('express');
const router = express.Router();
const { register, login, getMe, updateProfile, uploadAvatar, updateAvatar, deleteAvatar } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.post('/avatar', protect, uploadAvatar, updateAvatar);
router.delete('/avatar', protect, deleteAvatar);

module.exports = router;

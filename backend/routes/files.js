const express = require('express');
const router = express.Router();
const {
  getFiles,
  uploadFile,
  deleteFile,
  upload
} = require('../controllers/fileController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/', getFiles);
router.post('/upload', upload.single('file'), uploadFile);
router.delete('/:id', deleteFile);

module.exports = router;

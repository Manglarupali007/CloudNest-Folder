const express = require('express');
const router = express.Router();
const {
  createShareLink,
  revokeShareLink,
  getMySharedFiles,
  getSharedFileByToken,
  downloadSharedFile,
  previewSharedFile
} = require('../controllers/shareController');
const { protect } = require('../middleware/authMiddleware');

// Public shared file access
router.get('/view/:token', getSharedFileByToken);
router.get('/download/:token', downloadSharedFile);
router.get('/preview/:token', previewSharedFile);

// Private share management
router.use(protect);
router.get('/my-shares', getMySharedFiles);
router.post('/:fileId', createShareLink);
router.delete('/:fileId', revokeShareLink);

module.exports = router;

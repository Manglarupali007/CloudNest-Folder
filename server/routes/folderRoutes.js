const express = require('express');
const router = express.Router();
const {
  getFolders,
  createFolder,
  getFolder,
  updateFolder,
  toggleStarFolder,
  trashFolder,
  restoreFolder,
  deleteFolderPermanently
} = require('../controllers/folderController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect); // All folder routes protected

router.route('/')
  .get(getFolders)
  .post(createFolder);

router.route('/:id')
  .get(getFolder)
  .put(updateFolder)
  .delete(trashFolder);

router.patch('/:id/star', toggleStarFolder);
router.patch('/:id/restore', restoreFolder);
router.delete('/:id/permanent', deleteFolderPermanently);

module.exports = router;

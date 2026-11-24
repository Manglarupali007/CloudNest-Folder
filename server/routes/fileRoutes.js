const express = require('express');
const router = express.Router();
const {
  getFiles,
  uploadFiles,
  getFile,
  downloadFile,
  previewFile,
  renameFile,
  moveFile,
  toggleStarFile,
  trashFile,
  restoreFile,
  deleteFilePermanently,
  bulkTrashFiles,
  bulkDeleteFiles,
  createDocument,
  updateFileContent,
  updateTags
} = require('../controllers/fileController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.use(protect); // All file routes protected

router.route('/')
  .get(getFiles);

router.post('/upload', upload.array('files', 20), uploadFiles);
router.post('/create-document', createDocument);
router.post('/bulk-trash', bulkTrashFiles);
router.post('/bulk-delete', bulkDeleteFiles);

router.route('/:id')
  .get(getFile)
  .delete(trashFile);

router.get('/:id/download', downloadFile);
router.get('/:id/preview', previewFile);
router.put('/:id/content', updateFileContent);
router.patch('/:id/tags', updateTags);
router.put('/:id/rename', renameFile);
router.patch('/:id/move', moveFile);
router.patch('/:id/star', toggleStarFile);
router.patch('/:id/restore', restoreFile);
router.delete('/:id/permanent', deleteFilePermanently);

module.exports = router;

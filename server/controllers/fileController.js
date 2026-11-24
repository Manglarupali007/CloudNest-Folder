const File = require('../models/File');
const User = require('../models/User');
const Folder = require('../models/Folder');
const path = require('path');
const fs = require('fs');
const { getCategory, logActivity, removeFileFromDisk } = require('../utils/fileHelpers');

// @desc    Get all files with filtering and search
// @route   GET /api/files
// @access  Private
const getFiles = async (req, res, next) => {
  try {
    const { folder, category, starred, trash, search, tag, sortBy, sortOrder } = req.query;
    const filter = { user: req.user._id };

    if (trash === 'true') {
      filter.isTrash = true;
    } else {
      filter.isTrash = false;
    }

    if (starred === 'true') {
      filter.isStarred = true;
    }

    if (category && category !== 'all') {
      filter.category = category;
    }

    if (tag && tag.trim()) {
      filter.tags = tag.trim();
    }

    if (search && search.trim()) {
      filter.name = { $regex: search.trim(), $options: 'i' };
    }

    // Only filter by folder if not searching, not in trash, and not filtering exclusively by category/starred/tag
    if (!search && !tag && starred !== 'true' && trash !== 'true' && (!category || category === 'all')) {
      if (folder && folder !== 'root' && folder !== 'null') {
        filter.folder = folder;
      } else {
        filter.folder = null;
      }
    }

    // Sorting
    const sortField = sortBy || 'createdAt';
    const sortDirection = sortOrder === 'asc' ? 1 : -1;
    const sortOptions = {};
    sortOptions[sortField] = sortDirection;

    const files = await File.find(filter)
      .populate('folder', 'name color')
      .sort(sortOptions);

    res.json({
      success: true,
      count: files.length,
      files
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Upload one or multiple files
// @route   POST /api/files/upload
// @access  Private
const uploadFiles = async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files uploaded'
      });
    }

    const { folderId } = req.body;
    let targetFolder = null;

    if (folderId && folderId !== 'root' && folderId !== 'null' && folderId !== '') {
      targetFolder = await Folder.findOne({ _id: folderId, user: req.user._id });
      if (!targetFolder) {
        // Clean up uploaded files from disk if folder invalid
        req.files.forEach(f => removeFileFromDisk(f.filename));
        return res.status(404).json({
          success: false,
          message: 'Target folder not found'
        });
      }
    }

    // Calculate total size of newly uploaded files
    const totalNewBytes = req.files.reduce((sum, f) => sum + f.size, 0);

    // Check storage quota
    const user = await User.findById(req.user._id);
    if (user.storageUsed + totalNewBytes > user.storageLimit) {
      // Clean up files from disk
      req.files.forEach(f => removeFileFromDisk(f.filename));
      return res.status(400).json({
        success: false,
        message: `Storage quota exceeded. You have ${Math.max(0, user.storageLimit - user.storageUsed)} bytes remaining.`
      });
    }

    // Save files to MongoDB
    const createdFiles = [];

    for (const file of req.files) {
      const category = getCategory(file.mimetype, file.originalname);

      const newFile = await File.create({
        name: file.originalname,
        originalName: file.originalname,
        filename: file.filename,
        user: req.user._id,
        folder: targetFolder ? targetFolder._id : null,
        size: file.size,
        mimeType: file.mimetype,
        category: category
      });

      await logActivity({
        userId: req.user._id,
        action: 'upload',
        targetType: 'file',
        targetName: file.originalname,
        targetId: newFile._id,
        details: { size: file.size, category }
      });

      createdFiles.push(newFile);
    }

    // Update user storage
    user.storageUsed += totalNewBytes;
    await user.save();

    res.status(201).json({
      success: true,
      message: `${createdFiles.length} file(s) uploaded successfully`,
      files: createdFiles
    });
  } catch (error) {
    // If error, remove any disk files that were saved
    if (req.files) {
      req.files.forEach(f => removeFileFromDisk(f.filename));
    }
    next(error);
  }
};

// @desc    Get file metadata
// @route   GET /api/files/:id
// @access  Private
const getFile = async (req, res, next) => {
  try {
    const file = await File.findOne({ _id: req.params.id, user: req.user._id })
      .populate('folder', 'name color');

    if (!file) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

    res.json({
      success: true,
      file
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Download file
// @route   GET /api/files/:id/download
// @access  Private
const downloadFile = async (req, res, next) => {
  try {
    const file = await File.findOne({ _id: req.params.id, user: req.user._id });

    if (!file) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

    const uploadsDir = path.join(__dirname, '..', 'uploads');
    const filePath = path.join(uploadsDir, file.filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'Physical file not found on disk'
      });
    }

    file.downloadCount += 1;
    await file.save();

    await logActivity({
      userId: req.user._id,
      action: 'download',
      targetType: 'file',
      targetName: file.name,
      targetId: file._id
    });

    res.download(filePath, file.name);
  } catch (error) {
    next(error);
  }
};

// @desc    Preview file inline (for images, pdfs, audio, video, text)
// @route   GET /api/files/:id/preview
// @access  Private
const previewFile = async (req, res, next) => {
  try {
    const file = await File.findOne({ _id: req.params.id, user: req.user._id });

    if (!file) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

    const uploadsDir = path.join(__dirname, '..', 'uploads');
    const filePath = path.join(uploadsDir, file.filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'Physical file not found on disk'
      });
    }

    res.setHeader('Content-Type', file.mimeType || 'application/octet-stream');
    res.setHeader('Content-Disposition', `inline; filename="${file.name}"`);

    const readStream = fs.createReadStream(filePath);
    readStream.pipe(res);
  } catch (error) {
    next(error);
  }
};

// @desc    Rename file
// @route   PUT /api/files/:id/rename
// @access  Private
const renameFile = async (req, res, next) => {
  try {
    const { name } = req.body;
    const file = await File.findOne({ _id: req.params.id, user: req.user._id });

    if (!file) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'File name is required'
      });
    }

    const oldName = file.name;
    let newName = name.trim();

    // Preserve original extension if user didn't type it
    const originalExt = path.extname(file.name);
    if (originalExt && !newName.endsWith(originalExt)) {
      newName = `${newName}${originalExt}`;
    }

    file.name = newName;
    await file.save();

    await logActivity({
      userId: req.user._id,
      action: 'rename',
      targetType: 'file',
      targetName: file.name,
      targetId: file._id,
      details: { oldName, newName: file.name }
    });

    res.json({
      success: true,
      file
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Move file to another folder
// @route   PATCH /api/files/:id/move
// @access  Private
const moveFile = async (req, res, next) => {
  try {
    const { folderId } = req.body;
    const file = await File.findOne({ _id: req.params.id, user: req.user._id });

    if (!file) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

    let targetFolderId = null;
    let targetFolderName = 'Root';

    if (folderId && folderId !== 'root' && folderId !== 'null') {
      const folder = await Folder.findOne({ _id: folderId, user: req.user._id });
      if (!folder) {
        return res.status(404).json({
          success: false,
          message: 'Target folder not found'
        });
      }
      targetFolderId = folder._id;
      targetFolderName = folder.name;
    }

    file.folder = targetFolderId;
    await file.save();

    await logActivity({
      userId: req.user._id,
      action: 'move',
      targetType: 'file',
      targetName: file.name,
      targetId: file._id,
      details: { destination: targetFolderName }
    });

    res.json({
      success: true,
      file
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle file star
// @route   PATCH /api/files/:id/star
// @access  Private
const toggleStarFile = async (req, res, next) => {
  try {
    const file = await File.findOne({ _id: req.params.id, user: req.user._id });

    if (!file) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

    file.isStarred = !file.isStarred;
    await file.save();

    await logActivity({
      userId: req.user._id,
      action: file.isStarred ? 'star' : 'unstar',
      targetType: 'file',
      targetName: file.name,
      targetId: file._id
    });

    res.json({
      success: true,
      file
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Move file to trash
// @route   DELETE /api/files/:id
// @access  Private
const trashFile = async (req, res, next) => {
  try {
    const file = await File.findOne({ _id: req.params.id, user: req.user._id });

    if (!file) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

    file.isTrash = true;
    file.trashedAt = new Date();
    await file.save();

    await logActivity({
      userId: req.user._id,
      action: 'delete',
      targetType: 'file',
      targetName: file.name,
      targetId: file._id
    });

    res.json({
      success: true,
      message: 'File moved to trash'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Restore file from trash
// @route   PATCH /api/files/:id/restore
// @access  Private
const restoreFile = async (req, res, next) => {
  try {
    const file = await File.findOne({ _id: req.params.id, user: req.user._id });

    if (!file) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

    file.isTrash = false;
    file.trashedAt = null;
    await file.save();

    await logActivity({
      userId: req.user._id,
      action: 'restore',
      targetType: 'file',
      targetName: file.name,
      targetId: file._id
    });

    res.json({
      success: true,
      file
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Permanently delete file
// @route   DELETE /api/files/:id/permanent
// @access  Private
const deleteFilePermanently = async (req, res, next) => {
  try {
    const file = await File.findOne({ _id: req.params.id, user: req.user._id });

    if (!file) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

    // Delete disk file
    removeFileFromDisk(file.filename);

    // Reclaim storage quota
    await User.findByIdAndUpdate(req.user._id, {
      $inc: { storageUsed: -file.size }
    });

    await file.deleteOne();

    await logActivity({
      userId: req.user._id,
      action: 'permanent_delete',
      targetType: 'file',
      targetName: file.name
    });

    res.json({
      success: true,
      message: 'File permanently deleted'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Bulk move files to trash
// @route   POST /api/files/bulk-trash
// @access  Private
const bulkTrashFiles = async (req, res, next) => {
  try {
    const { fileIds } = req.body;

    if (!fileIds || !Array.isArray(fileIds) || fileIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an array of file IDs'
      });
    }

    await File.updateMany(
      { _id: { $in: fileIds }, user: req.user._id },
      { isTrash: true, trashedAt: new Date() }
    );

    res.json({
      success: true,
      message: `${fileIds.length} files moved to trash`
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Bulk permanently delete files
// @route   POST /api/files/bulk-delete
// @access  Private
const bulkDeleteFiles = async (req, res, next) => {
  try {
    const { fileIds } = req.body;

    if (!fileIds || !Array.isArray(fileIds) || fileIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an array of file IDs'
      });
    }

    const files = await File.find({ _id: { $in: fileIds }, user: req.user._id });
    let totalFreedBytes = 0;

    for (const file of files) {
      removeFileFromDisk(file.filename);
      totalFreedBytes += file.size;
      await file.deleteOne();
    }

    if (totalFreedBytes > 0) {
      await User.findByIdAndUpdate(req.user._id, {
        $inc: { storageUsed: -totalFreedBytes }
      });
    }

    res.json({
      success: true,
      message: `${files.length} files permanently deleted`
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new document/note directly in the browser
// @route   POST /api/files/create-document
// @access  Private
const createDocument = async (req, res, next) => {
  try {
    const { name, content = '', folderId, extension = 'md' } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Document name is required'
      });
    }

    const cleanExt = extension.replace('.', '').toLowerCase() || 'md';
    let baseName = name.trim();
    if (!baseName.endsWith(`.${cleanExt}`)) {
      baseName = `${baseName}.${cleanExt}`;
    }

    const uploadsDir = path.join(__dirname, '..', 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const diskFilename = `doc_${uniqueSuffix}.${cleanExt}`;
    const filePath = path.join(uploadsDir, diskFilename);

    fs.writeFileSync(filePath, content, 'utf8');
    const bytes = Buffer.byteLength(content, 'utf8');

    // Check user quota
    const user = await User.findById(req.user._id);
    if (user.storageUsed + bytes > user.storageLimit) {
      removeFileFromDisk(diskFilename);
      return res.status(400).json({
        success: false,
        message: 'Storage quota exceeded'
      });
    }

    let targetFolder = null;
    if (folderId && folderId !== 'root' && folderId !== 'null') {
      targetFolder = await Folder.findOne({ _id: folderId, user: req.user._id });
    }

    const mimeMap = {
      md: 'text/markdown',
      txt: 'text/plain',
      json: 'application/json',
      js: 'application/javascript',
      html: 'text/html',
      py: 'text/x-python',
      css: 'text/css'
    };

    const mimeType = mimeMap[cleanExt] || 'text/plain';
    const category = getCategory(mimeType, baseName);

    const newFile = await File.create({
      name: baseName,
      originalName: baseName,
      filename: diskFilename,
      user: req.user._id,
      folder: targetFolder ? targetFolder._id : null,
      size: bytes,
      mimeType,
      category
    });

    user.storageUsed += bytes;
    await user.save();

    await logActivity({
      userId: req.user._id,
      action: 'upload',
      targetType: 'file',
      targetName: baseName,
      targetId: newFile._id,
      details: { size: bytes, category, isCreatedDocument: true }
    });

    res.status(201).json({
      success: true,
      message: 'Document created successfully',
      file: newFile
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update text/code file content directly in the browser
// @route   PUT /api/files/:id/content
// @access  Private
const updateFileContent = async (req, res, next) => {
  try {
    const { content = '' } = req.body;
    const file = await File.findOne({ _id: req.params.id, user: req.user._id });

    if (!file) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

    const uploadsDir = path.join(__dirname, '..', 'uploads');
    const filePath = path.join(uploadsDir, file.filename);

    const newBytes = Buffer.byteLength(content, 'utf8');
    const diff = newBytes - file.size;

    // Check user quota if size increased
    const user = await User.findById(req.user._id);
    if (diff > 0 && user.storageUsed + diff > user.storageLimit) {
      return res.status(400).json({
        success: false,
        message: 'Storage quota exceeded'
      });
    }

    fs.writeFileSync(filePath, content, 'utf8');

    file.size = newBytes;
    await file.save();

    if (diff !== 0) {
      user.storageUsed += diff;
      await user.save();
    }

    await logActivity({
      userId: req.user._id,
      action: 'rename',
      targetType: 'file',
      targetName: file.name,
      targetId: file._id,
      details: { contentUpdated: true, newSize: newBytes }
    });

    res.json({
      success: true,
      message: 'File content saved successfully',
      file
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update tags for a file
// @route   PATCH /api/files/:id/tags
// @access  Private
const updateTags = async (req, res, next) => {
  try {
    const { tags } = req.body;
    const file = await File.findOne({ _id: req.params.id, user: req.user._id });

    if (!file) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

    if (Array.isArray(tags)) {
      file.tags = tags.map((t) => t.trim()).filter(Boolean);
      await file.save();
    }

    res.json({
      success: true,
      message: 'Tags updated successfully',
      file
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
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
};

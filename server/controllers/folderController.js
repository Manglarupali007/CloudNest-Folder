const Folder = require('../models/Folder');
const File = require('../models/File');
const User = require('../models/User');
const { logActivity, removeFileFromDisk } = require('../utils/fileHelpers');

// Helper to build breadcrumb trail
const buildBreadcrumbs = async (folderId, userId) => {
  const breadcrumbs = [];
  let currentId = folderId;

  while (currentId) {
    const folder = await Folder.findOne({ _id: currentId, user: userId }).select('name parent');
    if (!folder) break;
    breadcrumbs.unshift({ id: folder._id, name: folder.name });
    currentId = folder.parent;
  }

  return breadcrumbs;
};

// @desc    Get user folders
// @route   GET /api/folders
// @access  Private
const getFolders = async (req, res, next) => {
  try {
    const { parent, trash, all, starred } = req.query;
    const filter = { user: req.user._id };

    if (trash === 'true') {
      filter.isTrash = true;
    } else {
      filter.isTrash = false;
    }

    if (starred === 'true') {
      filter.isStarred = true;
    }

    // If 'all' is true, return all user folders for picker/move dialogs
    if (all !== 'true' && starred !== 'true' && trash !== 'true') {
      if (parent && parent !== 'root' && parent !== 'null') {
        filter.parent = parent;
      } else {
        filter.parent = null;
      }
    }

    const folders = await Folder.find(filter).sort({ name: 1 });

    // Count items inside each folder
    const foldersWithCounts = await Promise.all(
      folders.map(async (folder) => {
        const fileCount = await File.countDocuments({
          user: req.user._id,
          folder: folder._id,
          isTrash: false
        });
        const subfolderCount = await Folder.countDocuments({
          user: req.user._id,
          parent: folder._id,
          isTrash: false
        });
        return {
          ...folder.toObject(),
          itemCount: fileCount + subfolderCount
        };
      })
    );

    res.json({
      success: true,
      count: foldersWithCounts.length,
      folders: foldersWithCounts
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new folder
// @route   POST /api/folders
// @access  Private
const createFolder = async (req, res, next) => {
  try {
    const { name, parent, color } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Folder name is required'
      });
    }

    let parentId = null;
    if (parent && parent !== 'root' && parent !== 'null') {
      const parentFolder = await Folder.findOne({ _id: parent, user: req.user._id });
      if (!parentFolder) {
        return res.status(404).json({
          success: false,
          message: 'Parent folder not found'
        });
      }
      parentId = parentFolder._id;
    }

    const trimmedName = name.trim();

    // Check duplicate in same directory
    const existing = await Folder.findOne({
      user: req.user._id,
      parent: parentId,
      name: trimmedName,
      isTrash: false
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'A folder with this name already exists here'
      });
    }

    const folder = await Folder.create({
      name: trimmedName,
      user: req.user._id,
      parent: parentId,
      color: color || 'blue'
    });

    await logActivity({
      userId: req.user._id,
      action: 'create_folder',
      targetType: 'folder',
      targetName: folder.name,
      targetId: folder._id
    });

    res.status(201).json({
      success: true,
      folder: {
        ...folder.toObject(),
        itemCount: 0
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get folder details with breadcrumbs
// @route   GET /api/folders/:id
// @access  Private
const getFolder = async (req, res, next) => {
  try {
    const folder = await Folder.findOne({ _id: req.params.id, user: req.user._id });

    if (!folder) {
      return res.status(404).json({
        success: false,
        message: 'Folder not found'
      });
    }

    const breadcrumbs = await buildBreadcrumbs(folder._id, req.user._id);

    res.json({
      success: true,
      folder,
      breadcrumbs
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update/Rename folder
// @route   PUT /api/folders/:id
// @access  Private
const updateFolder = async (req, res, next) => {
  try {
    const { name, color } = req.body;
    const folder = await Folder.findOne({ _id: req.params.id, user: req.user._id });

    if (!folder) {
      return res.status(404).json({
        success: false,
        message: 'Folder not found'
      });
    }

    const oldName = folder.name;

    if (name && name.trim()) {
      folder.name = name.trim();
    }

    if (color) {
      folder.color = color;
    }

    await folder.save();

    if (name && name.trim() !== oldName) {
      await logActivity({
        userId: req.user._id,
        action: 'rename',
        targetType: 'folder',
        targetName: folder.name,
        targetId: folder._id,
        details: { oldName, newName: folder.name }
      });
    }

    res.json({
      success: true,
      folder
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle folder star
// @route   PATCH /api/folders/:id/star
// @access  Private
const toggleStarFolder = async (req, res, next) => {
  try {
    const folder = await Folder.findOne({ _id: req.params.id, user: req.user._id });

    if (!folder) {
      return res.status(404).json({
        success: false,
        message: 'Folder not found'
      });
    }

    folder.isStarred = !folder.isStarred;
    await folder.save();

    await logActivity({
      userId: req.user._id,
      action: folder.isStarred ? 'star' : 'unstar',
      targetType: 'folder',
      targetName: folder.name,
      targetId: folder._id
    });

    res.json({
      success: true,
      folder
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Move folder to trash
// @route   DELETE /api/folders/:id
// @access  Private
const trashFolder = async (req, res, next) => {
  try {
    const folder = await Folder.findOne({ _id: req.params.id, user: req.user._id });

    if (!folder) {
      return res.status(404).json({
        success: false,
        message: 'Folder not found'
      });
    }

    folder.isTrash = true;
    folder.trashedAt = new Date();
    await folder.save();

    // Soft delete contained files as well
    await File.updateMany(
      { folder: folder._id, user: req.user._id },
      { isTrash: true, trashedAt: new Date() }
    );

    await logActivity({
      userId: req.user._id,
      action: 'delete',
      targetType: 'folder',
      targetName: folder.name,
      targetId: folder._id
    });

    res.json({
      success: true,
      message: 'Folder moved to trash'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Restore folder from trash
// @route   PATCH /api/folders/:id/restore
// @access  Private
const restoreFolder = async (req, res, next) => {
  try {
    const folder = await Folder.findOne({ _id: req.params.id, user: req.user._id });

    if (!folder) {
      return res.status(404).json({
        success: false,
        message: 'Folder not found'
      });
    }

    folder.isTrash = false;
    folder.trashedAt = null;
    await folder.save();

    // Also restore files inside
    await File.updateMany(
      { folder: folder._id, user: req.user._id },
      { isTrash: false, trashedAt: null }
    );

    await logActivity({
      userId: req.user._id,
      action: 'restore',
      targetType: 'folder',
      targetName: folder.name,
      targetId: folder._id
    });

    res.json({
      success: true,
      folder
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Permanently delete folder & all its contents
// @route   DELETE /api/folders/:id/permanent
// @access  Private
const deleteFolderPermanently = async (req, res, next) => {
  try {
    const folder = await Folder.findOne({ _id: req.params.id, user: req.user._id });

    if (!folder) {
      return res.status(404).json({
        success: false,
        message: 'Folder not found'
      });
    }

    // Find and delete all files in this folder
    const files = await File.find({ folder: folder._id, user: req.user._id });
    let totalFreedBytes = 0;

    for (const file of files) {
      removeFileFromDisk(file.filename);
      totalFreedBytes += file.size;
      await file.deleteOne();
    }

    // Reclaim storage quota
    if (totalFreedBytes > 0) {
      await User.findByIdAndUpdate(req.user._id, {
        $inc: { storageUsed: -totalFreedBytes }
      });
    }

    await folder.deleteOne();

    await logActivity({
      userId: req.user._id,
      action: 'permanent_delete',
      targetType: 'folder',
      targetName: folder.name
    });

    res.json({
      success: true,
      message: 'Folder permanently deleted'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getFolders,
  createFolder,
  getFolder,
  updateFolder,
  toggleStarFolder,
  trashFolder,
  restoreFolder,
  deleteFolderPermanently
};

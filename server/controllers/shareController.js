const File = require('../models/File');
const crypto = require('crypto');
const path = require('path');
const fs = require('fs');
const { logActivity } = require('../utils/fileHelpers');

// @desc    Generate or retrieve share link for a file
// @route   POST /api/share/:fileId
// @access  Private
const createShareLink = async (req, res, next) => {
  try {
    const { expiresInDays } = req.body;
    const file = await File.findOne({ _id: req.params.fileId, user: req.user._id });

    if (!file) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

    if (!file.shareToken) {
      file.shareToken = crypto.randomBytes(16).toString('hex');
    }

    file.isPublic = true;

    if (expiresInDays && Number(expiresInDays) > 0) {
      const expireDate = new Date();
      expireDate.setDate(expireDate.getDate() + Number(expiresInDays));
      file.shareExpires = expireDate;
    } else {
      file.shareExpires = null;
    }

    await file.save();

    await logActivity({
      userId: req.user._id,
      action: 'share_created',
      targetType: 'file',
      targetName: file.name,
      targetId: file._id,
      details: { token: file.shareToken, expires: file.shareExpires }
    });

    res.json({
      success: true,
      shareToken: file.shareToken,
      shareExpires: file.shareExpires,
      isPublic: file.isPublic,
      file
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Revoke public share link
// @route   DELETE /api/share/:fileId
// @access  Private
const revokeShareLink = async (req, res, next) => {
  try {
    const file = await File.findOne({ _id: req.params.fileId, user: req.user._id });

    if (!file) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

    file.isPublic = false;
    file.shareToken = null;
    file.shareExpires = null;
    await file.save();

    await logActivity({
      userId: req.user._id,
      action: 'share_revoked',
      targetType: 'file',
      targetName: file.name,
      targetId: file._id
    });

    res.json({
      success: true,
      message: 'Share link revoked successfully',
      file
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all files shared by current user
// @route   GET /api/share/my-shares
// @access  Private
const getMySharedFiles = async (req, res, next) => {
  try {
    const sharedFiles = await File.find({
      user: req.user._id,
      isPublic: true,
      isTrash: false
    }).sort({ updatedAt: -1 });

    res.json({
      success: true,
      count: sharedFiles.length,
      files: sharedFiles
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get shared file info by token
// @route   GET /api/share/view/:token
// @access  Public
const getSharedFileByToken = async (req, res, next) => {
  try {
    const { token } = req.params;
    const file = await File.findOne({ shareToken: token, isPublic: true, isTrash: false })
      .populate('user', 'name');

    if (!file) {
      return res.status(404).json({
        success: false,
        message: 'Shared file not found or link has expired'
      });
    }

    // Check expiration
    if (file.shareExpires && new Date() > new Date(file.shareExpires)) {
      return res.status(410).json({
        success: false,
        message: 'This share link has expired'
      });
    }

    res.json({
      success: true,
      file: {
        id: file._id,
        name: file.name,
        size: file.size,
        mimeType: file.mimeType,
        category: file.category,
        downloadCount: file.downloadCount,
        createdAt: file.createdAt,
        owner: file.user ? file.user.name : 'CloudNest User',
        shareToken: file.shareToken
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Download shared file by token
// @route   GET /api/share/download/:token
// @access  Public
const downloadSharedFile = async (req, res, next) => {
  try {
    const { token } = req.params;
    const file = await File.findOne({ shareToken: token, isPublic: true, isTrash: false });

    if (!file) {
      return res.status(404).json({
        success: false,
        message: 'Shared file not found or link has expired'
      });
    }

    if (file.shareExpires && new Date() > new Date(file.shareExpires)) {
      return res.status(410).json({
        success: false,
        message: 'This share link has expired'
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

    res.download(filePath, file.name);
  } catch (error) {
    next(error);
  }
};

// @desc    Preview shared file inline by token
// @route   GET /api/share/preview/:token
// @access  Public
const previewSharedFile = async (req, res, next) => {
  try {
    const { token } = req.params;
    const file = await File.findOne({ shareToken: token, isPublic: true, isTrash: false });

    if (!file) {
      return res.status(404).json({
        success: false,
        message: 'Shared file not found or link has expired'
      });
    }

    if (file.shareExpires && new Date() > new Date(file.shareExpires)) {
      return res.status(410).json({
        success: false,
        message: 'This share link has expired'
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

module.exports = {
  createShareLink,
  revokeShareLink,
  getMySharedFiles,
  getSharedFileByToken,
  downloadSharedFile,
  previewSharedFile
};

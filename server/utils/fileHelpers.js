const fs = require('fs');
const path = require('path');
const Activity = require('../models/Activity');

// Determine file category based on mimetype and extension
const getCategory = (mimeType = '', filename = '') => {
  const ext = path.extname(filename).toLowerCase().replace('.', '');

  if (mimeType.startsWith('image/') || ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg', 'bmp', 'ico'].includes(ext)) {
    return 'image';
  }
  if (
    ['pdf', 'doc', 'docx', 'txt', 'rtf', 'odt', 'xls', 'xlsx', 'csv', 'ppt', 'pptx'].includes(ext) ||
    mimeType.includes('pdf') ||
    mimeType.includes('document') ||
    mimeType.includes('sheet') ||
    mimeType.includes('presentation') ||
    mimeType.includes('text/plain')
  ) {
    return 'document';
  }
  if (mimeType.startsWith('video/') || ['mp4', 'mkv', 'webm', 'avi', 'mov', 'wmv'].includes(ext)) {
    return 'video';
  }
  if (mimeType.startsWith('audio/') || ['mp3', 'wav', 'ogg', 'flac', 'aac', 'm4a'].includes(ext)) {
    return 'audio';
  }
  if (['zip', 'rar', '7z', 'tar', 'gz', 'bz2'].includes(ext) || mimeType.includes('zip') || mimeType.includes('compressed')) {
    return 'archive';
  }
  if (
    [
      'js', 'jsx', 'ts', 'tsx', 'html', 'css', 'json', 'py', 'java', 'c', 'cpp',
      'cs', 'php', 'rb', 'sql', 'sh', 'md', 'xml', 'yaml', 'yml'
    ].includes(ext) ||
    mimeType.includes('javascript') ||
    mimeType.includes('json') ||
    mimeType.includes('html') ||
    mimeType.includes('xml')
  ) {
    return 'code';
  }

  return 'other';
};

// Format bytes into human-readable size
const formatBytes = (bytes, decimals = 2) => {
  if (!bytes || bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

// Log user activity
const logActivity = async ({ userId, action, targetType, targetName, targetId = null, details = {} }) => {
  try {
    await Activity.create({
      user: userId,
      action,
      targetType,
      targetName,
      targetId,
      details
    });
  } catch (err) {
    console.error('Failed to log activity:', err.message);
  }
};

// Safely delete file from disk
const removeFileFromDisk = (filename) => {
  if (!filename) return;
  const uploadsDir = path.join(__dirname, '..', 'uploads');
  const filePath = path.join(uploadsDir, filename);

  if (fs.existsSync(filePath)) {
    try {
      fs.unlinkSync(filePath);
    } catch (err) {
      console.error(`Error deleting physical file ${filename}:`, err.message);
    }
  }
};

module.exports = {
  getCategory,
  formatBytes,
  logActivity,
  removeFileFromDisk
};

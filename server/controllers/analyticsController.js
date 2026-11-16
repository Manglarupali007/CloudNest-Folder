const File = require('../models/File');
const Folder = require('../models/Folder');
const User = require('../models/User');
const Activity = require('../models/Activity');

// @desc    Get storage statistics & category breakdown
// @route   GET /api/analytics/storage
// @access  Private
const getStorageOverview = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    // Group files by category
    const categoryStats = await File.aggregate([
      { $match: { user: user._id, isTrash: false } },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          totalBytes: { $sum: '$size' }
        }
      }
    ]);

    // Format breakdown with all possible categories
    const categories = ['image', 'document', 'audio', 'video', 'archive', 'code', 'other'];
    const breakdown = {};
    let totalUsedFromFiles = 0;

    categories.forEach(cat => {
      const found = categoryStats.find(item => item._id === cat);
      const bytes = found ? found.totalBytes : 0;
      const count = found ? found.count : 0;
      breakdown[cat] = {
        category: cat,
        bytes,
        count
      };
      totalUsedFromFiles += bytes;
    });

    // Counts
    const totalFiles = await File.countDocuments({ user: user._id, isTrash: false });
    const totalFolders = await Folder.countDocuments({ user: user._id, isTrash: false });
    const starredFiles = await File.countDocuments({ user: user._id, isStarred: true, isTrash: false });
    const starredFolders = await Folder.countDocuments({ user: user._id, isStarred: true, isTrash: false });
    const trashFiles = await File.countDocuments({ user: user._id, isTrash: true });
    const trashFolders = await Folder.countDocuments({ user: user._id, isTrash: true });

    const storageLimit = user.storageLimit || 524288000;
    const usagePercent = Math.min(100, Math.round((totalUsedFromFiles / storageLimit) * 100));

    res.json({
      success: true,
      storage: {
        used: totalUsedFromFiles,
        limit: storageLimit,
        percent: usagePercent,
        breakdown,
        totalFiles,
        totalFolders,
        starredCount: starredFiles + starredFolders,
        trashCount: trashFiles + trashFolders
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user activity log
// @route   GET /api/analytics/activity
// @access  Private
const getRecentActivities = async (req, res, next) => {
  try {
    const limit = Number(req.query.limit) || 20;

    const activities = await Activity.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(limit);

    res.json({
      success: true,
      count: activities.length,
      activities
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getStorageOverview,
  getRecentActivities
};

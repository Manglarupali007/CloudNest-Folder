const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    action: {
      type: String,
      required: true,
      enum: [
        'upload',
        'rename',
        'move',
        'delete',
        'restore',
        'permanent_delete',
        'star',
        'unstar',
        'share_created',
        'share_revoked',
        'download',
        'create_folder'
      ]
    },
    targetType: {
      type: String,
      required: true,
      enum: ['file', 'folder']
    },
    targetName: {
      type: String,
      required: true
    },
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null
    },
    details: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    }
  },
  {
    timestamps: true
  }
);

activitySchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('Activity', activitySchema);

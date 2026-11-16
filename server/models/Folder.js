const mongoose = require('mongoose');

const folderSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Folder name is required'],
      trim: true,
      maxlength: [100, 'Folder name cannot exceed 100 characters']
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Folder',
      default: null,
      index: true
    },
    color: {
      type: String,
      default: 'blue',
      enum: ['blue', 'purple', 'emerald', 'amber', 'rose', 'slate', 'indigo']
    },
    isStarred: {
      type: Boolean,
      default: false,
      index: true
    },
    isTrash: {
      type: Boolean,
      default: false,
      index: true
    },
    trashedAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

// Prevent duplicate folder names in same parent directory for same user
folderSchema.index({ user: 1, parent: 1, name: 1, isTrash: 1 }, { unique: true });

module.exports = mongoose.model('Folder', folderSchema);

const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'File name is required'],
      trim: true
    },
    originalName: {
      type: String,
      required: true
    },
    filename: {
      type: String,
      required: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    folder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Folder',
      default: null,
      index: true
    },
    size: {
      type: Number,
      required: true,
      min: 0
    },
    mimeType: {
      type: String,
      required: true
    },
    category: {
      type: String,
      enum: ['image', 'document', 'audio', 'video', 'archive', 'code', 'other'],
      default: 'other',
      index: true
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
    },
    isPublic: {
      type: Boolean,
      default: false,
      index: true
    },
    shareToken: {
      type: String,
      default: null,
      index: true
    },
    shareExpires: {
      type: Date,
      default: null
    },
    downloadCount: {
      type: Number,
      default: 0
    },
    tags: [
      {
        type: String,
        trim: true
      }
    ]
  },
  {
    timestamps: true
  }
);

// Indexes for common queries
fileSchema.index({ user: 1, folder: 1, isTrash: 1 });
fileSchema.index({ user: 1, isStarred: 1 });
fileSchema.index({ user: 1, category: 1 });

module.exports = mongoose.model('File', fileSchema);

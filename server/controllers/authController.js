const User = require('../models/User');
const Folder = require('../models/Folder');
const File = require('../models/File');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
const { logActivity, getCategory } = require('../utils/fileHelpers');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'cloudnest_super_secret_jwt_key_2026_secure', {
    expiresIn: process.env.JWT_EXPIRE || '30d'
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email and password'
      });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email address'
      });
    }

    const user = await User.create({
      name,
      email,
      password,
      storageLimit: Number(process.env.DEFAULT_STORAGE_LIMIT) || 524288000
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        storageUsed: user.storageUsed,
        storageLimit: user.storageLimit,
        role: user.role,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        storageUsed: user.storageUsed,
        storageLimit: user.storageLimit,
        role: user.role,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user profile & storage info
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    // Calculate actual storage used from files in database
    const storageStats = await File.aggregate([
      { $match: { user: user._id, isTrash: false } },
      { $group: { _id: null, totalBytes: { $sum: '$size' } } }
    ]);

    const actualUsage = storageStats.length > 0 ? storageStats[0].totalBytes : 0;
    if (user.storageUsed !== actualUsage) {
      user.storageUsed = actualUsage;
      await user.save();
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        storageUsed: user.storageUsed,
        storageLimit: user.storageLimit,
        role: user.role,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('+password');

    if (req.body.name) {
      user.name = req.body.name;
    }

    if (req.body.password) {
      user.password = req.body.password;
    }

    await user.save();

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        storageUsed: user.storageUsed,
        storageLimit: user.storageLimit,
        role: user.role
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Instant Demo Login with Sample Files & Folders
// @route   POST /api/auth/demo-login
// @access  Public
const demoLogin = async (req, res, next) => {
  try {
    const demoEmail = 'alex.demo@cloudnest.io';
    let demoUser = await User.findOne({ email: demoEmail });

    if (!demoUser) {
      demoUser = await User.create({
        name: 'Alex Rivera',
        email: demoEmail,
        password: 'CloudNestDemo2026!',
        storageLimit: 524288000 // 500 MB
      });

      // Seed sample folders
      const docsFolder = await Folder.create({
        name: 'Work Documents',
        user: demoUser._id,
        color: 'blue'
      });

      const designFolder = await Folder.create({
        name: 'Design Assets',
        user: demoUser._id,
        color: 'purple'
      });

      const personalFolder = await Folder.create({
        name: 'Personal & Receipts',
        user: demoUser._id,
        color: 'emerald'
      });

      // Sample subfolder
      const specsFolder = await Folder.create({
        name: 'Project Specs',
        user: demoUser._id,
        parent: docsFolder._id,
        color: 'indigo'
      });

      // Seed physical sample files in uploads
      const uploadsDir = path.join(__dirname, '..', 'uploads');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      // Sample file 1: Welcome guide markdown
      const guideFilename = `CloudNest_Architecture_Guide-${Date.now()}.md`;
      const guideContent = `# CloudNest Architecture & System Overview
Welcome to CloudNest - the modern, cloud-inspired file storage and organization engine!

## Key Highlights
- **Full-Stack MERN Architecture**: Node.js, Express, MongoDB Mongoose, and React.
- **RESTful Endpoints**: Authentication, Folder hierarchy, File lifecycle, and Analytics.
- **Granular Storage Controls**: Live quota tracking, dynamic folder nesting, and safe trash recovery.
- **Instant Previews**: Direct viewing of documents, images, code, and media.
- **Secure Share Links**: Cryptographic tokens for public/private asset sharing.
`;
      fs.writeFileSync(path.join(uploadsDir, guideFilename), guideContent);
      const guideSize = Buffer.byteLength(guideContent);

      const f1 = await File.create({
        name: 'CloudNest_Architecture_Guide.md',
        originalName: 'CloudNest_Architecture_Guide.md',
        filename: guideFilename,
        user: demoUser._id,
        folder: null,
        size: guideSize,
        mimeType: 'text/markdown',
        category: 'code',
        isStarred: true
      });

      // Sample file 2: Project Specification JSON
      const specFilename = `API_Specifications-${Date.now()}.json`;
      const specContent = JSON.stringify({
        project: "CloudNest Cloud Storage",
        version: "1.0.0",
        author: "Alex Rivera",
        modules: ["Authentication", "File Manager", "Folder Tree", "Link Sharing", "Analytics"],
        status: "Production Ready"
      }, null, 2);
      fs.writeFileSync(path.join(uploadsDir, specFilename), specContent);
      const specSize = Buffer.byteLength(specContent);

      const f2 = await File.create({
        name: 'API_Specifications.json',
        originalName: 'API_Specifications.json',
        filename: specFilename,
        user: demoUser._id,
        folder: specsFolder._id,
        size: specSize,
        mimeType: 'application/json',
        category: 'code'
      });

      // Sample file 3: SVG Vector graphic
      const svgFilename = `CloudNest_Brand_Logo-${Date.now()}.svg`;
      const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%">
  <defs>
    <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#38bdf8;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#0284c7;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="400" height="400" rx="40" fill="url(#grad1)" />
  <circle cx="200" cy="200" r="120" fill="white" opacity="0.15" />
  <path d="M260 250 H150 a50 50 0 0 1 -10 -99 a70 70 0 0 1 135 -20 a50 50 0 0 1 35 49 a40 40 0 0 1 -50 70 Z" fill="#ffffff" />
</svg>`;
      fs.writeFileSync(path.join(uploadsDir, svgFilename), svgContent);
      const svgSize = Buffer.byteLength(svgContent);

      const f3 = await File.create({
        name: 'CloudNest_Brand_Logo.svg',
        originalName: 'CloudNest_Brand_Logo.svg',
        filename: svgFilename,
        user: demoUser._id,
        folder: designFolder._id,
        size: svgSize,
        mimeType: 'image/svg+xml',
        category: 'image',
        isStarred: true
      });

      // Update demo user storageUsed
      demoUser.storageUsed = guideSize + specSize + svgSize;
      await demoUser.save();

      // Log initial activities
      await logActivity({
        userId: demoUser._id,
        action: 'create_folder',
        targetType: 'folder',
        targetName: 'Work Documents'
      });
      await logActivity({
        userId: demoUser._id,
        action: 'upload',
        targetType: 'file',
        targetName: 'CloudNest_Architecture_Guide.md'
      });
    }

    const token = generateToken(demoUser._id);

    res.json({
      success: true,
      token,
      user: {
        id: demoUser._id,
        name: demoUser.name,
        email: demoUser.email,
        storageUsed: demoUser.storageUsed,
        storageLimit: demoUser.storageLimit,
        role: demoUser.role,
        createdAt: demoUser.createdAt
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerUser,
  loginUser,
  getMe,
  updateProfile,
  demoLogin
};

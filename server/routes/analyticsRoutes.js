const express = require('express');
const router = express.Router();
const {
  getStorageOverview,
  getRecentActivities
} = require('../controllers/analyticsController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/storage', getStorageOverview);
router.get('/activity', getRecentActivities);

module.exports = router;

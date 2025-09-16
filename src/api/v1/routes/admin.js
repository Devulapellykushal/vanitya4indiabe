const express = require('express');
const router = express.Router();
const { authenticate, adminOnly } = require('../middleware/auth');
const {
  updateConfig,
  getConfig,
  getStats,
  getAPIAnalytics,
  getUserAnalytics,
  manageUsers
} = require('../controllers/adminController');

// All admin routes require authentication and admin privileges
router.use(authenticate);
router.use(adminOnly);

// Configuration routes
router.get('/config', getConfig);
router.post('/config/update', updateConfig);

// Statistics and analytics routes
router.get('/stats', getStats);
router.get('/analytics/api-usage', getAPIAnalytics);
router.get('/analytics/users', getUserAnalytics);

// User management routes
router.get('/users', manageUsers);
router.put('/users', manageUsers);

module.exports = router;
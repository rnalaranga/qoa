const express = require('express');
const router = express.Router();
const { getErrorAnalytics } = require('../controllers/analyticsController');

// GET /api/analytics/errors
router.get('/errors', getErrorAnalytics);

module.exports = router;

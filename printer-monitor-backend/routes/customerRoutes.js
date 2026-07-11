const express = require('express');
const router = express.Router();
const { getCustomers, getPublicCustomers, createCustomer, updateCustomer } = require('../controllers/customerController');

const { protect, adminOnly } = require('../middleware/authMiddleware');

// GET /api/customers
router.get('/', protect, getCustomers);

// GET /api/customers/public
router.get('/public', getPublicCustomers);

// POST /api/customers
router.post('/', protect, adminOnly, createCustomer);

// PUT /api/customers/:id
router.put('/:id', protect, adminOnly, updateCustomer);

module.exports = router;

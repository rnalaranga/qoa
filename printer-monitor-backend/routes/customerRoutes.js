const express = require('express');
const router = express.Router();
const { getCustomers, createCustomer, updateCustomer } = require('../controllers/customerController');

const { protect, adminOnly } = require('../middleware/authMiddleware');

// GET /api/customers
router.get('/', protect, getCustomers);

// POST /api/customers
router.post('/', protect, adminOnly, createCustomer);

// PUT /api/customers/:id
router.put('/:id', protect, adminOnly, updateCustomer);

module.exports = router;

const express = require('express');
const router = express.Router();
const { updatePrinterStatus, getPrinters, getPrinterHistory, assignPrinterToCustomer } = require('../controllers/printerController');

// POST /api/printers/status
router.post('/status', updatePrinterStatus);

// GET /api/printers
router.get('/', getPrinters);

// GET /api/printers/:ip/history
router.get('/:ip/history', getPrinterHistory);

// PUT /api/printers/:ip/assign
router.put('/:ip/assign', assignPrinterToCustomer);

module.exports = router;

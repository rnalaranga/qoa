const express = require('express');
const router = express.Router();
const { updatePrinterStatus, getPrinters, getPrinterHistory, getPrinterReport, assignPrinterToCustomer, removePrinterStatus, registerPrinter, deletePrinter, clearPrinterLogs } = require('../controllers/printerController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// POST /api/printers/status
router.post('/status', updatePrinterStatus);

// POST /api/printers/register  (re-activates deleted printers)
router.post('/register', registerPrinter);

// POST /api/printers/remove
router.post('/remove', removePrinterStatus);

// GET /api/printers
router.get('/', protect, getPrinters);

// GET /api/printers/:ip/history
router.get('/:ip/history', protect, getPrinterHistory);

// GET /api/printers/:ip/report
router.get('/:ip/report', protect, getPrinterReport);

// PUT /api/printers/:ip/assign
router.put('/:ip/assign', protect, adminOnly, assignPrinterToCustomer);

// DELETE /api/printers/:ip
router.delete('/:ip', protect, adminOnly, deletePrinter);

// DELETE /api/printers/:ip/logs
router.delete('/:ip/logs', protect, adminOnly, clearPrinterLogs);

module.exports = router;

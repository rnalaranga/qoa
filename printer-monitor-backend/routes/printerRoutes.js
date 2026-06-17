const express = require('express');
const router = express.Router();
const { updatePrinterStatus, getPrinters, getPrinterHistory, getPrinterReport, assignPrinterToCustomer, removePrinterStatus, deletePrinter, clearPrinterLogs } = require('../controllers/printerController');

// POST /api/printers/status
router.post('/status', updatePrinterStatus);

// POST /api/printers/remove
router.post('/remove', removePrinterStatus);

// GET /api/printers
router.get('/', getPrinters);

// GET /api/printers/:ip/history
router.get('/:ip/history', getPrinterHistory);

// GET /api/printers/:ip/report
router.get('/:ip/report', getPrinterReport);

// PUT /api/printers/:ip/assign
router.put('/:ip/assign', assignPrinterToCustomer);

// DELETE /api/printers/:ip
router.delete('/:ip', deletePrinter);

// DELETE /api/printers/:ip/logs
router.delete('/:ip/logs', clearPrinterLogs);

module.exports = router;

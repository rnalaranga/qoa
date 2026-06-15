const db = require('../config/db');

// @desc    Save or update printer status
// @route   POST /api/printers/status
// @access  Public
const updatePrinterStatus = async (req, res) => {
    try {
        let {
            qoa_num,
            ip_address,
            model,
            toner_level,
            pages_printed,
            printer_status,
            error_status,
            online_status
        } = req.body;

        if (!ip_address) {
            return res.status(400).json({ message: 'IP address is required' });
        }

        // Check if printer exists in printer_status table
        const [existing] = await db.query('SELECT * FROM printer_status WHERE ip_address = ?', [ip_address]);
        let shouldLogHistory = true;

        if (existing.length > 0) {
            const old = existing[0];
            
            // Preserve last known valid values if incoming data is 0 or NaN
            let finalPages = pages_printed;
            if (!finalPages || String(finalPages) === 'NaN' || parseInt(finalPages) === 0) {
                finalPages = old.pages_printed;
            }

            let finalToner = toner_level;
            if (!finalToner || String(finalToner) === 'NaN' || parseInt(finalToner) === 0) {
                finalToner = old.toner_level;
            }

            // Only log history if critical metrics changed
            if (old.toner_level === finalToner && old.pages_printed === finalPages && old.printer_status === printer_status) {
                shouldLogHistory = false;
            }

            // Update existing printer status
            await db.query(
                `UPDATE printer_status SET 
                    qoa_num = ?, model = ?, toner_level = ?, pages_printed = ?, 
                    printer_status = ?, error_status = ?, online_status = ? 
                 WHERE ip_address = ?`,
                [qoa_num, model, finalToner, finalPages, printer_status, error_status, online_status, ip_address]
            );
            
            // Update the variables so the history log uses the correct values
            pages_printed = finalPages;
            toner_level = finalToner;
        } else {
            // Insert new printer status
            await db.query(
                `INSERT INTO printer_status 
                    (qoa_num, ip_address, model, toner_level, pages_printed, printer_status, error_status, online_status) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [qoa_num, ip_address, model, toner_level, pages_printed, printer_status, error_status, online_status]
            );
        }

        if (shouldLogHistory) {
            // Insert into history logs
            await db.query(
                `INSERT INTO printer_logs 
                    (ip_address, toner_level, pages_printed, printer_status, error_status, online_status) 
                 VALUES (?, ?, ?, ?, ?, ?)`,
                [ip_address, toner_level, pages_printed, printer_status, error_status, online_status]
            );
        }

        res.status(200).json({ message: 'Printer status updated successfully' });
    } catch (error) {
        console.error('Error updating printer status:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get all current printer statuses
// @route   GET /api/printers
// @access  Public
const getPrinters = async (req, res) => {
    try {
        const query = `
            SELECT p.*, c.name as customer_name 
            FROM printer_status p 
            LEFT JOIN customers c ON p.customer_id = c.id
        `;
        const [rows] = await db.query(query);

        // Self-heal: If the current data is NaN or 0, find the last valid reading from logs
        for (let row of rows) {
            let pStr = String(row.pages_printed);
            let tStr = String(row.toner_level);
            let pValid = pStr !== 'null' && pStr !== 'undefined' && pStr !== 'NaN' && parseInt(pStr) > 0;
            let tValid = tStr !== 'null' && tStr !== 'undefined' && tStr !== 'NaN' && (parseInt(tStr) > 0 || tStr === 'Replace Toner' || tStr === 'Insert Toner');

            if (!pValid || !tValid) {
                const [logs] = await db.query(
                    'SELECT pages_printed, toner_level FROM printer_logs WHERE ip_address = ? ORDER BY created_at DESC', 
                    [row.ip_address]
                );
                for (let log of logs) {
                    let lp = String(log.pages_printed);
                    let lt = String(log.toner_level);
                    
                    if (!pValid && lp && lp !== 'NaN' && parseInt(lp) > 0) {
                        row.pages_printed = log.pages_printed;
                        pValid = true;
                    }
                    if (!tValid && lt && lt !== 'NaN' && parseInt(lt) > 0) {
                        row.toner_level = log.toner_level;
                        tValid = true;
                    }
                    if (pValid && tValid) break;
                }
            }
        }

        res.status(200).json(rows);
    } catch (error) {
        console.error('Error fetching printers:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get history for a specific printer
// @route   GET /api/printers/:ip/history
// @access  Public
const getPrinterHistory = async (req, res) => {
    try {
        const { ip } = req.params;
        const [rows] = await db.query('SELECT * FROM printer_logs WHERE ip_address = ? ORDER BY created_at DESC LIMIT 100', [ip]);
        res.status(200).json(rows);
    } catch (error) {
        console.error('Error fetching printer history:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get daily usage report for a specific printer
// @route   GET /api/printers/:ip/report
// @access  Public
const getPrinterReport = async (req, res) => {
    try {
        const { ip } = req.params;
        const { startDate, endDate } = req.query;

        let query = `
            SELECT 
                DATE(created_at) as date,
                MIN(CAST(pages_printed AS UNSIGNED)) as start_count,
                MAX(CAST(pages_printed AS UNSIGNED)) as end_count,
                MAX(CAST(pages_printed AS UNSIGNED)) - MIN(CAST(pages_printed AS UNSIGNED)) as prints_taken,
                ROUND(AVG(CAST(REPLACE(toner_level, '%', '') AS UNSIGNED))) as avg_toner
            FROM printer_logs
            WHERE ip_address = ? 
            AND pages_printed NOT IN ('-', 'NaN') 
            AND pages_printed IS NOT NULL 
            AND toner_level NOT IN ('-', 'NaN', 'Replace Toner', 'Insert Toner')
        `;
        const params = [ip];

        if (startDate && endDate) {
            query += ' AND DATE(created_at) BETWEEN ? AND ?';
            params.push(startDate, endDate);
        }

        query += ' GROUP BY DATE(created_at) ORDER BY date ASC';

        const [rows] = await db.query(query, params);
        res.status(200).json(rows);
    } catch (error) {
        console.error('Error fetching printer report:', error);
        res.status(500).json({ message: 'Server error' });
    }
};


// @desc    Assign printer to customer
// @route   PUT /api/printers/:ip/assign
// @access  Public
const assignPrinterToCustomer = async (req, res) => {
    try {
        const { ip } = req.params;
        const { customer_id } = req.body;
        
        await db.query(
            'UPDATE printer_status SET customer_id = ? WHERE ip_address = ?',
            [customer_id || null, ip]
        );
        res.status(200).json({ message: 'Printer assigned successfully' });
    } catch (error) {
        console.error('Error assigning printer:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    updatePrinterStatus,
    getPrinters,
    getPrinterHistory,
    getPrinterReport,
    assignPrinterToCustomer
};

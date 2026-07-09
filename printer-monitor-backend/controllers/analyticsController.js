const db = require('../config/db');

// @desc    Get error analytics
// @route   GET /api/analytics/errors
// @access  Public
const getErrorAnalytics = async (req, res) => {
    try {
        const { startDate, endDate, ip } = req.query;
        
        let dateFilter = '';
        let ipFilter = '';
        const queryParams = [];

        if (startDate && endDate) {
            dateFilter = 'AND created_at BETWEEN ? AND ?';
            queryParams.push(`${startDate} 00:00:00`, `${endDate} 23:59:59`);
        }
        
        if (ip) {
            ipFilter = 'AND ip_address = ?';
            queryParams.push(ip);
        }

        const getParams = () => {
            const p = [];
            if (startDate && endDate) p.push(`${startDate} 00:00:00`, `${endDate} 23:59:59`);
            if (ip) p.push(ip);
            return p;
        };

        // 1. Error count by Type
        const typeQuery = `
            SELECT error_status as name, COUNT(*) as value 
            FROM printer_logs 
            WHERE error_status != 'OK' 
            AND error_status IS NOT NULL 
            AND error_status != ''
            ${dateFilter}
            ${ipFilter}
            GROUP BY error_status 
            ORDER BY value DESC
        `;
        const [errorTypesData] = await db.query(typeQuery, getParams());

        // 2. Error count by Printer
        const printerQuery = `
            SELECT ip_address as name, COUNT(*) as errorCount 
            FROM printer_logs 
            WHERE error_status != 'OK' 
            AND error_status IS NOT NULL 
            AND error_status != ''
            ${dateFilter}
            ${ipFilter}
            GROUP BY ip_address 
            ORDER BY errorCount DESC
            LIMIT 10
        `;
        const [printerErrorsData] = await db.query(printerQuery, getParams());
        
        // 3. Time Series Data (Errors Over Time)
        const timeSeriesQuery = `
            SELECT DATE(created_at) as date, COUNT(*) as errors 
            FROM printer_logs 
            WHERE error_status != 'OK' 
            AND error_status IS NOT NULL 
            AND error_status != ''
            ${dateFilter}
            ${ipFilter}
            GROUP BY DATE(created_at)
            ORDER BY DATE(created_at) ASC
        `;
        const [timeSeriesData] = await db.query(timeSeriesQuery, getParams());

        // 4. Recent Error List
        const listQuery = `
            SELECT id, ip_address, error_status, toner_level, created_at
            FROM printer_logs 
            WHERE error_status != 'OK' 
            AND error_status IS NOT NULL 
            AND error_status != ''
            ${dateFilter}
            ${ipFilter}
            ORDER BY created_at DESC
            LIMIT 50
        `;
        const [recentErrors] = await db.query(listQuery, getParams());

        // 5. Total Pages Printed within date range
        const pagesQuery = `
            SELECT ip_address as name, (MAX(CAST(pages_printed AS UNSIGNED)) - MIN(CAST(pages_printed AS UNSIGNED))) as volume
            FROM printer_logs
            WHERE pages_printed IS NOT NULL AND pages_printed != ''
            ${dateFilter}
            ${ipFilter}
            GROUP BY ip_address
            HAVING volume > 0
            ORDER BY volume DESC
        `;
        const [pagesData] = await db.query(pagesQuery, getParams());
        const totalPrints = pagesData.reduce((acc, curr) => acc + curr.volume, 0);
        const topPrintersByVolume = pagesData.slice(0, 10);

        // 6. Total Toners Replaced calculation
        // Fetch chronological toner history
        const tonerHistoryQuery = `
            SELECT ip_address, toner_level, created_at 
            FROM printer_logs 
            WHERE 1=1
            ${dateFilter}
            ${ipFilter}
            ORDER BY ip_address, created_at ASC
        `;
        const [tonerLogs] = await db.query(tonerHistoryQuery, getParams());
        
        let tonersReplaced = 0;
        let lastToner = {}; // tracks last valid toner % per IP

        tonerLogs.forEach(log => {
            let currentNum = parseInt(log.toner_level?.replace('%', ''));
            if (isNaN(currentNum)) currentNum = null; // e.g. "Insert Toner"

            if (lastToner[log.ip_address] !== undefined) {
                const prev = lastToner[log.ip_address];
                
                if (prev !== null && currentNum !== null) {
                    if (currentNum > prev + 50) { // Jump of > 50% indicates replacement
                        tonersReplaced++;
                    }
                } else if (prev === null && currentNum !== null && currentNum > 80) {
                    // Recovered from "Insert Toner" to a high percentage
                    tonersReplaced++;
                }
            }
            
            // Store previous state. If "Insert Toner", store null so we know it was empty
            lastToner[log.ip_address] = currentNum;
        });

        // Compute total errors
        const totalErrors = errorTypesData.reduce((acc, curr) => acc + curr.value, 0);

        const [allPrinters] = await db.query('SELECT ip_address, model, qoa_num FROM printer_status');

        res.status(200).json({
            summary: {
                totalErrors,
                totalPrints: parseInt(totalPrints),
                tonersReplaced
            },
            errorTypes: errorTypesData,
            printerErrors: printerErrorsData,
            timeSeries: timeSeriesData,
            recentErrors: recentErrors,
            topPrintersByVolume: topPrintersByVolume,
            allPrinters: allPrinters
        });

    } catch (error) {
        console.error('Error fetching analytics:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    getErrorAnalytics
};

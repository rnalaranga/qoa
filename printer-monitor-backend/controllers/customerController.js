const db = require('../config/db');

// @desc    Get all customers with assigned printers
// @route   GET /api/customers
// @access  Public
const getCustomers = async (req, res) => {
    try {
        const [customers] = await db.query('SELECT * FROM customers ORDER BY name ASC');
        const [printers] = await db.query('SELECT * FROM printer_status WHERE customer_id IS NOT NULL');
        
        // Self-heal printers
        for (let row of printers) {
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
                    if (!tValid && lt && lt !== 'NaN' && (parseInt(lt) > 0 || lt === 'Replace Toner' || lt === 'Insert Toner')) {
                        row.toner_level = log.toner_level;
                        tValid = true;
                    }
                    if (pValid && tValid) break;
                }
            }
        }

        // Format the output
        const formattedRows = customers.map(customer => {
            const assigned_printers = printers.filter(p => p.customer_id === customer.id);

            return {
                ...customer,
                assigned_printers
            };
        });

        res.status(200).json(formattedRows);
    } catch (error) {
        console.error('Error fetching customers:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Create a new customer
// @route   POST /api/customers
// @access  Public
const createCustomer = async (req, res) => {
    try {
        const { name, contact_info } = req.body;

        if (!name) {
            return res.status(400).json({ message: 'Customer name is required' });
        }

        const [existing] = await db.query('SELECT * FROM customers WHERE name = ?', [name]);
        if (existing.length > 0) {
            return res.status(400).json({ message: 'Customer already exists' });
        }

        const [result] = await db.query(
            'INSERT INTO customers (name, contact_info) VALUES (?, ?)',
            [name, contact_info || null]
        );

        res.status(201).json({ 
            id: result.insertId, 
            name, 
            contact_info,
            message: 'Customer created successfully' 
        });
    } catch (error) {
        console.error('Error creating customer:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Update a customer
// @route   PUT /api/customers/:id
// @access  Public
const updateCustomer = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, contact_info } = req.body;

        if (!name) {
            return res.status(400).json({ message: 'Customer name is required' });
        }

        const [result] = await db.query(
            'UPDATE customers SET name = ?, contact_info = ? WHERE id = ?',
            [name, contact_info || null, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Customer not found' });
        }

        res.status(200).json({ message: 'Customer updated successfully' });
    } catch (error) {
        console.error('Error updating customer:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    getCustomers,
    createCustomer,
    updateCustomer
};

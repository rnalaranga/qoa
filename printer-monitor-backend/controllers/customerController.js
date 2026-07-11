const db = require('../config/db');
const bcrypt = require('bcryptjs');

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

// @desc    Get customers list only (public)
// @route   GET /api/customers/public
// @access  Public
const getPublicCustomers = async (req, res) => {
    try {
        const [customers] = await db.query('SELECT id, name FROM customers ORDER BY name ASC');
        res.status(200).json(customers);
    } catch (error) {
        console.error('Error fetching public customers:', error);
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

        const customerId = result.insertId;

        // If username and password are provided, create the user account
        if (req.body.username && req.body.password) {
            const { username, password } = req.body;
            
            // Check if username already exists
            const [userExists] = await db.query('SELECT * FROM users WHERE username = ?', [username]);
            if (userExists.length > 0) {
                // We created the customer but user creation failed. 
                // Return success for customer but warn about user.
                return res.status(201).json({
                    id: customerId,
                    name,
                    contact_info,
                    message: 'Customer created, but user account failed (Username already exists)'
                });
            }

            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            await db.query(
                'INSERT INTO users (username, password_hash, role, customer_id) VALUES (?, ?, ?, ?)',
                [username, hashedPassword, 'customer', customerId]
            );
        }

        res.status(201).json({ 
            id: customerId, 
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

        if (req.body.username && req.body.password) {
            const { username, password } = req.body;
            
            // Check if username already exists
            const [userExists] = await db.query('SELECT * FROM users WHERE username = ?', [username]);
            
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            if (userExists.length > 0) {
                if (String(userExists[0].customer_id) === String(id)) {
                    // Update password
                    await db.query('UPDATE users SET password_hash = ? WHERE id = ?', [hashedPassword, userExists[0].id]);
                } else {
                    return res.status(200).json({ message: 'Customer updated, but Username belongs to someone else' });
                }
            } else {
                // Check if customer already has a user account with a different username
                const [customerUsers] = await db.query('SELECT * FROM users WHERE customer_id = ?', [id]);
                if (customerUsers.length > 0) {
                    // Update username and password
                    await db.query('UPDATE users SET username = ?, password_hash = ? WHERE id = ?', [username, hashedPassword, customerUsers[0].id]);
                } else {
                    // Insert new user
                    await db.query(
                        'INSERT INTO users (username, password_hash, role, customer_id) VALUES (?, ?, ?, ?)',
                        [username, hashedPassword, 'customer', id]
                    );
                }
            }
        }

        res.status(200).json({ message: 'Customer updated successfully' });
    } catch (error) {
        console.error('Error updating customer:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    getCustomers,
    getPublicCustomers,
    createCustomer,
    updateCustomer
};

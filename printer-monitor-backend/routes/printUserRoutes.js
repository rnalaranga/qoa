const express = require('express');
const router = express.Router();
const db = require('../config/db');

// GET all print users
router.get('/', async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT pu.*, c.name as customer_name 
            FROM print_users pu 
            LEFT JOIN customers c ON pu.customer_id = c.id
        `);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST new print user
router.post('/', async (req, res) => {
    const { name, pin_code, monthly_quota, color_quota, customer_id } = req.body;
    try {
        const [result] = await db.query(
            'INSERT INTO print_users (name, pin_code, monthly_quota, color_quota, customer_id) VALUES (?, ?, ?, ?, ?)',
            [name, pin_code, monthly_quota, color_quota, customer_id || null]
        );
        res.status(201).json({ id: result.insertId, name, pin_code, monthly_quota, color_quota, customer_id, is_active: true });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// PUT update print user
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { name, pin_code, monthly_quota, color_quota, is_active, customer_id } = req.body;
    try {
        await db.query(
            'UPDATE print_users SET name = ?, pin_code = ?, monthly_quota = ?, color_quota = ?, is_active = ?, customer_id = ? WHERE id = ?',
            [name, pin_code, monthly_quota, color_quota, is_active, customer_id || null, id]
        );
        res.json({ id, name, pin_code, monthly_quota, color_quota, is_active, customer_id });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// DELETE print user
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await db.query('DELETE FROM print_users WHERE id = ?', [id]);
        res.json({ message: 'User deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET logs for a specific user
router.get('/:id/logs', async (req, res) => {
    const { id } = req.params;
    try {
        const [rows] = await db.query('SELECT * FROM user_print_logs WHERE user_id = ? ORDER BY recorded_at DESC', [id]);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;

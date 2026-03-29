const express = require('express');
const router = express.Router();
const db = require('../config/db');

router.get('/test-db', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT NOW() as now');
        res.json({
            ok: true,
            db_time: rows[0].now
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            ok: false,
            error: 'Error conectando a la BD'
        });
    }
});

module.exports = router;
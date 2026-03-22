const express = require('express');
const router = express.Router();
const controller = require('../controller/dashboard.controller');

router.get('/', controller.getDashboard);

module.exports = router;
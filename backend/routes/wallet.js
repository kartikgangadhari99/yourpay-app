const express = require('express');
const router = express.Router();
const { addMoney, getBalance } = require('../controllers/walletController');
const { protect } = require('../middleware/auth');
router.post('/add-money', protect, addMoney);
router.get('/balance', protect, getBalance);
module.exports = router;

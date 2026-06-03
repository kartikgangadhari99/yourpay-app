const express = require('express');
const router = express.Router();
const { sendMoney, getHistory, getReceipt } = require('../controllers/paymentController');
const { protect } = require('../middleware/auth');
router.post('/send', protect, sendMoney);
router.get('/history', protect, getHistory);
router.get('/receipt/:id', protect, getReceipt);
module.exports = router;

const express = require('express');
const router = express.Router();
const { generateQR, payViaQR } = require('../controllers/qrController');
const { protect } = require('../middleware/auth');
router.get('/generate', protect, generateQR);
router.post('/pay', protect, payViaQR);
module.exports = router;

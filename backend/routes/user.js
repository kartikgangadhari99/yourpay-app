const express = require('express');
const router = express.Router();
const { getProfile, setPin, changePin, searchUser } = require('../controllers/userController');
const { protect } = require('../middleware/auth');
router.get('/profile', protect, getProfile);
router.post('/set-pin', protect, setPin);
router.post('/change-pin', protect, changePin);
router.get('/search', protect, searchUser);
module.exports = router;

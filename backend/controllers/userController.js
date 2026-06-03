const User = require('../models/User');
const bcrypt = require('bcryptjs');

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password -upiPin');
    res.json({ success: true, user: { ...user.toObject(), hasPinSet: true } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.setPin = async (req, res) => {
  try {
    const { pin } = req.body;
    if (!pin || pin.length !== 4 || !/^\d{4}$/.test(pin))
      return res.status(400).json({ success: false, message: 'PIN must be exactly 4 digits' });

    const user = await User.findById(req.user._id);
    user.upiPin = pin;
    await user.save();
    res.json({ success: true, message: 'UPI PIN set successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.changePin = async (req, res) => {
  try {
    const { oldPin, newPin } = req.body;
    if (!oldPin || !newPin)
      return res.status(400).json({ success: false, message: 'Old PIN and new PIN required' });
    if (!/^\d{4}$/.test(newPin))
      return res.status(400).json({ success: false, message: 'New PIN must be exactly 4 digits' });

    const user = await User.findById(req.user._id);
    const isMatch = await user.comparePin(oldPin);
    if (!isMatch) return res.status(400).json({ success: false, message: 'Old PIN is incorrect' });

    user.upiPin = newPin;
    await user.save();
    res.json({ success: true, message: 'UPI PIN changed successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.searchUser = async (req, res) => {
  try {
    const { upiId } = req.query;
    if (!upiId) return res.status(400).json({ success: false, message: 'UPI ID required' });

    const user = await User.findOne({ upiId }).select('name upiId');
    if (!user) return res.status(404).json({ success: false, message: 'UPI ID not found' });

    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

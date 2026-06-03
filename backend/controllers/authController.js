const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET || 'yourpay_secret', {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });

exports.register = async (req, res) => {
  try {
    const { name, mobile, email, password } = req.body;
    if (!name || !mobile || !email || !password)
      return res.status(400).json({ success: false, message: 'All fields are required' });

    const existing = await User.findOne({ $or: [{ email }, { mobile }] });
    if (existing)
      return res.status(400).json({ success: false, message: 'Email or mobile already registered' });

    const user = await User.create({ name, mobile, email, password });
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      token,
      user: { id: user._id, name: user.name, email: user.email, mobile: user.mobile, upiId: user.upiId, walletBalance: user.walletBalance, role: user.role },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ success: false, message: 'Email and password required' });

    const user = await User.findOne({ $or: [{ email }, { mobile: email }] });
    if (!user || !(await user.comparePassword(password)))
      return res.status(401).json({ success: false, message: 'Invalid credentials' });

    if (!user.isActive)
      return res.status(403).json({ success: false, message: 'Account is deactivated' });

    const token = generateToken(user._id);
    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: { id: user._id, name: user.name, email: user.email, mobile: user.mobile, upiId: user.upiId, walletBalance: user.walletBalance, role: user.role, hasPinSet: !!user.upiPin },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password -upiPin');
    res.json({ success: true, user: { ...user.toObject(), hasPinSet: !!user.upiPin } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

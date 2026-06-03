const User = require('../models/User');

exports.addMoney = async (req, res) => {
  try {
    const { amount } = req.body;
    const amt = parseFloat(amount);
    if (!amt || amt <= 0 || amt > 100000)
      return res.status(400).json({ success: false, message: 'Amount must be between 1 and 100,000' });

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $inc: { walletBalance: amt } },
      { new: true }
    ).select('-password -upiPin');

    res.json({ success: true, message: `₹${amt} added to wallet`, walletBalance: user.walletBalance });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getBalance = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('walletBalance');
    res.json({ success: true, walletBalance: user.walletBalance });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

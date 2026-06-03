const User = require('../models/User');
const Transaction = require('../models/Transaction');

exports.getDashboard = async (req, res) => {
  try {
    const [totalUsers, totalTransactions, successTxns, failedTxns] = await Promise.all([
      User.countDocuments({ role: 'user' }),
      Transaction.countDocuments(),
      Transaction.countDocuments({ status: 'success' }),
      Transaction.countDocuments({ status: 'failed' }),
    ]);

    const amountResult = await Transaction.aggregate([
      { $match: { status: 'success' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalTransactions,
        successfulPayments: successTxns,
        failedPayments: failedTxns,
        totalAmountTransferred: amountResult[0]?.total || 0,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const users = await User.find({ role: 'user' }).select('-password -upiPin').sort({ createdAt: -1 }).skip(skip).limit(limit);
    const total = await User.countDocuments({ role: 'user' });
    res.json({ success: true, users, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getAllTransactions = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const transactions = await Transaction.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('senderId', 'name upiId')
      .populate('receiverId', 'name upiId');
    const total = await Transaction.countDocuments();
    res.json({ success: true, transactions, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getMonthlyReport = async (req, res) => {
  try {
    const report = await Transaction.aggregate([
      { $match: { status: 'success' } },
      {
        $group: {
          _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const formatted = report.map((r) => ({
      label: `${months[r._id.month - 1]} ${r._id.year}`,
      count: r.count,
      amount: r.totalAmount,
    }));

    res.json({ success: true, report: formatted });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.toggleUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    user.isActive = !user.isActive;
    await user.save();
    res.json({ success: true, message: `User ${user.isActive ? 'activated' : 'deactivated'}`, isActive: user.isActive });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

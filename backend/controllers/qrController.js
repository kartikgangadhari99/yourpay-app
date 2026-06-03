const QRCode = require('qrcode');
const User = require('../models/User');

exports.generateQR = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('upiId name');
    const qrData = JSON.stringify({ upiId: user.upiId, name: user.name, app: 'yourpay' });
    const qrImage = await QRCode.toDataURL(qrData, { width: 300, margin: 2, color: { dark: '#1a1a2e', light: '#ffffff' } });
    res.json({ success: true, qrCode: qrImage, upiId: user.upiId, name: user.name });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.payViaQR = async (req, res) => {
  const paymentController = require('./paymentController');
  return paymentController.sendMoney(req, res);
};

const User = require('../models/User');
const Transaction = require('../models/Transaction');
const PDFDocument = require('pdfkit');

exports.sendMoney = async (req, res) => {
  try {
    const { receiverUpi, amount, pin, note } = req.body;
    const amt = parseFloat(amount);

    if (!receiverUpi || !amt || !pin)
      return res.status(400).json({ success: false, message: 'Receiver UPI, amount and PIN are required' });
    if (amt <= 0)
      return res.status(400).json({ success: false, message: 'Amount must be greater than 0' });
    if (!/^\d{4}$/.test(pin))
      return res.status(400).json({ success: false, message: 'Invalid PIN format' });

    const sender = await User.findById(req.user._id);
    if (sender.upiId === receiverUpi)
      return res.status(400).json({ success: false, message: 'Cannot send money to yourself' });

    const receiver = await User.findOne({ upiId: receiverUpi });
    if (!receiver)
      return res.status(404).json({ success: false, message: 'Receiver UPI ID not found' });

    const pinMatch = await sender.comparePin(pin);
    if (!pinMatch)
      return res.status(401).json({ success: false, message: 'Incorrect UPI PIN' });

    if (sender.walletBalance < amt)
      return res.status(400).json({ success: false, message: 'Insufficient wallet balance' });

    // Atomic balance update
    await User.findByIdAndUpdate(sender._id, { $inc: { walletBalance: -amt } });
    await User.findByIdAndUpdate(receiver._id, { $inc: { walletBalance: amt } });

    const txn = await Transaction.create({
      senderId: sender._id,
      receiverId: receiver._id,
      senderUpi: sender.upiId,
      receiverUpi: receiver.upiId,
      amount: amt,
      status: 'success',
      transactionType: 'debit',
      note: note || '',
    });

    const updatedSender = await User.findById(sender._id).select('walletBalance');

    res.json({
      success: true,
      message: `₹${amt} sent to ${receiver.name} successfully`,
      transaction: txn,
      newBalance: updatedSender.walletBalance,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getHistory = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const userId = req.user._id;
    const query = { $or: [{ senderId: userId }, { receiverId: userId }] };

    const [transactions, total] = await Promise.all([
      Transaction.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('senderId', 'name upiId')
        .populate('receiverId', 'name upiId'),
      Transaction.countDocuments(query),
    ]);

    const enriched = transactions.map((t) => ({
      ...t.toObject(),
      type: t.senderId._id.toString() === userId.toString() ? 'debit' : 'credit',
    }));

    res.json({ success: true, transactions: enriched, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getReceipt = async (req, res) => {
  try {
    const txn = await Transaction.findOne({ transactionId: req.params.id })
      .populate('senderId', 'name email upiId')
      .populate('receiverId', 'name email upiId');

    if (!txn) return res.status(404).json({ success: false, message: 'Transaction not found' });

    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=receipt-${txn.transactionId}.pdf`);
    doc.pipe(res);

    // Header
    doc.rect(0, 0, 612, 120).fill('#1a1a2e');
    doc.fillColor('#ffffff').fontSize(28).font('Helvetica-Bold').text('YourPay', 50, 35);
    doc.fontSize(11).font('Helvetica').text('Digital Payment Receipt', 50, 70);
    doc.fontSize(10).text('Educational Simulation Platform', 50, 88);

    // Status badge
    const statusColor = txn.status === 'success' ? '#22c55e' : '#ef4444';
    doc.roundedRect(430, 40, 120, 36, 8).fill(statusColor);
    doc.fillColor('#ffffff').fontSize(14).font('Helvetica-Bold')
      .text(txn.status.toUpperCase(), 430, 52, { width: 120, align: 'center' });

    // Transaction ID
    doc.fillColor('#1a1a2e').fontSize(11).font('Helvetica')
      .text('Transaction ID', 50, 140)
      .font('Helvetica-Bold').fontSize(13).text(txn.transactionId, 50, 157);

    // Amount
    doc.rect(50, 190, 512, 70).fillAndStroke('#f0fdf4', '#22c55e');
    doc.fillColor('#166534').fontSize(13).font('Helvetica').text('Amount Transferred', 70, 205);
    doc.fillColor('#15803d').fontSize(30).font('Helvetica-Bold').text(`₹ ${txn.amount.toFixed(2)}`, 70, 220);

    // Details grid
    const details = [
      ['Sender Name', txn.senderId.name],
      ['Sender UPI ID', txn.senderUpi],
      ['Receiver Name', txn.receiverId.name],
      ['Receiver UPI ID', txn.receiverUpi],
      ['Date', new Date(txn.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })],
      ['Time', new Date(txn.createdAt).toLocaleTimeString('en-IN')],
      ['Status', txn.status.charAt(0).toUpperCase() + txn.status.slice(1)],
      ['Note', txn.note || '—'],
    ];

    let y = 285;
    details.forEach(([label, value], i) => {
      if (i % 2 === 0) doc.rect(50, y, 250, 45).fillAndStroke('#f8fafc', '#e2e8f0');
      else doc.rect(312, y - 45, 250, 45).fillAndStroke('#f8fafc', '#e2e8f0');

      const x = i % 2 === 0 ? 60 : 322;
      const rowY = i % 2 === 0 ? y + 6 : y - 39;
      doc.fillColor('#64748b').fontSize(9).font('Helvetica').text(label.toUpperCase(), x, rowY);
      doc.fillColor('#1e293b').fontSize(11).font('Helvetica-Bold').text(value, x, rowY + 14);

      if (i % 2 === 1) y += 45;
    });

    // Footer
    doc.rect(0, 740, 612, 100).fill('#f1f5f9');
    doc.fillColor('#64748b').fontSize(9).font('Helvetica')
      .text('This is a simulated transaction receipt generated by YourPay.', 50, 755, { align: 'center', width: 512 })
      .text('YourPay does not process real money. For educational purposes only.', 50, 770, { align: 'center', width: 512 })
      .text(`Generated on ${new Date().toLocaleString('en-IN')}`, 50, 785, { align: 'center', width: 512 });

    doc.end();
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

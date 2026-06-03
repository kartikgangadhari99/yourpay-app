const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const transactionSchema = new mongoose.Schema(
  {
    transactionId: { type: String, unique: true, default: () => 'YP' + uuidv4().replace(/-/g, '').substring(0, 14).toUpperCase() },
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    receiverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    senderUpi: { type: String, required: true },
    receiverUpi: { type: String, required: true },
    amount: { type: Number, required: true, min: 1 },
    status: { type: String, enum: ['success', 'failed', 'pending'], default: 'pending' },
    transactionType: { type: String, enum: ['debit', 'credit'], default: 'debit' },
    note: { type: String, default: '' },
    failureReason: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Transaction', transactionSchema);

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    mobile: { type: String, required: true, unique: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6 },
    upiId: { type: String, unique: true },
    upiPin: { type: String, default: null },
    walletBalance: { type: Number, default: 0 },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Generate UPI ID before saving
userSchema.pre('save', async function (next) {
  if (this.isNew) {
    const base = this.name.toLowerCase().replace(/\s+/g, '').substring(0, 10);
    const rand = Math.floor(1000 + Math.random() * 9000);
    this.upiId = `${base}${rand}@yourpay`;
  }
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 12);
  }
  if (this.isModified('upiPin') && this.upiPin) {
    this.upiPin = await bcrypt.hash(this.upiPin, 12);
  }
  next();
});

userSchema.methods.comparePassword = async function (password) {
  return bcrypt.compare(password, this.password);
};

userSchema.methods.comparePin = async function (pin) {
  if (!this.upiPin) return false;
  return bcrypt.compare(pin, this.upiPin);
};

module.exports = mongoose.model('User', userSchema);

const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

const seed = async () => {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/yourpay');
  const exists = await User.findOne({ email: 'admin@yourpay.com' });
  if (exists) { console.log('Admin already exists:', exists.email); process.exit(0); }
  const admin = await User.create({
    name: 'Admin',
    mobile: '9999999999',
    email: 'admin@yourpay.com',
    password: 'admin123',
    role: 'admin',
    walletBalance: 0,
  });
  console.log('✅ Admin created:', admin.email, '| UPI:', admin.upiId);
  process.exit(0);
};

seed().catch(err => { console.error(err); process.exit(1); });

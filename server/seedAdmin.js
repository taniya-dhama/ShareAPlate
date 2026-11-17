// Run once: node seedAdmin.js
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  const exists = await User.findOne({ email: 'admin@foodshare.com' });
  if (!exists) {
    await User.create({
      name: 'Admin', email: 'admin@foodshare.com',
      password: await bcrypt.hash('admin123', 10), role: 'admin', verified: true,
    });
    console.log('Admin created: admin@foodshare.com / admin123 (change this)');
  } else {
    console.log('Admin already exists');
  }
  process.exit();
})();

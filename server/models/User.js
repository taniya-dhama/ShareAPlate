const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, minlength: 6 },
  role: { type: String, enum: ['donor', 'receiver', 'admin'], required: true },
  organization: { type: String, trim: true },   // restaurant / NGO / mess name
  phone: String,
  verified: { type: Boolean, default: false },  // admin verifies donors and NGOs
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);

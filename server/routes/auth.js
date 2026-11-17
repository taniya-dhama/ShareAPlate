const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

const sign = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, organization, phone } = req.body;
    if (!['donor', 'receiver'].includes(role)) {
      return res.status(400).json({ message: 'Role must be donor or receiver' });
    }
    if (await User.findOne({ email })) {
      return res.status(400).json({ message: 'Email already registered' });
    }
    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashed, role, organization, phone });
    res.status(201).json({
      token: sign(user._id),
      user: { id: user._id, name: user.name, role: user.role, verified: user.verified },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }
    res.json({
      token: sign(user._id),
      user: { id: user._id, name: user.name, role: user.role, verified: user.verified },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Current logged-in user (used by the front end to refresh verified status)
router.get('/me', protect, (req, res) => {
  const u = req.user;
  res.json({ id: u._id, name: u.name, role: u.role, verified: u.verified });
});

module.exports = router;
const router = require('express').Router();
const User = require('../models/User');
const Listing = require('../models/Listing');
const { protect, allow } = require('../middleware/auth');

router.use(protect, allow('admin'));

router.get('/pending', async (req, res) => {
  res.json(await User.find({ verified: false, role: { $ne: 'admin' } }).select('-password'));
});

router.patch('/verify/:id', async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, { verified: true }, { new: true }).select('-password');
  res.json(user);
});

// Impact numbers for the dashboard
router.get('/stats', async (req, res) => {
  const [completed, total, donors, receivers] = await Promise.all([
    Listing.find({ status: 'completed' }),
    Listing.countDocuments(),
    User.countDocuments({ role: 'donor' }),
    User.countDocuments({ role: 'receiver' }),
  ]);
  res.json({
    mealsSaved: completed.reduce((sum, l) => sum + l.quantity, 0),
    totalListings: total,
    donors,
    receivers,
  });
});

module.exports = router;

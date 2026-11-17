const router = require('express').Router();
const crypto = require('crypto');
const Listing = require('../models/Listing');
const { protect, allow } = require('../middleware/auth');

// Donor creates a listing
router.post('/', protect, allow('donor'), async (req, res) => {
  try {
    if (!req.user.verified) {
      return res.status(403).json({ message: 'Your account is waiting for admin verification' });
    }
    const { title, foodType, quantity, cookedAt, pickupBefore, storageNotes, address, lng, lat } = req.body;
    if (new Date(pickupBefore) <= new Date()) {
      return res.status(400).json({ message: 'Pickup time must be in the future' });
    }
    const listing = await Listing.create({
      donor: req.user._id, title, foodType, quantity, cookedAt, pickupBefore, storageNotes, address,
      location: { type: 'Point', coordinates: [Number(lng), Number(lat)] },
    });
    req.app.get('io').emit('listing:new', listing);   // real-time push to everyone
    res.status(201).json(listing);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Anyone logged in: available listings, optionally nearest first
// GET /api/listings?lng=77.4&lat=28.6&km=10
router.get('/', protect, async (req, res) => {
  try {
    const { lng, lat, km = 10 } = req.query;
    const filter = { status: 'available', pickupBefore: { $gt: new Date() } };
    if (lng && lat) {
      filter.location = {
        $near: {
          $geometry: { type: 'Point', coordinates: [Number(lng), Number(lat)] },
          $maxDistance: Number(km) * 1000,
        },
      };
    }
    const listings = await Listing.find(filter).populate('donor', 'name organization phone');
    res.json(listings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Donor: their own listings. Receiver: listings they have claimed.
router.get('/mine', protect, async (req, res) => {
  try {
    const filter = req.user.role === 'donor' ? { donor: req.user._id } : { claimedBy: req.user._id };
    const listings = await Listing.find(filter)
      .sort({ createdAt: -1 })
      .populate('donor', 'name organization phone');
    res.json(listings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Receiver claims a listing. findOneAndUpdate is atomic, so two people
// can never claim the same food: only one update matches status 'available'.
router.post('/:id/claim', protect, allow('receiver'), async (req, res) => {
  try {
    if (!req.user.verified) {
      return res.status(403).json({ message: 'Your account is waiting for admin verification' });
    }
    const pickupCode = crypto.randomInt(100000, 999999).toString();
    const listing = await Listing.findOneAndUpdate(
      { _id: req.params.id, status: 'available', pickupBefore: { $gt: new Date() } },
      { status: 'claimed', claimedBy: req.user._id, pickupCode },
      { new: true }
    );
    if (!listing) {
      return res.status(409).json({ message: 'Sorry, this food was just claimed or has expired' });
    }
    req.app.get('io').emit('listing:claimed', { id: listing._id });
    res.json({ message: 'Claimed!', pickupCode, listing });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Donor confirms handover by entering the receiver's pickup code
router.post('/:id/complete', protect, allow('donor'), async (req, res) => {
  try {
    const listing = await Listing.findOneAndUpdate(
      { _id: req.params.id, donor: req.user._id, status: 'claimed', pickupCode: req.body.code },
      { status: 'completed' },
      { new: true }
    );
    if (!listing) return res.status(400).json({ message: 'Wrong code or listing not in claimed state' });
    res.json({ message: 'Handover confirmed', listing });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
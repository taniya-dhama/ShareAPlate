const mongoose = require('mongoose');

const listingSchema = new mongoose.Schema({
  donor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  foodType: { type: String, enum: ['veg', 'non-veg', 'bakery', 'other'], default: 'veg' },
  quantity: { type: Number, required: true, min: 1 },          // number of servings
  cookedAt: { type: Date, required: true },
  pickupBefore: { type: Date, required: true },
  storageNotes: String,
  address: { type: String, required: true },
  location: {                                                   // GeoJSON for nearby search
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], required: true },            // [longitude, latitude]
  },
  status: { type: String, enum: ['available', 'claimed', 'completed', 'expired'], default: 'available' },
  claimedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  pickupCode: String,
}, { timestamps: true });

listingSchema.index({ location: '2dsphere' });
listingSchema.index({ status: 1, pickupBefore: 1 });

module.exports = mongoose.model('Listing', listingSchema);

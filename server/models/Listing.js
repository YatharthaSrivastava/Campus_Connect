const mongoose = require('mongoose');

const listingSchema = new mongoose.Schema(
  {
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    sellerName: {
      type: String,
      default: 'PSIT Student',
    },
    sellerEmail: {
      type: String,
      default: '',
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      enum: ['textbook', 'lab_coat', 'tool', 'electronics'],
      index: true,
    },
    priceOrKarma: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ['active', 'reserved', 'sold'],
      default: 'active',
      index: true,
    },
    images: {
      type: [String],
      default: [],
    },
    condition: {
      type: String,
      enum: ['Brand New', 'Like New', 'Gently Used', 'Good', 'Fair', 'Heavily Used'],
      default: 'Good',
    },
    conditionNotes: {
      type: String,
      default: '',
    },
    collegeName: {
      type: String,
      default: 'Pranveer Singh Institute of Technology (PSIT), Kanpur',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.models.Listing || mongoose.model('Listing', listingSchema);

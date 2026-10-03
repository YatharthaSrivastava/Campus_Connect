const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema(
  {
    listingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Listing',
      required: true,
      index: true,
    },
    buyerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    otpHash: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'expired'],
      default: 'pending',
      index: true,
    },
    failedAttempts: {
      type: Number,
      default: 0,
      max: 5,
    },
    karmaAwarded: {
      type: Number,
      default: 15,
    },
    completedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

// TTL Index specified in DDD: 15-minute Time-To-Live index for OTP hygiene
transactionSchema.index({ createdAt: 1 }, { expireAfterSeconds: 900 });

module.exports = mongoose.models.Transaction || mongoose.model('Transaction', transactionSchema);

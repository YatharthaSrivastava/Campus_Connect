const mongoose = require('mongoose');

const studySessionSchema = new mongoose.Schema(
  {
    subjectCode: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      index: true,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
    },
    creatorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    creatorName: {
      type: String,
      default: 'PSIT Student',
    },
    location: {
      type: String,
      required: true,
      trim: true,
    },
    locationCoordinates: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [longitude, latitude] e.g. [80.1983, 26.4729] for PSIT
        default: [80.1983, 26.4729],
      },
    },
    attendeeList: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    maxParticipants: {
      type: Number,
      default: 6,
    },
    status: {
      type: String,
      enum: ['active', 'in_session', 'completed'],
      default: 'active',
    },
  },
  { timestamps: true }
);

// Geospatial Index specified in DDD: 2dsphere index for Mapbox spatial queries
studySessionSchema.index({ locationCoordinates: '2dsphere' });

// TTL Index specified in DDD: Temporary session state with TTL expiration (24h)
studySessionSchema.index({ createdAt: 1 }, { expireAfterSeconds: 86400 });

module.exports = mongoose.models.StudySession || mongoose.model('StudySession', studySessionSchema);

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    firebaseUid: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    department: {
      type: String,
      trim: true,
      default: 'Computer Science',
    },
    karmaScore: {
      type: Number,
      default: 10, // Strictly following DDD: Default: 10
      min: 0,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    collegeName: {
      type: String,
      trim: true,
      default: 'Pranveer Singh Institute of Technology (PSIT), Kanpur',
    },
    collegeId: {
      type: String,
      trim: true,
      uppercase: true,
      default: 'PSIT',
    },
    academicYear: {
      type: Number,
      default: 2,
    },
    section: {
      type: String,
      trim: true,
      default: 'A',
    },
    bio: {
      type: String,
      default: '',
    },
    avatarUrl: {
      type: String,
      default: '',
    },
    skillsOffered: {
      type: [String],
      default: ['DSA', 'Python', 'DBMS'],
    },
    skillsNeeded: {
      type: [String],
      default: ['Machine Learning', 'React'],
    },
    skillLevel: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      default: 'intermediate',
    },
    isProfileComplete: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Compound Index specified in DDD: { department: 1, isVerified: 1 }
userSchema.index({ department: 1, isVerified: 1 });

module.exports = mongoose.models.User || mongoose.model('User', userSchema);

const crypto = require('crypto');
const { getIsConnected } = require('../config/db');
const User = require('../models/User');
const Listing = require('../models/Listing');
const StudySession = require('../models/StudySession');
const Transaction = require('../models/Transaction');
const Rating = require('../models/Rating');

// ── In-Memory Collections (Pre-seeded with PSIT campus data) ────────────────
const memoryRatings = [
  {
    _id: '64f5a1b2c3d4e5f6a7b8c001',
    reviewerId: '64f1a2b3c4d5e6f7a8b9c002',
    reviewerName: 'Priya Sharma',
    revieweeId: '64f1a2b3c4d5e6f7a8b9c001',
    stars: 5,
    feedback: 'Super fast handshake at Library Pod. The drafting kit was in mint condition!',
    karmaAwarded: 5,
    createdAt: new Date(Date.now() - 3600000 * 24),
  },
  {
    _id: '64f5a1b2c3d4e5f6a7b8c002',
    reviewerId: '64f1a2b3c4d5e6f7a8b9c003',
    reviewerName: 'Aman Verma',
    revieweeId: '64f1a2b3c4d5e6f7a8b9c001',
    stars: 5,
    feedback: 'Great peer mentor for DBMS and React. Highly recommended!',
    karmaAwarded: 5,
    createdAt: new Date(Date.now() - 3600000 * 12),
  },
];

const memoryKarmaHistory = [
  {
    _id: 'kh_01',
    userId: '64f1a2b3c4d5e6f7a8b9c001',
    amount: 10,
    title: 'Campus Onboarding Bonus',
    description: 'Initial student trust allocation for joining CampusConnect.',
    category: 'welcome',
    createdAt: new Date(Date.now() - 3600000 * 48),
  },
  {
    _id: 'kh_02',
    userId: '64f1a2b3c4d5e6f7a8b9c002',
    amount: 10,
    title: 'Campus Onboarding Bonus',
    description: 'Initial student trust allocation for joining CampusConnect.',
    category: 'welcome',
    createdAt: new Date(Date.now() - 3600000 * 72),
  },
  {
    _id: 'kh_03',
    userId: '64f1a2b3c4d5e6f7a8b9c002',
    amount: 15,
    title: 'Verified Handshake Transfer',
    description: 'Physical exchange verified at Library Pod 3.',
    category: 'handshake',
    createdAt: new Date(Date.now() - 3600000 * 24),
  },
  {
    _id: 'kh_04',
    userId: '64f1a2b3c4d5e6f7a8b9c002',
    amount: 5,
    title: 'Excellence Review Bonus',
    description: 'Received a 5-star peer review for mentoring.',
    category: 'rating',
    createdAt: new Date(Date.now() - 3600000 * 12),
  },
  {
    _id: 'kh_05',
    userId: '64f1a2b3c4d5e6f7a8b9c002',
    amount: 15,
    title: 'Verified Handshake Transfer',
    description: 'Physical exchange verified at CS Lab 2.',
    category: 'handshake',
    createdAt: new Date(Date.now() - 3600000 * 6),
  },
];
const memoryUsers = [
  {
    _id: '64f1a2b3c4d5e6f7a8b9c001',
    firebaseUid: 'mock_yathartha_psit_ac_in',
    email: 'yathartha@psit.ac.in',
    fullName: 'Yathartha Gupta',
    department: 'Computer Science',
    karmaScore: 10,
    isVerified: true,
    collegeId: 'PSIT22CS101',
    academicYear: 3,
    section: 'A',
    bio: 'CS Junior building CampusConnect. Passionate about Fullstack & System Design.',
    skillsOffered: ['React', 'Node.js', 'DSA', 'MongoDB'],
    skillsNeeded: ['Machine Learning', 'Cloud Architecture'],
    skillLevel: 'intermediate',
    isProfileComplete: true,
    createdAt: new Date(),
  },
  {
    _id: '64f1a2b3c4d5e6f7a8b9c002',
    firebaseUid: 'mock_priya_psit_ac_in',
    email: 'priya.sharma@psit.ac.in',
    fullName: 'Priya Sharma',
    department: 'Computer Science',
    karmaScore: 45,
    isVerified: true,
    collegeId: 'PSIT21CS042',
    academicYear: 4,
    section: 'B',
    bio: 'Final year CS. Conducted 10+ code reviews and DBMS tutoring sessions.',
    skillsOffered: ['DBMS', 'SQL', 'Python', 'Code Review'],
    skillsNeeded: ['Kubernetes', 'Go'],
    skillLevel: 'advanced',
    isProfileComplete: true,
    createdAt: new Date(),
  },
  {
    _id: '64f1a2b3c4d5e6f7a8b9c003',
    firebaseUid: 'mock_aman_psit_ac_in',
    email: 'aman.verma@psit.ac.in',
    fullName: 'Aman Verma',
    department: 'Information Technology',
    karmaScore: 25,
    isVerified: true,
    collegeId: 'PSIT22IT018',
    academicYear: 3,
    section: 'A',
    bio: 'Competitive programmer, active at PSIT Coding Club.',
    skillsOffered: ['C++', 'Algorithms', 'Data Structures', 'Operating Systems'],
    skillsNeeded: ['Flutter', 'Next.js'],
    skillLevel: 'advanced',
    isProfileComplete: true,
    createdAt: new Date(),
  },
];

const memoryListings = [
  {
    _id: '64f2b3c4d5e6f7a8b9c00101',
    sellerId: '64f1a2b3c4d5e6f7a8b9c002',
    sellerName: 'Priya Sharma',
    sellerEmail: 'priya.sharma@psit.ac.in',
    title: 'Database System Concepts (Silberschatz/Korth) 7th Edition',
    description: 'Clean copy, highlighted key exam topics for KCS501 syllabus. No missing pages.',
    category: 'textbook',
    priceOrKarma: 350,
    status: 'active',
    condition: 'Like New',
    images: ['https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500&q=80'],
    createdAt: new Date(Date.now() - 3600000 * 2),
  },
  {
    _id: '64f2b3c4d5e6f7a8b9c00102',
    sellerId: '64f1a2b3c4d5e6f7a8b9c003',
    sellerName: 'Aman Verma',
    sellerEmail: 'aman.verma@psit.ac.in',
    title: 'PSIT Chemistry & Physics Lab Coat (Size L, White)',
    description: 'Clean, freshly washed lab coat required for 1st/2nd year laboratory coursework.',
    category: 'lab_coat',
    priceOrKarma: 180,
    status: 'active',
    condition: 'Good',
    images: ['https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=500&q=80'],
    createdAt: new Date(Date.now() - 3600000 * 5),
  },
  {
    _id: '64f2b3c4d5e6f7a8b9c00103',
    sellerId: '64f1a2b3c4d5e6f7a8b9c001',
    sellerName: 'Yathartha Gupta',
    sellerEmail: 'yathartha@psit.ac.in',
    title: 'Engineering Graphics Mini-Drafter with Hard Case & Sheet Clips',
    description: 'Fully functional Omega drafting arm for Engineering Drawing exams. Includes scale.',
    category: 'tool',
    priceOrKarma: 420,
    status: 'active',
    condition: 'Good',
    images: ['https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=500&q=80'],
    createdAt: new Date(Date.now() - 3600000 * 12),
  },
  {
    _id: '64f2b3c4d5e6f7a8b9c00104',
    sellerId: '64f1a2b3c4d5e6f7a8b9c002',
    sellerName: 'Priya Sharma',
    sellerEmail: 'priya.sharma@psit.ac.in',
    title: 'Casio FX-991EX ClassWiz Scientific Calculator (Non-Programmable)',
    description: 'Permitted in university examinations. Dual solar & battery powered, perfect condition.',
    category: 'electronics',
    priceOrKarma: 750,
    status: 'active',
    condition: 'Like New',
    images: ['https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?w=500&q=80'],
    createdAt: new Date(Date.now() - 3600000 * 20),
  },
];

const memoryStudySessions = [
  {
    _id: '64f3c4d5e6f7a8b9c00201',
    subjectCode: 'KCS501',
    subject: 'DBMS (Database Management Systems)',
    creatorId: '64f1a2b3c4d5e6f7a8b9c002',
    creatorName: 'Priya Sharma',
    location: 'Library Pod 3 (Quiet Study Zone)',
    locationCoordinates: {
      type: 'Point',
      coordinates: [80.1983, 26.4729],
    },
    attendeeList: ['64f1a2b3c4d5e6f7a8b9c002', '64f1a2b3c4d5e6f7a8b9c001'],
    maxParticipants: 5,
    status: 'active',
    createdAt: new Date(),
  },
  {
    _id: '64f3c4d5e6f7a8b9c00202',
    subjectCode: 'KCS401',
    subject: 'Operating Systems - Process Scheduling',
    creatorId: '64f1a2b3c4d5e6f7a8b9c003',
    creatorName: 'Aman Verma',
    location: 'CS Lab 2 (Terminal Room)',
    locationCoordinates: {
      type: 'Point',
      coordinates: [80.1985, 26.4731],
    },
    attendeeList: ['64f1a2b3c4d5e6f7a8b9c003'],
    maxParticipants: 6,
    status: 'active',
    createdAt: new Date(),
  },
];

const memoryTransactions = [];

// ── Store Service API ───────────────────────────────────────────────────────
const StoreService = {
  // Users
  async findUserByEmail(email) {
    if (getIsConnected()) {
      return await User.findOne({ email: email.toLowerCase() });
    }
    return memoryUsers.find((u) => u.email.toLowerCase() === email.toLowerCase()) || null;
  },

  async findUserByUid(uid) {
    if (getIsConnected()) {
      return await User.findOne({ firebaseUid: uid });
    }
    return memoryUsers.find((u) => u.firebaseUid === uid) || null;
  },

  async findUserById(id) {
    if (getIsConnected()) {
      return await User.findById(id);
    }
    return memoryUsers.find((u) => u._id.toString() === id.toString()) || null;
  },

  async createUser(data) {
    if (getIsConnected()) {
      return await User.create(data);
    }
    const newUser = {
      _id: crypto.randomBytes(12).toString('hex'),
      karmaScore: 10,
      isVerified: true,
      createdAt: new Date(),
      ...data,
    };
    memoryUsers.push(newUser);
    return newUser;
  },

  async updateUser(id, updates) {
    if (getIsConnected()) {
      return await User.findByIdAndUpdate(id, { $set: updates }, { new: true });
    }
    const idx = memoryUsers.findIndex((u) => u._id.toString() === id.toString());
    if (idx !== -1) {
      memoryUsers[idx] = { ...memoryUsers[idx], ...updates };
      return memoryUsers[idx];
    }
    return null;
  },

  async searchUsers({ department, skillLevel, subjectCode }) {
    if (getIsConnected()) {
      const q = { isVerified: true };
      if (department) q.department = department;
      if (skillLevel) q.skillLevel = skillLevel;
      return await User.find(q).limit(20);
    }
    return memoryUsers.filter((u) => {
      let match = u.isVerified;
      if (department && u.department.toLowerCase() !== department.toLowerCase()) match = false;
      if (skillLevel && u.skillLevel !== skillLevel) match = false;
      return match;
    });
  },

  // Listings
  async getListings({ category, status = 'active' }) {
    if (getIsConnected()) {
      const q = {};
      if (category) q.category = category;
      if (status) q.status = status;
      return await Listing.find(q).sort({ createdAt: -1 });
    }
    return memoryListings.filter((l) => {
      if (category && l.category !== category) return false;
      if (status && l.status !== status) return false;
      return true;
    });
  },

  async getListingById(id) {
    if (getIsConnected()) {
      return await Listing.findById(id);
    }
    return memoryListings.find((l) => l._id.toString() === id.toString()) || null;
  },

  async createListing(data) {
    if (getIsConnected()) {
      return await Listing.create(data);
    }
    const newListing = {
      _id: crypto.randomBytes(12).toString('hex'),
      status: 'active',
      createdAt: new Date(),
      ...data,
    };
    memoryListings.unshift(newListing);
    return newListing;
  },

  async updateListing(id, updates) {
    if (getIsConnected()) {
      return await Listing.findByIdAndUpdate(id, { $set: updates }, { new: true });
    }
    const idx = memoryListings.findIndex((l) => l._id.toString() === id.toString());
    if (idx !== -1) {
      memoryListings[idx] = { ...memoryListings[idx], ...updates };
      return memoryListings[idx];
    }
    return null;
  },

  // Study Sessions
  async getStudySessions() {
    if (getIsConnected()) {
      return await StudySession.find({ status: 'active' }).sort({ createdAt: -1 });
    }
    return memoryStudySessions.filter((s) => s.status === 'active');
  },

  async createStudySession(data) {
    if (getIsConnected()) {
      return await StudySession.create(data);
    }
    const newSession = {
      _id: crypto.randomBytes(12).toString('hex'),
      attendeeList: [data.creatorId],
      status: 'active',
      createdAt: new Date(),
      ...data,
    };
    memoryStudySessions.unshift(newSession);
    return newSession;
  },

  // Transactions & Handshake
  async createTransaction(data) {
    if (getIsConnected()) {
      return await Transaction.create(data);
    }
    const newTx = {
      _id: crypto.randomBytes(12).toString('hex'),
      status: 'pending',
      failedAttempts: 0,
      createdAt: new Date(),
      ...data,
    };
    memoryTransactions.push(newTx);
    return newTx;
  },

  async findTransactionById(id) {
    if (getIsConnected()) {
      return await Transaction.findById(id);
    }
    return memoryTransactions.find((t) => t._id.toString() === id.toString()) || null;
  },

  async completeTransaction(id, buyerId, sellerId, karmaAwarded = 15) {
    if (getIsConnected()) {
      const tx = await Transaction.findById(id);
      if (tx) {
        tx.status = 'completed';
        tx.completedAt = new Date();
        await tx.save();
        await User.findByIdAndUpdate(buyerId, { $inc: { karmaScore: karmaAwarded } });
        await User.findByIdAndUpdate(sellerId, { $inc: { karmaScore: karmaAwarded } });
        if (tx.listingId) {
          await Listing.findByIdAndUpdate(tx.listingId, { status: 'sold' });
        }
      }
      return tx;
    }

    const tx = memoryTransactions.find((t) => t._id.toString() === id.toString());
    if (tx) {
      tx.status = 'completed';
      tx.completedAt = new Date();
      // Award karma to both buyer and seller
      const buyer = memoryUsers.find((u) => u._id.toString() === buyerId.toString());
      if (buyer) buyer.karmaScore = (buyer.karmaScore || 10) + karmaAwarded;
      const seller = memoryUsers.find((u) => u._id.toString() === sellerId.toString());
      if (seller) seller.karmaScore = (seller.karmaScore || 10) + karmaAwarded;

      // Add to Karma History Ledger
      memoryKarmaHistory.unshift({
        _id: crypto.randomBytes(12).toString('hex'),
        userId: buyerId,
        amount: karmaAwarded,
        title: 'Verified Handshake Transfer',
        description: 'Physical exchange verified via cryptographic OTP & QR.',
        category: 'handshake',
        createdAt: new Date(),
      });
      memoryKarmaHistory.unshift({
        _id: crypto.randomBytes(12).toString('hex'),
        userId: sellerId,
        amount: karmaAwarded,
        title: 'Verified Handshake Transfer',
        description: 'Physical exchange verified via cryptographic OTP & QR.',
        category: 'handshake',
        createdAt: new Date(),
      });

      // Mark listing as sold
      const listing = memoryListings.find((l) => l._id.toString() === tx.listingId.toString());
      if (listing) listing.status = 'sold';
    }
    return tx;
  },

  async getUserTransactions(userId) {
    if (getIsConnected()) {
      return await Transaction.find({
        $or: [{ buyerId: userId }, { sellerId: userId }],
      }).sort({ createdAt: -1 });
    }
    return memoryTransactions.filter(
      (t) => t.buyerId?.toString() === userId?.toString() || t.sellerId?.toString() === userId?.toString()
    );
  },

  // Ratings & Peer Reviews
  async createRating({ transactionId, reviewerId, reviewerName, revieweeId, stars, feedback }) {
    const karmaBonus = 5;
    if (getIsConnected()) {
      const rating = await Rating.create({
        transactionId,
        reviewerId,
        reviewerName,
        revieweeId,
        stars,
        feedback,
        karmaAwarded: karmaBonus,
      });

      // Award +5 Karma to reviewer for providing feedback
      await User.findByIdAndUpdate(reviewerId, { $inc: { karmaScore: karmaBonus } });
      // If 5 stars, award +5 bonus Karma to reviewee as excellence reward
      if (stars === 5) {
        await User.findByIdAndUpdate(revieweeId, { $inc: { karmaScore: 5 } });
      }

      return rating;
    }

    const rating = {
      _id: crypto.randomBytes(12).toString('hex'),
      transactionId,
      reviewerId,
      reviewerName,
      revieweeId,
      stars,
      feedback,
      karmaAwarded: karmaBonus,
      createdAt: new Date(),
    };
    memoryRatings.unshift(rating);

    // Update in-memory karma
    const reviewer = memoryUsers.find((u) => u._id.toString() === reviewerId?.toString());
    if (reviewer) reviewer.karmaScore = (reviewer.karmaScore || 10) + karmaBonus;
    memoryKarmaHistory.unshift({
      _id: crypto.randomBytes(12).toString('hex'),
      userId: reviewerId,
      amount: karmaBonus,
      title: 'Community Review Feedback',
      description: 'Submitted peer review after academic exchange.',
      category: 'rating',
      createdAt: new Date(),
    });

    if (stars === 5) {
      const reviewee = memoryUsers.find((u) => u._id.toString() === revieweeId?.toString());
      if (reviewee) reviewee.karmaScore = (reviewee.karmaScore || 10) + 5;
      memoryKarmaHistory.unshift({
        _id: crypto.randomBytes(12).toString('hex'),
        userId: revieweeId,
        amount: 5,
        title: 'Excellence 5-Star Bonus',
        description: 'Earned 5-star rating from peer for academic assistance.',
        category: 'rating',
        createdAt: new Date(),
      });
    }

    return rating;
  },

  async getRatingsForUser(userId) {
    if (getIsConnected()) {
      return await Rating.find({ revieweeId: userId }).sort({ createdAt: -1 });
    }
    return memoryRatings.filter((r) => r.revieweeId?.toString() === userId?.toString());
  },

  // ── Karma Ledger & Rewards Center ─────────────────────────────────────────
  async addKarmaEntry({ userId, amount, title, description, category = 'general' }) {
    const entry = {
      _id: crypto.randomBytes(12).toString('hex'),
      userId,
      amount,
      title,
      description,
      category,
      createdAt: new Date(),
    };
    memoryKarmaHistory.unshift(entry);
    return entry;
  },

  async getKarmaHistory(userId) {
    const userHistory = memoryKarmaHistory.filter(
      (kh) => kh.userId?.toString() === userId?.toString()
    );
    // If no history yet, ensure at least onboarding bonus is returned
    if (userHistory.length === 0) {
      return [
        {
          _id: 'kh_default_' + userId,
          userId,
          amount: 10,
          title: 'Campus Onboarding Bonus',
          description: 'Initial student trust allocation for joining CampusConnect.',
          category: 'welcome',
          createdAt: new Date(),
        },
      ];
    }
    return userHistory;
  },
};

module.exports = StoreService;

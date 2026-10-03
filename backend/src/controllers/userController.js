const User = require('../models/User');
const StoreService = require('../services/storeService');
const { getIsConnected } = require('../config/db');
const { sendSuccess, sendError, sendPaginated } = require('../utils/apiResponse');

/**
 * PATCH /api/v1/users/profile
 */
const updateProfile = async (req, res) => {
  try {
    const ALLOWED_FIELDS = [
      'fullName',
      'collegeName',
      'collegeId',
      'department',
      'academicYear',
      'section',
      'bio',
      'avatarUrl',
      'skillsOffered',
      'skillsNeeded',
    ];

    const updates = {};
    ALLOWED_FIELDS.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    if (Object.keys(updates).length === 0) {
      return sendError(res, 'No valid fields provided for update', 400);
    }

    if (updates.skillsOffered && Array.isArray(updates.skillsOffered)) {
      updates.skillsOffered = updates.skillsOffered.map((s) => s.trim()).filter(Boolean).slice(0, 10);
    }
    if (updates.skillsNeeded && Array.isArray(updates.skillsNeeded)) {
      updates.skillsNeeded = updates.skillsNeeded.map((s) => s.trim()).filter(Boolean).slice(0, 10);
    }

    updates.isProfileComplete = true;

    const updatedUser = await StoreService.updateUser(req.user._id, updates);

    return sendSuccess(res, updatedUser, 'Profile updated successfully');
  } catch (err) {
    console.error('updateProfile error:', err);
    return sendError(res, 'Failed to update profile', 500);
  }
};

/**
 * GET /api/v1/users/:userId
 */
const getUserById = async (req, res) => {
  try {
    const user = await StoreService.findUserById(req.params.userId);
    if (!user) {
      return sendError(res, 'User not found', 404);
    }
    return sendSuccess(res, user);
  } catch (err) {
    return sendError(res, 'Failed to fetch user', 500);
  }
};

/**
 * GET /api/v1/users/search
 */
const searchUsers = async (req, res) => {
  try {
    const { skill, department, year } = req.query;
    const users = await StoreService.searchUsers({
      department,
      subjectCode: skill,
    });
    return sendSuccess(res, users, 'Peers found');
  } catch (err) {
    console.error('searchUsers error:', err);
    return sendError(res, 'Failed to search users', 500);
  }
};

/**
 * GET /api/v1/users/leaderboard
 */
const getLeaderboard = async (req, res) => {
  try {
    const users = await StoreService.searchUsers({});
    const sorted = [...users].sort((a, b) => (b.karmaScore || 0) - (a.karmaScore || 0));
    return sendSuccess(res, sorted, 'Karma leaderboard');
  } catch (err) {
    return sendError(res, 'Failed to fetch leaderboard', 500);
  }
};

/**
 * GET /api/v1/users/karma/history
 */
const getMyKarmaHistory = async (req, res) => {
  try {
    const history = await StoreService.getKarmaHistory(req.user._id);
    const totalEarned = history.reduce((acc, h) => acc + (h.amount || 0), 0);

    // Karma Tier Calculation
    const currentKarma = req.user.karmaScore || 10;
    let tier = 'Bronze Scholar';
    let nextTier = 'Silver Mentor';
    let nextTierPoints = 50;

    if (currentKarma >= 300) {
      tier = 'Platinum Legend';
      nextTier = 'Maximum Tier Reached';
      nextTierPoints = 300;
    } else if (currentKarma >= 150) {
      tier = 'Gold Pioneer';
      nextTier = 'Platinum Legend';
      nextTierPoints = 300;
    } else if (currentKarma >= 50) {
      tier = 'Silver Mentor';
      nextTier = 'Gold Pioneer';
      nextTierPoints = 150;
    }

    const earnGuide = [
      {
        action: 'Verified Handshake Transfer',
        points: '+15 Karma',
        icon: '🤝',
        desc: 'Meet peer in a Safe Exchange Zone, enter OTP or scan QR to finalize.',
      },
      {
        action: 'Host Peer Mentorship Session',
        points: '+10 Karma',
        icon: '🧑‍🏫',
        desc: 'Guide a junior student in DSA, DBMS, or course projects at a campus pod.',
      },
      {
        action: 'Submit Community Peer Review',
        points: '+5 Karma',
        icon: '⭐',
        desc: 'Leave honest star ratings and feedback after an academic exchange.',
      },
      {
        action: 'Receive a 5-Star Excellence Rating',
        points: '+5 Bonus Karma',
        icon: '🌟',
        desc: 'Awarded automatically when a peer gives your item or mentoring 5 stars.',
      },
      {
        action: 'List Your Academic Gear',
        points: '+5 Karma',
        icon: '📦',
        desc: 'Put up idle textbooks, drafters, or lab coats for campus reuse.',
      },
    ];

    return sendSuccess(res, {
      currentKarma,
      tier,
      nextTier,
      nextTierPoints,
      totalEarned,
      history,
      earnGuide,
    }, 'Karma history retrieved');
  } catch (err) {
    console.error('getMyKarmaHistory error:', err);
    return sendError(res, 'Failed to fetch karma history', 500);
  }
};

module.exports = {
  updateProfile,
  getUserById,
  searchUsers,
  getLeaderboard,
  getMyTransactions,
  getMyKarmaHistory,
};

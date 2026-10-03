const express = require('express');
const router = express.Router();
const {
  updateProfile,
  getUserById,
  searchUsers,
  getLeaderboard,
  getMyTransactions,
  getMyKarmaHistory,
} = require('../controllers/userController');
const { authenticate, requireCompleteProfile } = require('../middlewares/authMiddleware');

// All user routes require authentication
router.use(authenticate);

router.patch('/profile', updateProfile);
router.get('/leaderboard', getLeaderboard);
router.get('/transactions/my', getMyTransactions);
router.get('/karma/history', getMyKarmaHistory);
router.get('/search', requireCompleteProfile, searchUsers);
router.get('/:userId', getUserById);
router.get('/:userId/profile', getUserById);

module.exports = router;

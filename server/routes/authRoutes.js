const express = require('express');
const router = express.Router();
const {
  verifyTokenAndDomain,
  getSession,
  register,
  login,
} = require('../controllers/authController');
const { authenticate } = require('../middlewares/authMiddleware');

// Per API Documentation:
// POST /auth/verify - Validates Firebase token & enforces .edu domain constraints
router.post('/verify', verifyTokenAndDomain);

// GET /auth/session - Fetches current authenticated user profile context
router.get('/session', authenticate, getSession);

// Additional onboarding helpers
router.post('/register', register);
router.post('/login', login);

module.exports = router;

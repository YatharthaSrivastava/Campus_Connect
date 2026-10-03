const express = require('express');
const router = express.Router();
const { initiateExchange, verifyExchange } = require('../controllers/exchangeController');
const { authenticate } = require('../middlewares/authMiddleware');
const { otpLimiter } = require('../middlewares/rateLimiter');

// POST /exchange/initiate - Starts transaction handshake and generates secure OTP
router.post('/initiate', authenticate, initiateExchange);

// POST /exchange/verify - Physical meetup validation via OTP or QR
router.post('/verify', authenticate, otpLimiter, verifyExchange);

module.exports = router;

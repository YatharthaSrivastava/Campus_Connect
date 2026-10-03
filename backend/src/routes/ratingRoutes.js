const express = require('express');
const router = express.Router();
const { createRating, getUserRatings } = require('../controllers/ratingController');
const { authenticate, optionalAuth } = require('../middlewares/authMiddleware');

router.post('/', authenticate, createRating);
router.get('/user/:userId', optionalAuth, getUserRatings);

module.exports = router;

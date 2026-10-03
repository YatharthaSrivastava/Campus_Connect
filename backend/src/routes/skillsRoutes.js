const express = require('express');
const router = express.Router();
const { matchSkills } = require('../controllers/skillsController');
const { optionalAuth } = require('../middlewares/authMiddleware');

// GET /skills/match - Matches user with peers for 1-on-1 tutoring / code reviews
router.get('/match', optionalAuth, matchSkills);

module.exports = router;

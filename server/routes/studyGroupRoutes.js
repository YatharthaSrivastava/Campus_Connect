const express = require('express');
const router = express.Router();
const { getStudyGroups, createStudyGroup } = require('../controllers/studyGroupController');
const { authenticate, optionalAuth } = require('../middlewares/authMiddleware');

// GET /study-groups - Lists active sessions
router.get('/', optionalAuth, getStudyGroups);

// POST /study-groups - Creates a real-time subject-based study group session
router.post('/', authenticate, createStudyGroup);

module.exports = router;

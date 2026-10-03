const jwt = require('jsonwebtoken');
const { admin } = require('../config/firebase');
const StoreService = require('../services/storeService');
const { sendError } = require('../utils/apiResponse');

const JWT_SECRET = process.env.JWT_SECRET || 'campusconnect_dev_secret_2026';

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return sendError(res, 'Unauthorized: Missing or invalid authorization token', 401);
    }

    const token = authHeader.split(' ')[1];
    let userId = null;

    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      userEmail = decoded.email;
      userUid = decoded.uid;
      userId = decoded.id;
    } catch {
      if (process.env.MOCK_AUTH !== 'true') {
        try {
          const decodedFirebase = await admin.auth().verifyIdToken(token);
          userEmail = decodedFirebase.email;
          userUid = decodedFirebase.uid;
        } catch {
          return sendError(res, 'Unauthorized: Invalid authentication credentials', 401);
        }
      } else {
        return sendError(res, 'Unauthorized: Session expired or invalid token', 401);
      }
    }

    let user = null;
    if (userId) user = await StoreService.findUserById(userId);
    if (!user && userEmail) user = await StoreService.findUserByEmail(userEmail);
    if (!user && userUid) user = await StoreService.findUserByUid(userUid);

    if (!user) {
      user = await StoreService.createUser({
        firebaseUid: userUid || `usr_${Date.now()}`,
        email: userEmail || 'student@psit.ac.in',
        fullName: userEmail ? userEmail.split('@')[0].replace(/[._]/g, ' ') : 'PSIT Student',
        department: 'Computer Science',
        karmaScore: 10,
        isVerified: true,
      });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error('Auth middleware error:', err);
    return sendError(res, 'Internal server error during authentication', 500);
  }
};

const optionalAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    req.user = null;
    return next();
  }
  return authenticate(req, res, next);
};

const requireCompleteProfile = (req, res, next) => {
  next();
};

module.exports = { authenticate, optionalAuth, requireCompleteProfile };

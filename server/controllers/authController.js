const jwt = require('jsonwebtoken');
const StoreService = require('../services/storeService');
const { validateInstitutionalEmail } = require('../utils/domainValidator');
const { sendSuccess, sendError } = require('../utils/apiResponse');
const { admin } = require('../config/firebase');

const JWT_SECRET = process.env.JWT_SECRET || 'campusconnect_dev_secret_2026';

/**
 * POST /api/v1/auth/verify
 * Accepts any standard email address.
 */
const verifyTokenAndDomain = async (req, res) => {
  try {
    const { idToken, domain, email } = req.body;

    const rawEmail = email || (domain && domain.includes('@') ? domain : `user@${domain || 'gmail.com'}`);
    const check = validateInstitutionalEmail(rawEmail);
    if (!check.valid) {
      return sendError(res, check.reason, 400);
    }

    const verifiedEmail = rawEmail.trim().toLowerCase();
    let uid = `uid_${Date.now()}`;

    if (process.env.MOCK_AUTH !== 'true' && idToken && idToken !== 'mock_token') {
      try {
        const decoded = await admin.auth().verifyIdToken(idToken);
        uid = decoded.uid;
        if (decoded.email) verifiedEmail = decoded.email.toLowerCase().trim();
      } catch {
        return sendError(res, 'Missing or expired Firebase bearer token.', 401);
      }
    }

    // Resolve or create user in StoreService
    let user = await StoreService.findUserByEmail(verifiedEmail);
    if (!user) {
      user = await StoreService.createUser({
        firebaseUid: uid,
        email: verifiedEmail,
        fullName: verifiedEmail.split('@')[0].replace(/[._]/g, ' '),
        department: 'Computer Science',
        collegeName: 'Pranveer Singh Institute of Technology (PSIT), Kanpur',
        karmaScore: 10,
        isVerified: true,
      });
    }

    const token = jwt.sign(
      { uid: user.firebaseUid || uid, email: user.email, id: user._id },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return sendSuccess(
      res,
      {
        token,
        mockToken: token,
        user: {
          id: user._id,
          email: user.email,
          fullName: user.fullName,
          collegeName: user.collegeName,
          department: user.department,
          karmaScore: user.karmaScore || 10,
          isVerified: user.isVerified,
        },
      },
      'Authentication verified.'
    );
  } catch (err) {
    console.error('Verify error:', err);
    return sendError(res, 'Authentication verification failed', 500);
  }
};

/**
 * GET /api/v1/auth/session
 * Fetches current authenticated user profile context.
 */
const getSession = async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return sendError(res, 'Unauthorized', 401);
    }
    return sendSuccess(res, {
      id: user._id,
      email: user.email,
      fullName: user.fullName,
      collegeName: user.collegeName || 'Pranveer Singh Institute of Technology (PSIT), Kanpur',
      department: user.department,
      collegeId: user.collegeId,
      academicYear: user.academicYear,
      section: user.section,
      bio: user.bio,
      karmaScore: user.karmaScore || 10,
      isVerified: user.isVerified,
      skillsOffered: user.skillsOffered || [],
      skillsNeeded: user.skillsNeeded || [],
    });
  } catch (err) {
    console.error('Session error:', err);
    return sendError(res, 'Failed to fetch session', 500);
  }
};

const sanitizeUser = (u) => {
  const idStr = (u._id || u.id || '').toString();
  return {
    id: idStr,
    _id: idStr,
    email: u.email,
    fullName: u.fullName,
    collegeName: u.collegeName || 'Pranveer Singh Institute of Technology (PSIT), Kanpur',
    department: u.department || 'Computer Science',
    collegeId: u.collegeId || '',
    academicYear: u.academicYear || 1,
    section: u.section || '',
    bio: u.bio || '',
    karmaScore: u.karmaScore || 10,
    isVerified: u.isVerified !== undefined ? u.isVerified : true,
    isProfileComplete: Boolean(u.isProfileComplete),
    skillsOffered: u.skillsOffered || [],
    skillsNeeded: u.skillsNeeded || [],
  };
};

/**
 * POST /api/v1/auth/register
 * Allows any valid normal or personal email address (Gmail, Yahoo, Outlook, student email, etc.).
 * If the user already exists, seamlessly logs them in and updates profile details.
 */
const register = async (req, res) => {
  try {
    const { email, fullName, department, collegeName } = req.body;

    const check = validateInstitutionalEmail(email);
    if (!check.valid) {
      return sendError(res, check.reason, 400);
    }

    const cleanEmail = email.trim().toLowerCase();
    let user = await StoreService.findUserByEmail(cleanEmail);

    if (user) {
      // User exists: update optional details and log them in smoothly
      const updates = {};
      if (fullName && fullName.trim()) updates.fullName = fullName.trim();
      if (collegeName && collegeName.trim()) updates.collegeName = collegeName.trim();
      if (department && department.trim()) updates.department = department.trim();

      if (Object.keys(updates).length > 0) {
        const updated = await StoreService.updateUser(user._id, updates);
        if (updated) user = updated;
      }
    } else {
      // Create new user
      user = await StoreService.createUser({
        firebaseUid: `uid_${Date.now()}`,
        email: cleanEmail,
        fullName: (fullName && fullName.trim()) || cleanEmail.split('@')[0],
        collegeName: (collegeName && collegeName.trim()) || 'Pranveer Singh Institute of Technology (PSIT), Kanpur',
        department: (department && department.trim()) || 'Computer Science',
        karmaScore: 10,
        isVerified: true,
        isProfileComplete: false,
      });
    }

    const safeUser = sanitizeUser(user);
    const token = jwt.sign(
      { uid: safeUser.firebaseUid || user.firebaseUid, email: safeUser.email, id: safeUser.id },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return sendSuccess(res, { token, mockToken: token, user: safeUser }, 'Account authenticated successfully', 200);
  } catch (err) {
    console.error('Register error:', err);
    return sendError(res, 'Registration failed. Please try again.', 500);
  }
};

/**
 * POST /api/v1/auth/login
 * Allows any valid email address. Auto-provisions on first sign-in if not yet registered.
 */
const login = async (req, res) => {
  try {
    const { email } = req.body;

    const check = validateInstitutionalEmail(email);
    if (!check.valid) {
      return sendError(res, check.reason, 400);
    }

    const cleanEmail = email.trim().toLowerCase();
    let user = await StoreService.findUserByEmail(cleanEmail);

    if (!user) {
      // Auto-provision user on login with normal email
      user = await StoreService.createUser({
        firebaseUid: `uid_${Date.now()}`,
        email: cleanEmail,
        fullName: cleanEmail.split('@')[0].replace(/[._]/g, ' '),
        department: 'Computer Science',
        collegeName: 'Pranveer Singh Institute of Technology (PSIT), Kanpur',
        karmaScore: 10,
        isVerified: true,
        isProfileComplete: false,
      });
    }

    const safeUser = sanitizeUser(user);
    const token = jwt.sign(
      { uid: safeUser.firebaseUid || user.firebaseUid, email: safeUser.email, id: safeUser.id },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return sendSuccess(res, { token, mockToken: token, user: safeUser }, 'Logged in successfully');
  } catch (err) {
    console.error('Login error:', err);
    return sendError(res, 'Login failed', 500);
  }
};

module.exports = {
  verifyTokenAndDomain,
  getSession,
  register,
  login,
  sanitizeUser,
};

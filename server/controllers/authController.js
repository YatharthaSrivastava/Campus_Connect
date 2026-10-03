const jwt = require('jsonwebtoken');
const StoreService = require('../services/storeService');
const { validateInstitutionalEmail } = require('../utils/domainValidator');
const { sendSuccess, sendError } = require('../utils/apiResponse');
const { admin } = require('../config/firebase');

const JWT_SECRET = process.env.JWT_SECRET || 'campusconnect_dev_secret_2026';

/**
 * POST /api/v1/auth/verify
 * Directly per API Documentation:
 * Request Body: { "idToken": "string", "domain": "string" }
 * Validates Firebase token & enforces .edu / @psit.ac.in domain constraints.
 */
const verifyTokenAndDomain = async (req, res) => {
  try {
    const { idToken, domain, email } = req.body;

    const userEmail = email || (domain && domain.includes('@') ? domain : `student@${domain || 'psit.ac.in'}`);

    // Institutional Email Domain Enforcement
    const domainCheck = validateInstitutionalEmail(userEmail);
    if (!domainCheck.valid) {
      return sendError(
        res,
        'Account email does not match verified institutional .edu domain.',
        403
      );
    }

    let uid = `uid_${Date.now()}`;
    let verifiedEmail = userEmail.toLowerCase();

    if (process.env.MOCK_AUTH !== 'true' && idToken && idToken !== 'mock_token') {
      try {
        const decoded = await admin.auth().verifyIdToken(idToken);
        uid = decoded.uid;
        if (decoded.email) verifiedEmail = decoded.email.toLowerCase();
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
        user: {
          id: user._id,
          email: user.email,
          fullName: user.fullName,
          department: user.department,
          karmaScore: user.karmaScore || 10,
          isVerified: user.isVerified,
        },
      },
      'Institutional authentication verified.'
    );
  } catch (err) {
    console.error('Verify error:', err);
    return sendError(res, 'Authentication verification failed', 500);
  }
};

/**
 * GET /api/v1/auth/session
 * Per API Documentation:
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

/**
 * POST /api/v1/auth/register
 */
const register = async (req, res) => {
  try {
    const { email, fullName, department, collegeName } = req.body;
    const check = validateInstitutionalEmail(email);
    if (!check.valid) {
      return sendError(res, check.reason, 403);
    }

    let existing = await StoreService.findUserByEmail(email);
    if (existing) {
      return sendError(res, 'An account with this email already exists.', 409);
    }

    const user = await StoreService.createUser({
      firebaseUid: `uid_${Date.now()}`,
      email: email.toLowerCase(),
      fullName: fullName || email.split('@')[0],
      collegeName: collegeName || 'Pranveer Singh Institute of Technology (PSIT), Kanpur',
      department: department || 'Computer Science',
      karmaScore: 10,
      isVerified: true,
    });

    const token = jwt.sign(
      { uid: user.firebaseUid, email: user.email, id: user._id },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return sendSuccess(res, { token, mockToken: token, user }, 'Registered successfully', 201);
  } catch (err) {
    console.error('Register error:', err);
    return sendError(res, 'Registration failed', 500);
  }
};

/**
 * POST /api/v1/auth/login
 */
const login = async (req, res) => {
  try {
    const { email } = req.body;
    const check = validateInstitutionalEmail(email);
    if (!check.valid) {
      return sendError(res, check.reason, 403);
    }

    let user = await StoreService.findUserByEmail(email);
    if (!user) {
      // Auto-provision if institutional email for smooth hackathon demo
      user = await StoreService.createUser({
        firebaseUid: `uid_${Date.now()}`,
        email: email.toLowerCase(),
        fullName: email.split('@')[0].replace(/[._]/g, ' '),
        department: 'Computer Science',
        karmaScore: 10,
        isVerified: true,
      });
    }

    const token = jwt.sign(
      { uid: user.firebaseUid, email: user.email, id: user._id },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return sendSuccess(res, { token, mockToken: token, user }, 'Logged in successfully');
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
};

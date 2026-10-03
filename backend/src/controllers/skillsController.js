const StoreService = require('../services/storeService');
const { sendSuccess, sendError } = require('../utils/apiResponse');

/**
 * GET /api/v1/skills/match
 * Query Params: subjectCode, skillLevel
 * Matches user with peers for 1-on-1 tutoring / code reviews.
 */
const matchSkills = async (req, res) => {
  try {
    const { subjectCode, skillLevel, department } = req.query;

    const peers = await StoreService.searchUsers({
      department,
      skillLevel,
      subjectCode,
    });

    // Exclude current user from matching themselves
    const currentUserId = req.user?._id?.toString();
    const filteredPeers = peers.filter(
      (p) => p._id.toString() !== currentUserId
    );

    return sendSuccess(
      res,
      filteredPeers,
      `Found ${filteredPeers.length} peer mentors ready to collaborate.`
    );
  } catch (err) {
    console.error('matchSkills error:', err);
    return sendError(res, 'Failed to match peer mentors', 500);
  }
};

module.exports = {
  matchSkills,
};

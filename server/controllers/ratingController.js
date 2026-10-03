const StoreService = require('../services/storeService');
const { sendSuccess, sendError } = require('../utils/apiResponse');

/**
 * POST /api/v1/ratings
 * Submits a rating for a peer after an exchange or tutoring session.
 */
const createRating = async (req, res) => {
  try {
    const { transactionId, revieweeId, stars, feedback } = req.body;
    const reviewer = req.user;

    if (!revieweeId) {
      return sendError(res, 'revieweeId is required', 400);
    }

    const starCount = Number(stars);
    if (!starCount || starCount < 1 || starCount > 5) {
      return sendError(res, 'Stars must be an integer between 1 and 5', 400);
    }

    if (reviewer._id.toString() === revieweeId.toString()) {
      return sendError(res, 'You cannot rate yourself', 400);
    }

    const rating = await StoreService.createRating({
      transactionId: transactionId || null,
      reviewerId: reviewer._id,
      reviewerName: reviewer.fullName || 'Verified Peer',
      revieweeId,
      stars: starCount,
      feedback: feedback ? feedback.trim() : '',
    });

    return sendSuccess(
      res,
      rating,
      `Rating submitted! You earned +5 Karma for contributing feedback.`,
      201
    );
  } catch (err) {
    console.error('createRating error:', err);
    return sendError(res, 'Failed to submit rating', 500);
  }
};

/**
 * GET /api/v1/ratings/user/:userId
 * Retrieves ratings and calculated average score for a student.
 */
const getUserRatings = async (req, res) => {
  try {
    const { userId } = req.params;
    const ratings = await StoreService.getRatingsForUser(userId);

    const total = ratings.length;
    const avg = total > 0 ? (ratings.reduce((acc, r) => acc + r.stars, 0) / total).toFixed(1) : '5.0';

    return sendSuccess(res, {
      ratings,
      totalRatings: total,
      averageRating: parseFloat(avg),
    });
  } catch (err) {
    console.error('getUserRatings error:', err);
    return sendError(res, 'Failed to fetch ratings', 500);
  }
};

module.exports = {
  createRating,
  getUserRatings,
};

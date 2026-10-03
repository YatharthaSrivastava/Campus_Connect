const StoreService = require('../services/storeService');
const { sendSuccess, sendError } = require('../utils/apiResponse');

/**
 * GET /api/v1/marketplace
 * Query Params: category, status, page
 * Retrieves active campus gear & textbook listings.
 */
const getMarketplaceListings = async (req, res) => {
  try {
    const { category, status = 'active' } = req.query;
    const listings = await StoreService.getListings({ category, status });
    return sendSuccess(res, listings, 'Active marketplace listings retrieved.');
  } catch (err) {
    console.error('getMarketplaceListings error:', err);
    return sendError(res, 'Failed to fetch marketplace listings', 500);
  }
};

/**
 * POST /api/v1/marketplace
 * Creates a new listing for textbooks, lab coats, or tools.
 * Body: { title, price, type, description, category, condition }
 */
const createListing = async (req, res) => {
  try {
    const { title, price, type, description, category, condition, conditionNotes, images, collegeName } = req.body || {};

    if (!title) {
      return sendError(res, 'Missing required parameters: title is required', 400);
    }

    const resolvedCategory = category || (type === 'gear' ? 'tool' : 'textbook');
    const validCategories = ['textbook', 'lab_coat', 'tool', 'electronics'];
    if (!validCategories.includes(resolvedCategory)) {
      return sendError(
        res,
        `Invalid category. Must be one of: ${validCategories.join(', ')}`,
        400
      );
    }

    const seller = req.user;
    const finalCollege = collegeName || seller.collegeName || 'Pranveer Singh Institute of Technology (PSIT), Kanpur';

    const newListing = await StoreService.createListing({
      sellerId: seller._id,
      sellerName: seller.fullName || 'Verified Student',
      sellerEmail: seller.email,
      title: title.trim(),
      description: description || `Pre-owned ${title} available for campus exchange.`,
      category: resolvedCategory,
      priceOrKarma: Number(price) || 0,
      condition: condition || 'Good',
      conditionNotes: conditionNotes ? conditionNotes.trim() : '',
      collegeName: finalCollege,
      status: 'active',
      images: Array.isArray(images) ? images : images ? [images] : [],
    });

    // Reward seller with +5 Karma for contributing academic gear to the campus network!
    await StoreService.addKarmaEntry({
      userId: seller._id,
      amount: 5,
      title: 'Academic Item Listed',
      description: `Listed "${title}" on the campus marketplace.`,
      category: 'listing',
    });
    if (seller.karmaScore !== undefined) {
      seller.karmaScore = (seller.karmaScore || 10) + 5;
    }

    return sendSuccess(res, newListing, 'Listing created successfully! +5 Karma awarded.', 201);
  } catch (err) {
    console.error('createListing error:', err);
    return sendError(res, 'Failed to create marketplace listing', 500);
  }
};

/**
 * GET /api/v1/marketplace/:id
 */
const getListingDetails = async (req, res) => {
  try {
    const listing = await StoreService.getListingById(req.params.id);
    if (!listing) {
      return sendError(res, 'Requested resource or listing ID does not exist.', 404);
    }
    return sendSuccess(res, listing);
  } catch (err) {
    return sendError(res, 'Failed to fetch listing', 500);
  }
};

module.exports = {
  getMarketplaceListings,
  createListing,
  getListingDetails,
};

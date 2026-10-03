const express = require('express');
const router = express.Router();
const {
  getMarketplaceListings,
  createListing,
  getListingDetails,
} = require('../controllers/marketplaceController');
const { authenticate, optionalAuth } = require('../middlewares/authMiddleware');

// GET /marketplace or /marketplace/items - Retrieves active campus gear & textbook listings
router.get('/', optionalAuth, getMarketplaceListings);
router.get('/items', optionalAuth, getMarketplaceListings);

// POST /marketplace - Creates a new listing for textbooks, lab coats, or tools
router.post('/', authenticate, createListing);

// GET /marketplace/:id - Listing detail
router.get('/:id', optionalAuth, getListingDetails);

module.exports = router;

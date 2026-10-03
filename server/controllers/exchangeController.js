const StoreService = require('../services/storeService');
const CryptoService = require('../services/cryptoService');
const { sendSuccess, sendError } = require('../utils/apiResponse');

/**
 * POST /api/v1/exchange/initiate
 * Starts transaction handshake and generates secure OTP + Ephemeral QR Payload.
 * Payload: { "listingId": "string", "buyerId": "string" }
 */
const initiateExchange = async (req, res) => {
  try {
    const { listingId, buyerId } = req.body;

    if (!listingId) {
      return sendError(res, 'Missing required parameter: listingId', 400);
    }

    const listing = await StoreService.getListingById(listingId);
    if (!listing) {
      return sendError(res, 'Requested resource or listing ID does not exist.', 404);
    }

    const resolvedBuyerId = buyerId || req.user?._id;
    const sellerId = listing.sellerId;

    // 1. Generate dynamic 6-digit CSPRNG numeric code
    const otp = CryptoService.generateOTP();

    // 2. Hash OTP with SHA-256 for secure storage
    const otpHash = CryptoService.hashOTP(otp);

    // 3. Persist pending transaction
    const transaction = await StoreService.createTransaction({
      listingId: listing._id,
      buyerId: resolvedBuyerId,
      sellerId,
      otpHash,
      status: 'pending',
    });

    // 4. Generate Ephemeral QR Code payload JWT (15-min TTL)
    const qrPayload = CryptoService.generateQRPayload({
      transactionId: transaction._id,
      buyerId: resolvedBuyerId,
      sellerId,
      otp,
    });

    return sendSuccess(
      res,
      {
        transactionId: transaction._id,
        listingId: listing._id,
        listingTitle: listing.title,
        priceOrKarma: listing.priceOrKarma,
        sellerId,
        buyerId: resolvedBuyerId,
        // The OTP is revealed to the seller to show/share at meetup
        otp,
        // Ephemeral signed JWT for QR code scanning
        qrPayload,
        expiresInSeconds: 900, // 15-minute TTL
      },
      'Exchange initiated. OTP & QR handshake generated.',
      201
    );
  } catch (err) {
    console.error('initiateExchange error:', err);
    return sendError(res, 'Failed to initiate exchange', 500);
  }
};

/**
 * POST /api/v1/exchange/verify
 * Physical meetup verification via OTP or QR.
 * Payload: { "transactionId": "string", "otp": "string" }
 */
const verifyExchange = async (req, res) => {
  try {
    const { transactionId, otp, qrPayload } = req.body;

    if (!transactionId) {
      return sendError(res, 'transactionId is required', 400);
    }

    const tx = await StoreService.findTransactionById(transactionId);
    if (!tx) {
      return sendError(res, 'Transaction not found or expired', 404);
    }

    if (tx.status === 'completed') {
      return sendError(res, 'Transaction is already completed', 400);
    }

    let submittedOTP = otp;
    if (!submittedOTP && qrPayload) {
      const decodedQR = CryptoService.verifyQRPayload(qrPayload);
      if (!decodedQR || decodedQR.transactionId !== transactionId) {
        return sendError(res, 'Invalid or expired QR code', 401);
      }
      submittedOTP = decodedQR.otp;
    }

    if (!submittedOTP) {
      return sendError(res, 'Missing OTP or QR code', 400);
    }

    // Constant-time hash equality check
    const isValid = CryptoService.verifyOTPHash(submittedOTP, tx.otpHash);
    if (!isValid) {
      tx.failedAttempts = (tx.failedAttempts || 0) + 1;
      if (tx.failedAttempts >= 5) {
        return sendError(
          res,
          'Too many failed attempts. Handshake locked for security.',
          429
        );
      }
      return sendError(res, 'Invalid verification OTP code.', 400);
    }

    // Complete transaction & award Karma (+15 to both student accounts)
    const completedTx = await StoreService.completeTransaction(
      transactionId,
      tx.buyerId,
      tx.sellerId,
      15
    );

    return sendSuccess(
      res,
      {
        transactionId: completedTx._id,
        status: 'completed',
        karmaAwarded: 15,
        completedAt: completedTx.completedAt,
      },
      'Handshake verified! Transfer complete and Campus Karma awarded.'
    );
  } catch (err) {
    console.error('verifyExchange error:', err);
    return sendError(res, 'Verification failed', 500);
  }
};

module.exports = {
  initiateExchange,
  verifyExchange,
};

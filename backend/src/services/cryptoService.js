const crypto = require('crypto');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'campusconnect_dev_secret_2026';

const CryptoService = {
  /**
   * Generate dynamic 6-digit numeric OTP using CSPRNG
   */
  generateOTP() {
    return crypto.randomInt(100000, 999999).toString();
  },

  /**
   * Compute SHA-256 hash of OTP for secure storage
   */
  hashOTP(otp) {
    return crypto.createHash('sha256').update(otp.toString().trim()).digest('hex');
  },

  /**
   * Compare submitted OTP with stored hash using constant-time equality
   * to strictly mitigate timing attacks.
   */
  verifyOTPHash(submittedOTP, storedHash) {
    if (!submittedOTP || !storedHash) return false;
    try {
      const computedHash = this.hashOTP(submittedOTP);
      const computedBuf = Buffer.from(computedHash, 'utf8');
      const storedBuf = Buffer.from(storedHash, 'utf8');

      if (computedBuf.length !== storedBuf.length) return false;
      return crypto.timingSafeEqual(computedBuf, storedBuf);
    } catch (e) {
      console.error('Error during timingSafeEqual OTP verification:', e);
      return false;
    }
  },

  /**
   * Generate an encrypted ephemeral QR payload JWT
   */
  generateQRPayload({ transactionId, buyerId, sellerId, otp }) {
    return jwt.sign(
      {
        transactionId,
        buyerId,
        sellerId,
        otp,
        iat: Math.floor(Date.now() / 1000),
      },
      JWT_SECRET,
      { expiresIn: '15m' } // 15-minute expiration matching TTL
    );
  },

  /**
   * Verify and decode ephemeral QR JWT
   */
  verifyQRPayload(qrJwt) {
    try {
      return jwt.verify(qrJwt, JWT_SECRET);
    } catch {
      return null;
    }
  },
};

module.exports = CryptoService;

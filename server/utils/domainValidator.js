/**
 * Domain Validator Utility
 * In open-access mode (STRICT_DOMAIN=false), all valid emails are accepted.
 * When STRICT_DOMAIN=true, only institutional domains are enforced.
 */

const ALLOWED_DOMAINS = (process.env.ALLOWED_DOMAINS || 'psit.ac.in')
  .split(',')
  .map((d) => d.trim().toLowerCase());

const STRICT_DOMAIN = process.env.STRICT_DOMAIN === 'true';

const validateInstitutionalEmail = (email) => {
  if (!email || typeof email !== 'string') {
    return { valid: false, domain: null, reason: 'Email is required' };
  }

  const normalized = email.trim().toLowerCase();

  // Basic email format check
  const emailRegex = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(normalized)) {
    return { valid: false, domain: null, reason: 'Invalid email format' };
  }

  const parts = normalized.split('@');
  if (parts.length !== 2) {
    return { valid: false, domain: null, reason: 'Invalid email format' };
  }

  const domain = parts[1];

  // In open-access mode, accept any valid email
  if (!STRICT_DOMAIN) {
    return { valid: true, domain };
  }

  // Strict institutional domain enforcement
  const isAllowed = ALLOWED_DOMAINS.some(
    (allowedDomain) =>
      domain === allowedDomain || domain.endsWith(`.${allowedDomain}`)
  );

  if (!isAllowed) {
    return {
      valid: false,
      domain,
      reason: `Only institutional email addresses are allowed (${ALLOWED_DOMAINS.join(', ')})`,
    };
  }

  return { valid: true, domain };
};

const extractDomain = (email) => {
  if (!email || !email.includes('@')) return null;
  return email.split('@')[1]?.toLowerCase() || null;
};

module.exports = { validateInstitutionalEmail, extractDomain, ALLOWED_DOMAINS };

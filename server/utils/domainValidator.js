/**
 * Domain Validator Utility
 * Accepts any standard email address (Gmail, Yahoo, Outlook, college domains, etc.)
 * No institutional email restriction required.
 */

const validateInstitutionalEmail = (email) => {
  if (!email || typeof email !== 'string') {
    return { valid: false, domain: null, reason: 'Email is required' };
  }

  const normalized = email.trim().toLowerCase();

  // Standard email format check accepting all regular email domains
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(normalized)) {
    return { valid: false, domain: null, reason: 'Invalid email format. Please enter a valid email address.' };
  }

  const domain = normalized.split('@')[1];
  return { valid: true, domain };
};

const extractDomain = (email) => {
  if (!email || !email.includes('@')) return null;
  return email.split('@')[1]?.toLowerCase().trim() || null;
};

module.exports = { validateInstitutionalEmail, extractDomain };

/**
 * Validates whether a string is a valid Tanzanian mobile phone number.
 * Supported formats:
 * - Local: 07XXXXXXXX or 06XXXXXXXX (10 digits)
 * - International: +2557XXXXXXXX, +2556XXXXXXXX, 2557XXXXXXXX, or 2556XXXXXXXX (12-13 digits)
 * - Plain: 7XXXXXXXX or 6XXXXXXXX (9 digits)
 * @param {string} phone - The phone number string to validate
 * @returns {boolean} True if valid, false otherwise
 */
export function validatePhone(phone) {
  if (typeof phone !== 'string') return false;
  
  // Strip whitespace, hyphens, and brackets
  const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
  
  // Regex checks for optional +255, 255, or 0 prefix,
  // followed by 6 or 7, and exactly 8 digits.
  const regex = /^(\+?255|0)?([67]\d{8})$/;
  return regex.test(cleanPhone);
}

/**
 * Normalizes a Tanzanian mobile phone number to international E.164 format (+2557XXXXXXXX or +2556XXXXXXXX).
 * @param {string} phone - The phone number string to normalize
 * @returns {string|null} The normalized phone number or null if invalid
 */
export function normalizePhone(phone) {
  if (typeof phone !== 'string') return null;
  
  // Strip whitespace, hyphens, and brackets
  const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
  
  const regex = /^(\+?255|0)?([67]\d{8})$/;
  const match = cleanPhone.match(regex);
  
  if (!match) return null;
  
  // match[2] captures the core 9 digits (e.g. 7XXXXXXXX or 6XXXXXXXX)
  return `+255${match[2]}`;
}

/**
 * Validates a Tanzanian phone number format.
 * Matches local formats (07XXXXXXXX, 06XXXXXXXX) or +255 formats (+2557XXXXXXXX, +2556XXXXXXXX).
 */
export function validatePhone(value) {
  if (!value) return false;
  const clean = value.replace(/\s+/g, '').replace(/[-\(\)]/g, '');
  const phoneRegex = /^(\+255|255|0)[67][0-9]{8}$/;
  return phoneRegex.test(clean);
}

/**
 * Normalizes Tanzanian phone numbers to the E.164 standard (+2557XXXXXXXX / +2556XXXXXXXX).
 */
export function normalizePhone(value) {
  if (!value) return '';
  const clean = value.replace(/\s+/g, '').replace(/[-\(\)]/g, '');
  if (clean.startsWith('+255')) return clean;
  if (clean.startsWith('255')) return '+' + clean;
  if (clean.startsWith('0')) return '+255' + clean.slice(1);
  return clean;
}

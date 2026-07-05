/**
 * Formats a numeric price amount into Tanzanian Shillings (TZS) display format.
 * Example: 80000 -> "TZS 80,000"
 * @param {number} amount - The numeric price in TZS
 * @returns {string} The formatted price string
 */
export function formatTZS(amount) {
  if (typeof amount !== 'number' || isNaN(amount)) {
    return 'TZS 0';
  }
  return `TZS ${Math.round(amount).toLocaleString('en-US')}`;
}

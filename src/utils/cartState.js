/**
 * In-memory Cart State module.
 * 
 * NOTE: This module keeps all cart items strictly in memory.
 * Persistent mechanisms (like localStorage, sessionStorage, cookies, or database queries)
 * are intentionally omitted in this presentation mockup stage.
 * 
 * In later stages, backend validation will serve as the single source of truth for
 * product catalogs, prices, shipping fees, and cart validations.
 */

let cart = [];
const subscribers = new Set();

/**
 * Notify all subscribers of a change in the cart state.
 */
function notify() {
  subscribers.forEach(callback => callback(getCart()));
}

/**
 * Returns a copy of the current cart items.
 * Each item contains: { product: Object, quantity: Number }
 */
export function getCart() {
  return cart.map(item => ({ ...item }));
}

/**
 * Adds a product to the cart. If it already exists, increments quantity.
 * @param {Object} product - The product to add
 */
export function addToCart(product) {
  const existing = cart.find(item => item.product.id === product.id);
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ product, quantity: 1 });
  }
  notify();
}

/**
 * Updates the quantity of a product in the cart.
 * If the quantity becomes less than or equal to 0, the item is removed.
 * @param {number} productId - The ID of the product
 * @param {number} quantity - The new quantity
 */
export function updateQuantity(productId, quantity) {
  const index = cart.findIndex(item => item.product.id === productId);
  if (index !== -1) {
    if (quantity <= 0) {
      cart.splice(index, 1);
    } else {
      cart[index].quantity = quantity;
    }
    notify();
  }
}

/**
 * Removes a product completely from the cart.
 * @param {number} productId - The ID of the product to remove
 */
export function removeFromCart(productId) {
  cart = cart.filter(item => item.product.id !== productId);
  notify();
}

/**
 * Clears all items in the cart.
 */
export function clearCart() {
  cart = [];
  notify();
}

/**
 * Returns the total count of items in the cart (sum of quantities).
 * @returns {number} The total count of products
 */
export function getCartCount() {
  return cart.reduce((total, item) => total + item.quantity, 0);
}

/**
 * Returns the estimated subtotal of all items in the cart.
 * @returns {number} The subtotal in TZS
 */
export function getCartTotal() {
  return cart.reduce((total, item) => total + (item.product.price * item.quantity), 0);
}

/**
 * Subscribes a callback to cart change events.
 * @param {Function} callback - The callback to execute when the cart changes
 * @returns {Function} An unsubscribe function
 */
export function onCartChange(callback) {
  subscribers.add(callback);
  // Initial fire
  callback(getCart());
  return () => {
    subscribers.delete(callback);
  };
}

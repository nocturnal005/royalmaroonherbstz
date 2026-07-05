# Stage 6 Cart & Checkout UI Implementation Notes

This document logs the layout designs, boundaries, in-memory state architecture, and validation methods implemented for **Stage 6: Cart & Checkout UI**.

---

## 🛠️ In-Memory Cart State (`cartState.js`)

To prevent unauthorized storage or premature local caching before the backend API is established, the cart state is held **strictly in-memory** within the application context:
* **No `localStorage` or `sessionStorage`**: If the customer refreshes the browser, the cart is reset. This prevents stale cart states and aligns with the mock-first presentation pattern.
* **Subscription Model**: The state implements an event subscription registry (`onCartChange(callback)`), allowing components like the navigation header (badge count) and the Cart Drawer (items lists) to stay synchronized.
* **Backend Boundary**: In future stages, the backend database will serve as the single source of truth for checking product catalog stock, price validation, and coupon applications.

---

## 🛒 Cart Drawer Layout (`CartDrawer.js`)

A sliding side-panel handles the shopping cart presentation:
* **Features**: Displays each selected product, name, thumbnail image, formatted price (TZS), increment/decrement triggers, and a Remove button.
* **Safety Copy**: Displayed subtotal is labeled as **"Estimated Subtotal"** with a visible note: *"Final totals confirmed securely at checkout."*
* **Accessibility**: Implements keyboard focus trapping (cycling within the drawer buttons) and handles Escape closure. Focus is returned to the triggering cart header button upon closing.

---

## 📋 Checkout Wizard (`CheckoutWizard.js`)

The checkout process is presented step-by-step in a central overlay modal as a 5-step preview flow:
* **Step 1: Customer Details**:
  * Fields: Full Name, Email, Mobile Number, and Delivery Notes.
  * Validation: Uses `validatePhone()` on the input's `input` event to validate the number inline. Normalizes the valid output E.164 representation (`+2557XXXXXXXX` or `+2556XXXXXXXX`) dynamically.
  * Inline Messages: Renders status text below the input field (e.g. `✓ Valid phone. Normalizes to: +255...` in green or `✗ Invalid format...` in red) rather than disrupting browser popups.
* **Step 2: Delivery Region**:
  * Dropdown selector displaying regions from `tanzaniaRegions.js`.
  * Selection triggers an estimate container listing the shipping fee (e.g. `10,000 TZS`) and timeline (e.g. `2-3 Business Days`).
* **Step 3: Payment Method**:
  * Displays mobile money options (Vodacom M-Pesa, Tigo Pesa, Airtel Money) and Card payment (via Selcom Checkout) as a secondary fallback.
  * Displays warnings advising users **not to enter real payment data**.
* **Step 4: Review**:
  * Displays items, estimated subtotal, estimated shipping fee, and estimated grand total.
  * Displays customer name, phone, email, delivery region, notes, and selected payment method for review.
  * Action button: **"Continue to Payment Preview"** (avoiding terms like "submit order" or "pay now").
* **Step 5: Payment Status Preview**:
  * Displays three static tabs to preview simulated payment states:
    1. **Pending Preview**: Displays prompt info stating that in production, a mobile money approval prompt would be sent to the customer's phone.
    2. **Success Preview**: Simulates checkout success confirmation.
    3. **Failure Preview**: Simulates payment timeout or rejection screens.

---

## 🔒 Intentionally Not Implemented (Boundaries)

The following functions are strictly excluded in Stage 6 to preserve the frontend boundary:
1. **No Checkout Submissions**: Clicking "Close Checkout Preview" simply clears the in-memory cart and closes the modal. No API calls, REST payloads, or forms are submitted.
2. **No Order/Transaction ID Generation**: No mock transaction codes or order IDs are created. These will be generated uniquely by the backend database.
3. **No Payment Polling**: The Pending screen is a static preview and does not poll any APIs.
4. **No Stock Deduction**: Product stock counts are unmodified.
5. **No Local/Session Storage Persistence**: Cart state remains purely in-memory.
6. **No Selcom API Connection**: Payment options are display-only.

---

## 📋 Safety copy configurations

* **"Estimated subtotal"**, **"Estimated delivery fee"**, **"Estimated total"** labels are applied throughout the drawer and checkout wizard.
* Clear visual notification warnings stating: *"This is a frontend checkout preview only. Do not enter real payment information. Final totals, order creation, and payment confirmation will be handled securely by the backend in a later stage."*
* Pricing is clearly marked as: *"All prices displayed are placeholder/mock figures pending commercial approval."*

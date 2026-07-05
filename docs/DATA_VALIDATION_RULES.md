# Data Validation Rules

This document outlines the validation rules, data types, formatting constraints, and error codes for all data processed by the backend.

---

## 📞 Customer & Delivery Validation Rules

### 1. Customer Name
- **Field**: `customerName`
- **Type**: String
- **Length**: 2 to 100 characters.
- **Constraints**: Must contain only alphabetic characters, spaces, hyphens, and apostrophes. Cannot be blank.
- **Error Code**: `INVALID_CUSTOMER_NAME`

### 2. Customer Email
- **Field**: `customerEmail`
- **Type**: String
- **Format**: RFC 5322 Email Format.
- **Regex**: `^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$`
- **Error Code**: `INVALID_EMAIL_FORMAT`

### 3. Tanzanian Mobile Phone Number
- **Field**: `customerPhone`
- **Type**: String
- **Regex**: Matches Tanzanian carrier prefixes (Vodacom, Tigo, Airtel, Halotel, Zantel).
  - Local format: `^(0[67])[0-9]{8}$` (e.g. `0712345678`, `0687654321`)
  - International format: `^\+255[67][0-9]{8}$` (e.g. `+255712345678`, `+255687654321`)
- **Normalization (Backend Source of Truth)**:
  - All phone numbers must be normalized to E.164 international format: `+2557XXXXXXXX` or `+2556XXXXXXXX`.
  - The normalization strip logic:
    ```js
    function normalizePhone(value) {
      const clean = value.replace(/\s+/g, '').replace(/[-\(\)]/g, '');
      if (clean.startsWith('+255')) return clean;
      if (clean.startsWith('255')) return '+' + clean;
      if (clean.startsWith('0')) return '+255' + clean.slice(1);
      return clean;
    }
    ```
- **Error Code**: `INVALID_PHONE_FORMAT`

### 4. Delivery Notes
- **Field**: `deliveryNotes`
- **Type**: String (Optional)
- **Length**: Maximum 500 characters.
- **Sanitization**: All inputs must be HTML-escaped on output rendering to protect against Cross-Site Scripting (XSS).
- **Error Code**: `DELIVERY_NOTES_TOO_LONG`

### 5. Delivery Region
- **Field**: `deliveryRegion`
- **Type**: String
- **Constraints**: Must match one of the static IDs defined in `tanzaniaRegions.js` (e.g. `dar`, `arusha`, `dodoma`).
- **Error Code**: `INVALID_REGION`

---

## 💰 Money & Price Validation Rules

### 1. Integer Tanzanian Shillings (TZS)
- **Fields**: `price`, `unitPrice`, `subtotal`, `shippingFee`, `total`, `amount`
- **Type**: Integer
- **Constraints**: 
  - Must be a non-negative integer value representing the full shilling amount (e.g., `12000` for 12,000 TZS). 
  - Decimal values are **not allowed** (Tanzanian Shilling transactions do not utilize cents/cents equivalents in standard e-commerce flows).
- **Error Code**: `INVALID_MONEY_VALUE`

### 2. Frontend Untrusted Input Rule
- **Rule**: The frontend is considered an untrusted environment. Cart subtotals, shipping fees, and grand totals submitted by the frontend **must be discarded**.
- **Enforcement**: The backend must lookup database prices for each `productId`, fetch the shipping fee based on the validated `deliveryRegion`, and calculate subtotals, shipping fees, and final grand totals.
- **Error Code**: `CART_TOTAL_MISMATCH` (if frontend calculations vary significantly for logging/audit purposes, though backend calculations override).

---

## 🌿 Product Compliance Validation Rules

To comply with regional herbal and wellness requirements established in Stage 5, products must contain detailed warning labels and cannot make unauthorized therapeutic claims.

### 1. Required Compliance Properties
The product schema must include the following properties:
- `fullIngredients`: Array of strings. Must be non-empty.
- `usageInstructions`: String. Must be non-empty.
- `servingGuidance`: String. Must be non-empty (avoiding term "dosage").
- `warnings`: Array of strings. Must be non-empty.
- `contraindications`: Array of strings. Must be non-empty.
- `allergyWarning`: String. Must be non-empty.
- `storageInstructions`: String. Must be non-empty.
- `healthDisclaimer`: String. Must be non-empty.
- `suitableFor`: Array of strings. Must be non-empty.
- `notSuitableFor`: Array of strings. Must be non-empty.

### 2. Admin Publishing Rules
- **Rule**: A product **must not be publishable** (`isPublished: true`) unless all required compliance fields listed above are present and non-empty.
- **Fallback Content**: If a specific warning or contraindication is not applicable to the product (e.g. a simple chamomile tea with no known contraindications), the administrator must explicitly type `"None"` or `"Not Applicable"` rather than leaving the field blank.
- **Error Code**: `COMPLIANCE_FIELDS_MISSING`

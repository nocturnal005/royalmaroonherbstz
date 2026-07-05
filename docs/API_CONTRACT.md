# Backend API Contract

This document specifies the backend API endpoints, HTTP request/response schemas, validation rules, error handling, status code conventions, and idempotency guarantees for Nature's Alchemy.

---

## 🚦 HTTP Status Code Conventions

The backend utilizes standard HTTP status codes:
- **`200 OK`**: Successful read or update operation.
- **`201 Created`**: Successful creation of a resource (e.g. order, product, checkout session).
- **`202 Accepted`**: Async operation accepted (e.g., payment initiation accepted for mobile network prompt).
- **`400 Bad Request`**: Request has malformed syntax or validation failures.
- **`401 Unauthorized`**: Request lacks valid authentication credentials.
- **`403 Forbidden`**: Authenticated user lacks permission to access the resource (e.g., non-admin calling `/api/admin/*`).
- **`404 Not Found`**: Request target resource could not be found.
- **`409 Conflict`**: Conflict in state (e.g., duplicate idempotency key, out-of-stock item, or already paid event).
- **`422 Unprocessable Entity`**: Request body is syntactically correct but semantically invalid (e.g., invalid phone validation prefix or region details).
- **`429 Too Many Requests`**: Rate limit exceeded for the client.
- **`500 Internal Server Error`**: Sanitized error response for unexpected database or system crashes. Stack traces and database errors are masked.

---

## 🔒 Idempotency Architecture

To prevent duplicate charges, double orders, or redundant database operations, the following endpoints require idempotency guarantees:
- **Header**: Requests to checkout, payment, or retries should supply an `Idempotency-Key` UUID.
- **Checkout Session (`POST /api/checkout/session`)**: Sending the same `Idempotency-Key` will return the existing checkout session details rather than creating a new draft order or session.
- **Payment Initiation (`POST /api/payments/initiate`)**: A duplicate initiation request with the same `Idempotency-Key` returns the existing payment transaction state. It does not spawn a new push notification attempt.
- **Payment Retry**: Retrying a payment due to network timeouts should pass the original backend-generated `paymentReference` or `orderId` to ensure the gateway reuses the existing reference.
- **Selcom Webhook (`POST /api/webhooks/selcom`)**: The webhook receiver must track Selcom transaction IDs (`transid`) to ensure duplicate events do not update order state or trigger double fulfilment processes.

---

## 📝 Audit Trail Requirements

Every state mutation and sensitive transaction must be logged:
- **Authentication**: Admin login/logout, failed login attempts.
- **Catalogue Changes**: Product creation, updates, deletion, publishing, and unpublishing actions.
- **Pricing & Inventory**: Any changes to product prices or stock status adjustments.
- **Order & Payments**: Checkout session creation, payment initiation request, webhook receipt, payment status transitions (`AwaitingPayment` -> `Paid`/`PaymentFailed`), fulfilment dispatches, and refunds.
- **Log Properties**: Timestamp, operator/user ID, resource ID, action type, IP address, and changed fields.

---

## 📁 Route Groups & Endpoints

### 1. Product Catalogue API
Endpoints to fetch compliant wellness product listings.

#### `GET /api/products`
- **Description**: Returns all published, compliant products.
- **Response `200 OK`**:
```json
{
  "success": true,
  "data": [
    {
      "id": "winter-harvest-infusion",
      "name": "Winter Harvest Infusion",
      "category": "Seasonal Wellness Blend",
      "format": "Herbal Tea Bags",
      "concern": "Relaxation & Evening Rituals",
      "price": 12000,
      "currency": "TZS",
      "image": "/images/winter_harvest.png",
      "imageAlt": "Box of Winter Harvest Infusion herbal tea bags",
      "shortDescription": "A comforting evening blend containing organic hibiscus and ginger.",
      "keyIngredients": ["Hibiscus", "Ginger", "Lemongrass"],
      "fullIngredients": ["Organic Hibiscus flowers", "Organic Ginger root", "Organic Lemongrass leaves"],
      "usageInstructions": "Steep 1 tea bag in 250ml of boiling water for 5-7 minutes.",
      "servingGuidance": "Enjoy 1-2 cups in the evening.",
      "warnings": [
        "Consult a qualified healthcare professional before use if you are managing a health condition or taking medication."
      ],
      "contraindications": [
        "Do not use if pregnant or nursing without consulting a doctor."
      ],
      "allergyWarning": "Processed in a facility that handles tree nuts.",
      "storageInstructions": "Store in a cool, dry place away from direct sunlight.",
      "healthDisclaimer": "This product is not intended to diagnose, treat, cure, or prevent any disease.",
      "suitableFor": ["Adults"],
      "notSuitableFor": ["Infants", "Pregnant women"],
      "stockStatus": "in_stock",
      "isPublished": true,
      "createdAt": "2026-06-26T21:00:00Z",
      "updatedAt": "2026-06-26T21:00:00Z"
    }
  ]
}
```

#### `GET /api/products/:id`
- **Description**: Returns details for a single product.
- **Response `200 OK`**: (Single product object wrapped in `"data"`, same fields as above).

---

### 2. Cart Validation API
Recalculates cart values based on backend source of truth (untrusted frontend).

#### `POST /api/cart/validate`
- **Description**: Checks stock availability and returns calculated totals.
- **Request Body**:
```json
{
  "items": [
    {
      "productId": "winter-harvest-infusion",
      "quantity": 2
    }
  ],
  "deliveryRegion": "dar"
}
```
- **Response `200 OK`**:
```json
{
  "success": true,
  "data": {
    "validatedItems": [
      {
        "productId": "winter-harvest-infusion",
        "name": "Winter Harvest Infusion",
        "unitPrice": 12000,
        "quantity": 2,
        "itemTotal": 24000,
        "stockStatus": "in_stock",
        "availableQuantity": 25
      }
    ],
    "subtotal": 24000,
    "shippingFee": 5000,
    "estimatedTotal": 29000,
    "unavailableItems": [],
    "warnings": []
  }
}
```

---

### 3. Shipping Estimate API
Provides official region shipping calculations.

#### `POST /api/shipping/estimate`
- **Description**: Calculates shipping fees and delivery timelines.
- **Request Body**:
```json
{
  "deliveryRegion": "arusha"
}
```
- **Response `200 OK`**:
```json
{
  "success": true,
  "data": {
    "deliveryRegion": "arusha",
    "regionName": "Arusha",
    "shippingFee": 10000,
    "estimatedDays": "2-3 Business Days"
  }
}
```

---

### 4. Checkout Session API
Creates a temporary checkout draft session.

#### `POST /api/checkout/session`
- **Headers**: Requires `Idempotency-Key: <UUID>`
- **Request Body**:
```json
{
  "customerName": "Juma Kassim",
  "customerPhone": "+255712345678",
  "customerEmail": "juma@domain.tz",
  "deliveryNotes": "Blue gate next to the school",
  "deliveryRegion": "dar",
  "paymentMethod": "mpesa",
  "items": [
    {
      "productId": "winter-harvest-infusion",
      "quantity": 2
    }
  ]
}
```
- **Response `201 Created`**:
```json
{
  "success": true,
  "data": {
    "checkoutSessionId": "sess_892f3b90a82e41",
    "orderDraftReference": "ord_2026_9831a2",
    "validatedTotals": {
      "subtotal": 24000,
      "shippingFee": 5000,
      "estimatedTotal": 29000
    },
    "allowedNextActions": [
      {
        "action": "INITIATE_PAYMENT",
        "method": "POST",
        "href": "/api/payments/initiate"
      }
    ]
  }
}
```

---

### 5. Order Creation & Tracking API
Tracks the lifecycle of orders.

#### `GET /api/orders/:id`
- **Description**: Tracks order lifecycle state (Public access).
- **Response `200 OK`**:
```json
{
  "success": true,
  "data": {
    "orderId": "ord_2026_9831a2",
    "customer": {
      "name": "Juma Kassim",
      "phone": "+255712345678",
      "email": "juma@domain.tz"
    },
    "deliveryRegion": "dar",
    "shippingFee": 5000,
    "total": 29000,
    "paymentMethod": "mpesa",
    "orderStatus": "AwaitingPayment",
    "paymentStatus": "AwaitingPayment",
    "fulfilmentStatus": "Pending",
    "items": [
      {
        "productId": "winter-harvest-infusion",
        "name": "Winter Harvest Infusion",
        "quantity": 2,
        "unitPrice": 12000
      }
    ],
    "createdAt": "2026-06-26T21:10:00Z",
    "updatedAt": "2026-06-26T21:10:00Z"
  }
}
```

---

### 6. Payment Initiation API
Triggers Selcom mobile money or gateway session.

#### `POST /api/payments/initiate`
- **Headers**: Requires `Idempotency-Key: <UUID>`
- **Request Body**:
```json
{
  "checkoutSessionId": "sess_892f3b90a82e41",
  "paymentMethod": "mpesa",
  "amount": 29000,
  "customerPhone": "+255712345678"
}
```
- **Response `202 Accepted`**:
```json
{
  "success": true,
  "data": {
    "paymentReference": "pay_ref_88203d9d7",
    "paymentStatus": "pending",
    "customerMessage": "Payment initiation accepted. If supported, the customer will receive a mobile money approval prompt."
  }
}
```

---

### 7. Payment Status API
Queries the current state of a payment.

#### `GET /api/payments/status/:reference`
- **Description**: Frontend polls this endpoint to update state.
- **Response `200 OK`**:
```json
{
  "success": true,
  "data": {
    "paymentReference": "pay_ref_88203d9d7",
    "paymentStatus": "success",
    "customerMessage": "Payment confirmed successfully."
  }
}
```

---

### 8. Selcom Webhook API
Receives transaction notifications from Selcom.

#### `POST /api/webhooks/selcom`
- **Headers**: Includes digital signature headers (e.g. `Authorization` or `X-Selcom-Signature`).
- **Request Body (Placeholder)**:
```json
{
  "transid": "selcom_trans_8829103",
  "utilityref": "pay_ref_88203d9d7",
  "amount": 29000,
  "msisdn": "255712345678",
  "state": "SUCCESS",
  "responsecode": "00"
}
```
- **Response `200 OK`**:
```json
{
  "success": true,
  "message": "Webhook receipt acknowledged"
}
```

---

### 9. Admin Product Management API
Allows admins to create, edit, and publish products.

#### `POST /api/admin/products`
- **Description**: Create or edit products. Product compliance validator is triggered on publish.
- **Request Body (Publish attempt missing warnings)**:
```json
{
  "id": "digestive-comfort-blend",
  "name": "Digestive Comfort Blend",
  "category": "Digestive Comfort Blend",
  "format": "Herbal Tea Bags",
  "concern": "Digestion",
  "price": 11000,
  "currency": "TZS",
  "image": "/images/digestive.png",
  "isPublished": true,
  "fullIngredients": ["Peppermint leaves"],
  "usageInstructions": "Steep 1 bag.",
  "servingGuidance": "Drink after meals.",
  "warnings": []
}
```
- **Response `400 Bad Request`**:
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Product publish failed: Required compliance field 'warnings' must be present and non-empty. Use 'None' or 'Not Applicable' if zero warnings exist.",
    "details": [
      {
        "field": "warnings",
        "issue": "Field must contain at least one warnings entry."
      }
    ]
  }
}
```

---

### 10. Admin Order Management API
Administrative controls for orders.

#### `PUT /api/admin/orders/:id/status`
- **Description**: Update fulfilment or payment status.
- **Request Body**:
```json
{
  "fulfilmentStatus": "Dispatched"
}
```
- **Response `200 OK`**:
```json
{
  "success": true,
  "data": {
    "orderId": "ord_2026_9831a2",
    "fulfilmentStatus": "Dispatched",
    "updatedAt": "2026-06-26T22:00:00Z"
  }
}
```

---

### 11. Authentication/Session API
Admin secure sessions.

#### `POST /api/auth/login`
- **Request Body**:
```json
{
  "username": "admin_user",
  "password": "secure_admin_password_123"
}
```
- **Response `200 OK`**:
```json
{
  "success": true,
  "token": "jwt_token_header_payload_signature"
}
```

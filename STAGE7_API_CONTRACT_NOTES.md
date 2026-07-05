# Stage 7 API Contract & Schemas Implementation Notes

This document logs the details of the backend API contract, JSON schema files, security bounds, and payment gateway specifications designed for **Stage 7: Backend API Contract & Schemas**.

---

## 📂 Files Created

### 1. Documentation Layer (`docs/`)
- [docs/API_CONTRACT.md](file:///d:/RM_Tanzania/docs/API_CONTRACT.md): Outline of API endpoints, request/response JSON examples, error types, HTTP status conventions, audit trail logging, and idempotency guarantees.
- [docs/SECURITY_BOUNDARIES.md](file:///d:/RM_Tanzania/docs/SECURITY_BOUNDARIES.md): Core system boundaries including backend-only secrets, database isolation, CORS origin whitelist, route-based rate limits, error sanitization, and administrative RBAC.
- [docs/SELCOM_INTEGRATION_CONTRACT.md](file:///d:/RM_Tanzania/docs/SELCOM_INTEGRATION_CONTRACT.md): Integration protocols for Selcom Checkout/USSD prompt payments, retry references, and signature verification.
- [docs/DATA_VALIDATION_RULES.md](file:///d:/RM_Tanzania/docs/DATA_VALIDATION_RULES.md): Data types, E.164 phone formats, email regex, integer TZS specifications, and product compliance checklists.

### 2. JSON Schema Layer (`schemas/`)
- [schemas/product.schema.json](file:///d:/RM_Tanzania/schemas/product.schema.json): Schema representing the 23 compliant herbal product parameters. Defines admin validation checking that compliant fields are non-empty before publishing.
- [schemas/cart.schema.json](file:///d:/RM_Tanzania/schemas/cart.schema.json): Defines cart item rows and region input format.
- [schemas/checkout.schema.json](file:///d:/RM_Tanzania/schemas/checkout.schema.json): Validation schema for session checkout arguments.
- [schemas/customer.schema.json](file:///d:/RM_Tanzania/schemas/customer.schema.json): Customer profile fields (name, E.164 phone, email).
- [schemas/shipping.schema.json](file:///d:/RM_Tanzania/schemas/shipping.schema.json): Delivery region lookup arguments.
- [schemas/order.schema.json](file:///d:/RM_Tanzania/schemas/order.schema.json): The full order object model including an `orderStatus` field representing the complete order lifecycle enum (Draft, AwaitingPayment, Paid, etc.) while keeping `paymentStatus` and `fulfilmentStatus` for operational details.
- [schemas/payment.schema.json](file:///d:/RM_Tanzania/schemas/payment.schema.json): Payment initiation and status bodies.
- [schemas/webhook.schema.json](file:///d:/RM_Tanzania/schemas/webhook.schema.json): Webhook receipt payload.
- [schemas/admin.schema.json](file:///d:/RM_Tanzania/schemas/admin.schema.json): Administrative authentication payloads.
- [schemas/error.schema.json](file:///d:/RM_Tanzania/schemas/error.schema.json): Standardized API error responses.

---

## 🚦 Planned API Routes & HTTP Statuses

### API Route Endpoints:
1. **Products**: `GET /api/products`, `GET /api/products/:id`
2. **Cart Validation**: `POST /api/cart/validate`
3. **Checkout Session**: `POST /api/checkout/session`
4. **Shipping**: `POST /api/shipping/estimate`
5. **Orders**: `GET /api/orders/:id`
6. **Payment Initiation**: `POST /api/payments/initiate`
7. **Payment Status**: `GET /api/payments/status/:reference`
8. **Selcom Webhook**: `POST /api/webhooks/selcom`
9. **Admin Auth**: `POST /api/auth/login`, `POST /api/auth/logout`
10. **Admin Product Management**: `POST /api/admin/products`, `PUT /api/admin/products/:id` (validated compliance fields on publish)
11. **Admin Order Management**: `GET /api/admin/orders`, `PUT /api/admin/orders/:id/status`

### HTTP Status Conventions:
- `200`: Success for reads/updates.
- `201`: Successful creations (e.g. Order drafts).
- `202`: Accepted payment initiation request.
- `400`: Malformed requests or basic type violations.
- `401`: Lacking authentication tokens.
- `403`: Insufficient administrative privileges.
- `404`: Target product/order not found.
- `409`: State conflict, stock exhaustion, or duplicate payment attempts.
- `422`: Semantic syntax errors (e.g. invalid phone carrier code).
- `429`: API client rate limited.
- `500`: General server error (fully sanitized).

---

## 🔒 Key Security Rules

1. **Backend Pricing Authority**: Frontend values are untrusted. Subtotals, shipping rates, and totals are computed strictly on the backend via database records.
2. **CORS Restrictions**: Whitelist origin filter applied in production (no wildcards allowed).
3. **Rate Limiting**: Applied to `/api/checkout/*`, `/api/payments/*`, `/api/auth/*`, and `/api/webhooks/*`.
4. **Credential Isolation**: All Selcom API secrets and database passwords are isolated to secure environment configuration settings and never exposed.
5. **Sanitization**: Stack traces, raw database error descriptors, file path layouts, and provider exceptions are masked.

---

## 🛠️ Intentionally Not Implemented (Boundaries)

The following areas are strictly **excluded** from Stage 7 to maintain design-only constraints:
1. **No Backend Server**: No server scripts, Express files, or live routers are created.
2. **No Database Tables**: No SQL scripts, database connections, schemas setup, or queries are written.
3. **No Webhook Listeners**: Webhook route handlers and payload parsers are documentation only.
4. **No Selcom API Integrations**: No Selcom REST requests are coded.
5. **No Stock Deductions or Real Orders**: Order database schemas are defined, but order records are not spawned.
6. **No Admin Auth Implementation**: No password hashing, JWT issuers, or login controllers.

---

## 💡 Assumptions and Verification Requirements

- **Selcom Signature Verification**: Signature format (e.g. headers, HMAC/RSA cryptography, payload digest structure) is explicitly marked as a placeholder: *"Selcom signature verification details are to be confirmed against official Selcom documentation or sandbox credentials in Stage 10."*
- **Tanzanian Carrier Numbers**: Carrier prefix normalizations are modeled based on standard Vodacom, Tigo, Airtel, Halotel, and Zantel assignments. Sandbox numbers will be tested for parsing in later stages.
- **Integer TZS Values**: Currencies are treated as integer Tanzanian Shilling values. Cent fractions are disallowed.

# Security Boundaries

This document defines the security boundaries, key isolation layers, request validation requirements, and data access policies designed for Nature's Alchemy.

---

## 🚫 Core Boundary Principles

### 1. Database Isolation
- **Rule**: The frontend application must **never** connect to or query the database directly.
- **Enforcement**: All data requests from the frontend must transition through the backend API gateway. The database credentials, ports, and configuration strings must reside strictly in private environment parameters hidden from the client browser.

### 2. Secret Key Isolation
- **Rule**: Private API keys, webhook credentials, JWT signature keys, and Selcom integration secrets must **never** be transmitted to or stored in the frontend repository or code.
- **Enforcement**: All Selcom API payloads must be constructed, signed, and transmitted solely from the backend server environment.

### 3. Selcom Gateway Isolation
- **Rule**: The frontend must **never** issue direct HTTP requests to Selcom API endpoints.
- **Enforcement**: Any checkout creation, payment request validation, or webhook notification must interface with the payment gateway via the backend. The backend acts as the single broker for Selcom integration.

---

## 🧠 Business Logic Source of Truth

- **Pricing**: All product prices are stored and verified in the database. Client-submitted prices are ignored.
- **Shipping Fees**: Shipping fees for Tanzanian regions are evaluated by the backend using lookup tables.
- **Order Total Calculations**: Grand totals, discounts, shipping additions, and tax parameters must be computed on the server.
- **Stock Control**: Checking stock availability and deducting inventory counts are executed under database transaction safety rules on the backend.
- **Order/Payment Lifecycle**: The database states (e.g. `Draft`, `Paid`, `Cancelled`) represent the final source of truth. Client requests can only query state, not force transitions directly.

---

## 🔒 Request Validation & Sanitization

- **Input Schemas**: Every incoming HTTP request body must be validated against its strict JSON Schema before parsing. Any payload violating formats, fields, types, or lengths must be rejected with an immediate `400 Bad Request` or `422 Unprocessable Entity` status.
- **Sanitized Errors**: The backend must catch all internal exceptions (e.g., database connection drops, Selcom timeout exceptions, file access errors) and wrap them in a sanitized standard error model. Internal stack traces, raw query details, provider secrets, or server directory locations must never be returned to the client.
- **XSS Prevention**: Customer inputs (e.g. Customer Name, Delivery Notes) rendered into templates or administrative dashboards must be escaped using HTML escaping filters to block Cross-Site Scripting (XSS).

---

## 🛡️ CORS & Network Controls

- **CORS Configuration**: Wildcard origins (`Access-Control-Allow-Origin: *`) are strictly prohibited in the production environment. Allowed origins must be restricted to verified Nature's Alchemy domain names.
- **Rate Limiting**: Rate limits must be enforced to mitigate Denial of Service (DoS) and brute force attempts:
  - **Checkout Session API**: Max 10 requests per minute per IP.
  - **Payment Initiation API**: Max 5 requests per minute per IP.
  - **Admin Authentication API**: Max 5 attempts per minute per IP (with block timers).
  - **Selcom Webhook Receiver**: Rate-limit warning logging if traffic exceeds expected transaction frequencies.

---

## 🔑 Administrative Access Controls

- **Authentication**: All endpoints located under `/api/admin/*` require a valid JSON Web Token (JWT) transmitted via the HTTP `Authorization: Bearer <token>` header.
- **Role Verification**: Admin identities must be validated against database records. Only authorized operator accounts are permitted to modify inventory, change product compliance content, publish products, change prices, or process refunds.

---

## 📝 Transaction Audit Trails & Webhook Log Security

- **Required Event Logs**:
  - Administrative session login/logout.
  - Product catalogue adjustments (adds, updates, soft-deletes).
  - Product publish/unpublish transitions.
  - Price changes and stock adjustments.
  - Checkout session generations.
  - Webhook payload receipt and signature confirmation status (with strict redaction of sensitive credentials, secrets, or internal keys).
  - Order lifecycle state updates.
- **Metadata Logged**: Timestamp, target resource ID, actor reference, event action name, client IP address, and an audit trail hash verifying integrity.
- **Webhook Log Security**: Webhook logs must be strictly access-controlled, protected from public access, and redacted where sensitive headers or secrets appear. They are retained only according to the project's retention policy, and must never be used to expose private credentials, raw provider secrets, or internal signing keys.

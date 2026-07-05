# Selcom Integration Contract

This document outlines the API integration boundaries, signature placeholders, transaction references, retry logic, and webhook handling rules for connecting to the Selcom Payment Gateway.

---

## 🔒 Integration & Key Isolation Boundaries

1. **Backend-Only Secrets**: All Selcom API keys, vendor IDs, access tokens, and digital signing secrets must reside strictly in private environment parameters on the backend server. Under no circumstances may the frontend have access to or transmit these credentials.
2. **Direct Calling Ban**: The client browser must never call any Selcom endpoint directly. All communication with Selcom (including sessions, status checks, and checkouts) is routed through the backend API.
3. **Internal Status Broker**: The payment status queried by the frontend must be fetched from the backend API status endpoint. The backend queries Selcom or inspects local webhook records to resolve the payment state, preventing client tampering.

---

## 🎫 Unique Transaction References & Idempotency

1. **Backend-Generated Reference**: The backend must generate a unique, non-guessable transaction reference (e.g. `pay_ref_XXXXXXXX`) for every payment attempt initiated. This reference must be supplied to Selcom as the utility reference or order reference parameter.
2. **Payment Retry Policy**:
   - If a payment fails due to network issues or user cancellation, and the customer selects the same order to retry, the backend retry process must reuse the original backend payment reference (or associate it cleanly) to prevent duplicate transaction entries.
   - For Selcom USSD push payment retries, reuse the same reference where appropriate so the transaction can be mapped as a single order payment attempt in the gateway database.
3. **Idempotent Webhook Receipt**:
   - Selcom webhooks transmit a unique Selcom transaction ID (`transid`).
   - The backend receiver must record the receipt of every processed `transid` in the database.
   - If a webhook with a duplicate `transid` is received, the backend must return a successful acknowledgement to Selcom immediately without modifying the order status, executing double stock deductions, or triggering duplicate order fulfilment.

---

## 📝 Webhook Verification and Acknowledgement

1. **Signature Verification Placeholder**:
   - All public webhook endpoints must validate the authenticity of incoming Selcom payloads by verifying their digital signature.
   - **Important**: *Selcom signature verification details are to be confirmed against official Selcom documentation or sandbox credentials in Stage 10.* We do not assume header layouts, signing algorithms, or HMAC keys until sandbox specifications are reviewed.
2. **Idempotency Checks**:
   - Ensure the transaction state transitions only from `AwaitingPayment` to `Paid` or `PaymentFailed`. Once an order is updated to `Paid`, all future status changes from payment events must be rejected.
3. **Audit Log Logging & Webhook Log Security**:
   - The raw webhook payload, headers, IP address, and signature validation outcome must be logged on every request.
   - Webhook logs must be strictly access-controlled and protected from public access.
   - All logs must be redacted where sensitive headers, security credentials, or raw secrets appear.
   - Webhook logs must be retained only according to the project's retention policy, and must never be used to expose private customer credentials, raw provider secrets, or internal signing keys.

---

## 💱 Money Fields Format

All monetary figures exchanged with Selcom (amount, shipping, fees) must be represented as **integer Tanzanian Shilling values** (TZS). No decimals or fractions of a Shilling are permitted in checkout values.

# Selcom Go-Live Checklist

> **Mobile money only.** Selcom does not offer card acceptance, so checkout
> presents M-Pesa, Tigo Pesa and Airtel Money only. There is no hosted card
> checkout and no `checkoutUrl` redirect anywhere in the flow.

**There is no Selcom sandbox.** (Confirmed by Selcom's team — the developer page
at https://developers.selcommobile.com is current and documents no test
environment.) The first non-mock transaction is a live one, so everything that
can be proven locally already has been: `npm run server:test:selcom-webhook`
(23 checks: webhook success/failure/idempotency/bad-secret/disallowed-IP/
unknown-reference/amount-mismatch, single stock deduction) runs the whole flow
with `PAYMENTS_MODE=mock`. These are the steps to switch to live.

## Prerequisites (from Selcom support — manual)

Email `support@selcom.net` / your Selcom account contact and obtain:

1. Production **Vendor ID**, **API key**, and **API secret**.
2. The production **API base URL** (the `SELCOM_BASE_URL` placeholder in the
   repo is NOT real — there is no sandbox host to fall back to).
3. Selcom's **webhook source IP addresses/ranges** for the allowlist. Webhooks
   are unsigned, so IP allowlisting + the secret URL path are the authenticity
   controls.

## Production environment

Set in the production env (NOT committed — `.env` is gitignored):

```
PAYMENTS_MODE=                                  # unset/anything but "mock" = real calls
SELCOM_BASE_URL=<from Selcom support>
SELCOM_VENDOR_ID=<production vendor id>
SELCOM_API_KEY=<production api key>
SELCOM_API_SECRET=<production api secret>
SELCOM_WEBHOOK_URL=https://<production-domain>/api/webhooks/selcom
SELCOM_WEBHOOK_SECRET=<new-random-secret>     # generate fresh: openssl rand -hex 24
SELCOM_WEBHOOK_ALLOWED_IPS=<ips/cidrs from Selcom support>
SELCOM_REDIRECT_URL=https://<production-domain>/checkout/success
SELCOM_CANCEL_URL=https://<production-domain>/checkout/cancel
```

- Never reuse the local test webhook secret in production.
- If `SELCOM_WEBHOOK_ALLOWED_IPS` is left empty the server accepts webhooks
  from any IP and logs a prominent warning on startup and on every request —
  acceptable for the very first watched test only, not for open trading.

## Webhook URL registration

Nothing to configure in any dashboard: the backend sends the full secret
webhook URL (`.../api/webhooks/selcom/<SELCOM_WEBHOOK_SECRET>`, base64-encoded
per Selcom's docs) inside every create-order / create-order-minimal payload.
Just confirm the production domain is publicly reachable over HTTPS. A wrong or
missing secret in the path returns 404 by design (endpoint not discoverable).

## Deploy

```
npm run server:migrate            # idempotent; adds payments.checkout_url
npm run server:seed:catalog       # re-seed products from src/data/products.js
npm run server:dev                # or your production process manager
```

Frontend is already pointed at Selcom (`PAYMENT_PROVIDER = 'selcom'` in
`src/components/CheckoutWizard.js`).

## Final verification (live — this is the first real test)

Because there is no sandbox, run one small real transaction watched end-to-end
**before** opening up:

1. One mobile money payment (real USSD prompt, smallest sellable amount) —
   confirm the prompt arrives, the webhook hits `/api/webhooks/selcom/<secret>`
   (check audit logs; verify its source IP matches the allowlist), and the
   order flips to Paid via webhook.
2. One card payment through the hosted checkout (`checkoutUrl` redirect;
   Selcom's page supports cards, wallets, and QR) — confirm redirect out,
   payment, redirect back to `SELCOM_REDIRECT_URL`, and Paid via webhook.
3. Check the order shows `payment_status = Paid`,
   `fulfilment_status = FulfilmentPending`, and stock decremented exactly once.
4. Only then announce/open checkout to customers.

## Notes

- **Stakaba remains fully wired as fallback** (`/api/payments/stakaba/*`,
  `/api/webhooks/stakaba/:secret`). To fall back, change
  `PAYMENT_PROVIDER = 'selcom'` to `'stakaba'` in
  `src/components/CheckoutWizard.js` — a one-word change. Remove the Stakaba
  integration only after Selcom is proven live.
- Selcom states webhooks fire **only on successful transactions**; failed/
  cancelled payments surface via the rate-limited order-status query in
  `GET /api/payments/status/:reference` or simply expire client-side.
- All amounts are integer TZS (see docs/SELCOM_INTEGRATION_CONTRACT.md).

# Stakaba Go-Live Checklist

Sandbox integration is complete and tested (`npm run server:test:stakaba-webhook`,
32 checks: mpesa/tigo/airtel + card initiate, webhook success/failure/idempotency/
bad-secret/amount-mismatch, stock deduction). These are the steps to switch to live.

## Prerequisites (Stakaba dashboard — manual)

1. Submit KYC / request go-live in the dashboard. Wait 24–48h for approval and the
   `sk_live_...` API key.
2. Obtain the fee schedule from Stakaba (commercial, unpublished) before taking real
   payments.

## Production environment

Set in the production env (NOT committed — `.env` is gitignored):

```
STAKABA_API_KEY=sk_live_xxxxxxxx        # the live key from Stakaba
STAKABA_WEBHOOK_SECRET=<new-random-secret>   # generate fresh, do NOT reuse sandbox
STAKABA_BASE_URL=https://api.stakaba.com     # same base URL for sandbox and live
```

- The key prefix (`sk_test_` / `sk_live_`) is what selects the mode — same base URL.
- Generate a new webhook secret, e.g. `openssl rand -hex 32`. Never reuse the sandbox
  secret in production.

## Dashboard webhook config

Set the webhook URL at **Settings → Profile** (not the sidebar Webhooks page) to:

```
https://<production-domain>/api/webhooks/stakaba/<STAKABA_WEBHOOK_SECRET>
```

The secret in the path must exactly match `STAKABA_WEBHOOK_SECRET`. A wrong/missing
secret returns 404 by design (endpoint is not discoverable). Webhooks carry no
signature — authenticity is the secret path + internalReference match + amount match.

## Deploy

```
npm run server:migrate            # idempotent; adds provider/stakaba_reference columns
npm run server:seed:catalog       # re-seed products from src/data/products.js
npm run server:dev                # or your production process manager
```

## Final verification (live)

Run one small real transaction end-to-end before announcing:

1. Card (hosted checkout, real Visa/Mastercard) — confirm redirect, payment, and that
   the order flips to Paid via webhook.
2. One mobile money network (real USSD prompt) — confirm the same.
3. Check the order shows `payment_status = Paid`, `fulfilment_status = FulfilmentPending`,
   and that stock decremented exactly once.

## Notes

- Backend cannot query Stakaba's transactions API (needs a portal bearer token, not the
  API key), so payment state is driven entirely by webhooks. If a webhook never arrives,
  the order stays `AwaitingPayment` until it expires.
- HaloPesa is intentionally unsupported (removed from NETWORK_MAP); reachable methods are
  mpesa, tigo, airtel, card.

# Data Retention

The site's [Privacy Policy](../src/pages/PrivacyPolicy.js) (section 9) publishes
how long we keep each category of personal data. Those periods are a public
commitment to customers and to the Personal Data Protection Commission, so they
have to be enforced by something — a policy the system does not honour is worse
than no policy at all.

`server/utils/retentionCleanup.js` is what enforces them.

## Running it

```bash
npm run server:retention:cleanup -- --dry-run   # report only, changes nothing
npm run server:retention:cleanup                # apply
```

Always dry-run first on production. The dry run uses the same predicates as the
real run, so it reports exactly what would change.

The job is **atomic** (a failure part-way through applies nothing) and
**idempotent** (re-running immediately affects zero rows).

## What it enforces

| Data | Period | Action |
|---|---|---|
| Expired idempotency keys | on expiry | deleted |
| Abandoned checkout sessions | 12 months | deleted |
| Audit logs (contain `ip_address`) | 12 months | deleted |
| Payment event payloads | tax period | scrubbed |
| Orders | tax period (60 months) | **anonymised**, financial record kept |

Two behaviours worth understanding:

**Orders are anonymised, not deleted.** Tanzanian tax law requires transaction
records to be retained. After that period we strip the personal data
(`customer_name`, `customer_phone`, `customer_email`, `delivery_notes`) and keep
the financial record, satisfying both tax law and data minimisation.

**Checkout sessions that became orders are never deleted**, only genuinely
abandoned ones. `orders.checkout_session_id` is a foreign key, and the order is
the record tax law requires — deleting its session would break referential
integrity and destroy a record we are obliged to keep.

## Adjusting the periods

Set these in the production environment. They must stay in step with what
section 9 of the Privacy Policy says publicly — if you change one, change both.

```
RETENTION_ABANDONED_CHECKOUT_MONTHS=12
RETENTION_AUDIT_LOG_MONTHS=12
RETENTION_ORDER_TAX_MONTHS=60
```

## Scheduling (required in production)

The job does not schedule itself. Until it runs automatically on the production
server, the published retention periods are not actually being met.

On a Linux VPS, a daily cron entry:

```cron
0 3 * * * cd /path/to/app && /usr/bin/npm run server:retention:cleanup >> /var/log/rm-retention.log 2>&1
```

Verify after the first scheduled run that `audit_logs` contains a
`DATA_RETENTION_CLEANUP` entry — the job records each sweep that changed
anything, which is also the evidence trail to show a regulator on request.

## Not covered here

Section 9 also commits to deleting **enquiries and correspondence** within 24
months. Those live in email and WhatsApp rather than this database, so they are
not in scope for this job and remain a manual process.

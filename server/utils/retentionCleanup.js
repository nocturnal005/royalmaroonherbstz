/**
 * Data retention cleanup job.
 *
 * Enforces the retention periods published in the site's Privacy Policy
 * (src/pages/PrivacyPolicy.js, section 9). Without this job those periods are
 * promises the system does not keep: nothing else in the backend deletes
 * personal data, so orders, abandoned checkouts and IP-bearing audit records
 * would otherwise be retained indefinitely.
 *
 * What it does, and why each rule exists:
 *
 *   1. Expired idempotency keys        — housekeeping; response_body can hold
 *                                        a copy of a customer-facing payload.
 *   2. Abandoned checkout sessions     — "deleted within 12 months". A session
 *                                        that never became an order represents
 *                                        someone with no ongoing relationship
 *                                        with us. Sessions that DID become
 *                                        orders are excluded: orders.
 *                                        checkout_session_id is a foreign key,
 *                                        and the order itself is the record
 *                                        tax law requires us to keep.
 *   3. Audit logs                      — "up to 12 months"; these carry
 *                                        ip_address, which is personal data.
 *   4. Orders past the tax retention   — "retained for the period required by
 *      period                            Tanzanian tax and accounting law, and
 *                                        then deleted or anonymised". We
 *                                        anonymise rather than delete: the
 *                                        financial record survives for
 *                                        accounting while the personal data in
 *                                        it does not. Linked payment_events
 *                                        payloads are scrubbed at the same time.
 *
 * Enquiries and correspondence (also covered by section 9) live in email and
 * WhatsApp, not in this database, so they are not in scope here and remain a
 * manual process.
 *
 * Usage:
 *   npm run server:retention:cleanup             # apply
 *   npm run server:retention:cleanup -- --dry-run  # report only, change nothing
 *
 * Retention periods are configurable via environment variables so they can be
 * kept in step with the published policy without a code change.
 */

import db from '../config/database.js';
import { logAuditEvent } from '../audit/logger.js';

// Marker written into anonymised order fields. Also used as a guard so
// re-running the job does not re-process rows it has already anonymised.
const ANONYMISED = '[deleted]';
const SCRUBBED_PAYLOAD = '{"redacted":"retention"}';

function months(envVar, fallback) {
  const raw = parseInt(process.env[envVar], 10);
  return Number.isFinite(raw) && raw > 0 ? raw : fallback;
}

// Policy section 9 periods. Orders default to 60 months (5 years), the record
// retention period required under Tanzanian tax law.
const ABANDONED_CHECKOUT_MONTHS = months('RETENTION_ABANDONED_CHECKOUT_MONTHS', 12);
const AUDIT_LOG_MONTHS = months('RETENTION_AUDIT_LOG_MONTHS', 12);
const ORDER_TAX_MONTHS = months('RETENTION_ORDER_TAX_MONTHS', 60);

// SQLite date arithmetic ('-12 months') is used rather than JS-computed
// timestamps so we never depend on the stored column format matching a
// JS-generated string.
const modifier = (n) => `-${n} months`;

/**
 * Each rule exposes a count query and an apply statement over the same
 * predicate, so --dry-run reports exactly what a real run would change.
 */
const RULES = [
  {
    name: 'Expired idempotency keys',
    detail: 'expired',
    count: () =>
      db.prepare(`SELECT COUNT(*) AS n FROM idempotency_keys WHERE expires_at < datetime('now')`).get().n,
    apply: () =>
      db.prepare(`DELETE FROM idempotency_keys WHERE expires_at < datetime('now')`).run().changes
  },
  {
    name: 'Abandoned checkout sessions',
    detail: `older than ${ABANDONED_CHECKOUT_MONTHS} months, never became an order`,
    count: () =>
      db.prepare(`
        SELECT COUNT(*) AS n FROM checkout_sessions
        WHERE created_at < datetime('now', ?)
          AND id NOT IN (SELECT checkout_session_id FROM orders)
      `).get(modifier(ABANDONED_CHECKOUT_MONTHS)).n,
    apply: () =>
      db.prepare(`
        DELETE FROM checkout_sessions
        WHERE created_at < datetime('now', ?)
          AND id NOT IN (SELECT checkout_session_id FROM orders)
      `).run(modifier(ABANDONED_CHECKOUT_MONTHS)).changes
  },
  {
    name: 'Audit log records',
    detail: `older than ${AUDIT_LOG_MONTHS} months (contain IP addresses)`,
    count: () =>
      db.prepare(`SELECT COUNT(*) AS n FROM audit_logs WHERE timestamp < datetime('now', ?)`)
        .get(modifier(AUDIT_LOG_MONTHS)).n,
    apply: () =>
      db.prepare(`DELETE FROM audit_logs WHERE timestamp < datetime('now', ?)`)
        .run(modifier(AUDIT_LOG_MONTHS)).changes
  },
  {
    name: 'Payment event payloads (scrubbed)',
    detail: `belonging to orders older than ${ORDER_TAX_MONTHS} months`,
    count: () =>
      db.prepare(`
        SELECT COUNT(*) AS n FROM payment_events
        WHERE raw_payload <> ?
          AND payment_reference IN (
            SELECT p.payment_reference FROM payments p
            JOIN orders o ON o.id = p.order_id
            WHERE o.created_at < datetime('now', ?)
          )
      `).get(SCRUBBED_PAYLOAD, modifier(ORDER_TAX_MONTHS)).n,
    apply: () =>
      db.prepare(`
        UPDATE payment_events SET raw_payload = ?
        WHERE raw_payload <> ?
          AND payment_reference IN (
            SELECT p.payment_reference FROM payments p
            JOIN orders o ON o.id = p.order_id
            WHERE o.created_at < datetime('now', ?)
          )
      `).run(SCRUBBED_PAYLOAD, SCRUBBED_PAYLOAD, modifier(ORDER_TAX_MONTHS)).changes
  },
  {
    name: 'Orders (anonymised)',
    detail: `older than ${ORDER_TAX_MONTHS} months; financial record kept, personal data removed`,
    count: () =>
      db.prepare(`
        SELECT COUNT(*) AS n FROM orders
        WHERE created_at < datetime('now', ?) AND customer_name <> ?
      `).get(modifier(ORDER_TAX_MONTHS), ANONYMISED).n,
    apply: () =>
      db.prepare(`
        UPDATE orders
        SET customer_name = ?, customer_phone = ?, customer_email = ?, delivery_notes = NULL,
            updated_at = CURRENT_TIMESTAMP
        WHERE created_at < datetime('now', ?) AND customer_name <> ?
      `).run(ANONYMISED, ANONYMISED, ANONYMISED, modifier(ORDER_TAX_MONTHS), ANONYMISED).changes
  }
];

/**
 * Run the retention rules.
 * @param {Object} options
 * @param {boolean} options.dryRun Report what would change without changing it.
 * @returns {{dryRun: boolean, results: Array<{name: string, detail: string, affected: number}>, total: number}}
 */
export function runRetentionCleanup({ dryRun = false } = {}) {
  const results = [];

  if (dryRun) {
    for (const rule of RULES) {
      results.push({ name: rule.name, detail: rule.detail, affected: rule.count() });
    }
  } else {
    // Atomic: either the whole sweep lands or none of it does, so a failure
    // part-way through cannot leave retention half-applied.
    db.transaction(() => {
      for (const rule of RULES) {
        results.push({ name: rule.name, detail: rule.detail, affected: rule.apply() });
      }
    })();
  }

  const total = results.reduce((sum, r) => sum + r.affected, 0);

  // Record that the sweep ran. This entry is itself subject to the audit-log
  // retention rule on a future run, which is intended.
  if (!dryRun && total > 0) {
    logAuditEvent('DATA_RETENTION_CLEANUP', null, null, {
      periods: {
        abandonedCheckoutMonths: ABANDONED_CHECKOUT_MONTHS,
        auditLogMonths: AUDIT_LOG_MONTHS,
        orderTaxMonths: ORDER_TAX_MONTHS
      },
      results: results.map(({ name, affected }) => ({ name, affected }))
    });
  }

  return { dryRun, results, total };
}

// CLI entry point.
const invokedDirectly = process.argv[1] && process.argv[1].replace(/\\/g, '/').endsWith('retentionCleanup.js');

if (invokedDirectly) {
  const dryRun = process.argv.includes('--dry-run');

  console.log('');
  console.log('========================================');
  console.log(dryRun ? 'DATA RETENTION CLEANUP (DRY RUN)' : 'DATA RETENTION CLEANUP');
  console.log('========================================');
  console.log(`Abandoned checkouts : ${ABANDONED_CHECKOUT_MONTHS} months`);
  console.log(`Audit logs          : ${AUDIT_LOG_MONTHS} months`);
  console.log(`Orders (tax period) : ${ORDER_TAX_MONTHS} months`);
  console.log('');

  try {
    const { results, total } = runRetentionCleanup({ dryRun });

    for (const r of results) {
      const verb = dryRun ? 'would affect' : 'affected';
      console.log(`  ${r.name}`);
      console.log(`    ${r.detail}`);
      console.log(`    ${verb}: ${r.affected}`);
      console.log('');
    }

    console.log('----------------------------------------');
    console.log(
      dryRun
        ? `DRY RUN COMPLETE — ${total} record(s) would be affected. Nothing was changed.`
        : `CLEANUP COMPLETE — ${total} record(s) affected.`
    );
    console.log('========================================');
    console.log('');
    process.exit(0);
  } catch (error) {
    console.error('');
    console.error('RETENTION CLEANUP FAILED — no changes were applied.');
    console.error(error);
    process.exit(1);
  }
}

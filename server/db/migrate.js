import fs from 'fs';
import path from 'path';
import db from '../config/database.js';

function runMigration() {
  console.log('Starting SQLite database migrations...');

  try {
    const initSqlPath = path.join(process.cwd(), 'server/db/migrations/init.sql');
    const sql = fs.readFileSync(initSqlPath, 'utf8');
    db.exec(sql);

    const updateSqlPath = path.join(process.cwd(), 'server/db/migrations/update_admin_users.sql');
    if (fs.existsSync(updateSqlPath)) {
      // Check if the admin_users table already has the 'email' column to see if it is already expanded
      const tableInfo = db.prepare("PRAGMA table_info(admin_users)").all();
      const hasEmail = tableInfo.some(col => col.name === 'email');
      
      if (!hasEmail) {
        console.log('Applying admin users table expansion migration...');
        const updateSql = fs.readFileSync(updateSqlPath, 'utf8');
        db.exec(updateSql);
      } else {
        console.log('✓ Admin users table is already expanded. Skipping migration.');
      }
    }

    // Stage 10 Payment table expansions
    const addColumnIfNotExists = (tableName, columnName, columnDefinition) => {
      const tableInfo = db.prepare(`PRAGMA table_info(${tableName})`).all();
      const exists = tableInfo.some(col => col.name === columnName);
      if (!exists) {
        console.log(`Adding column ${columnName} to table ${tableName}...`);
        db.exec(`ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${columnDefinition}`);
      } else {
        console.log(`Column ${columnName} in table ${tableName} already exists. Skipping.`);
      }
    };

    addColumnIfNotExists('payments', 'selcom_reference', 'TEXT');
    addColumnIfNotExists('payments', 'selcom_transid', 'TEXT');
    addColumnIfNotExists('payments', 'provider_result_code', 'TEXT');
    addColumnIfNotExists('payments', 'provider_message', 'TEXT');
    addColumnIfNotExists('payments', 'initiated_at', 'DATETIME');
    addColumnIfNotExists('payments', 'paid_at', 'DATETIME');
    addColumnIfNotExists('payments', 'failed_at', 'DATETIME');
    addColumnIfNotExists('payments', 'expires_at', 'DATETIME');
    addColumnIfNotExists('payments', 'last_status_query_at', 'DATETIME');

    addColumnIfNotExists('payment_events', 'event_type', 'TEXT');
    addColumnIfNotExists('payment_events', 'signature_valid', 'INTEGER CHECK (signature_valid IN (0, 1))');
    addColumnIfNotExists('payment_events', 'raw_payload_redacted', 'TEXT');
    addColumnIfNotExists('payment_events', 'processed_at', 'DATETIME DEFAULT CURRENT_TIMESTAMP');

    // Stakaba payment gateway columns. `provider` distinguishes rows from the
    // legacy Selcom integration; `stakaba_reference` stores Stakaba's
    // `internalReference`, which is how webhooks are matched back to a payment
    // we created. For Stakaba webhook idempotency we reuse the existing UNIQUE
    // column payment_events.selcom_transaction_id to hold the internalReference
    // (a generic provider transaction id), so no new unique index is needed.
    addColumnIfNotExists('payments', 'provider', "TEXT");
    addColumnIfNotExists('payments', 'stakaba_reference', 'TEXT');
    addColumnIfNotExists('payment_events', 'provider', "TEXT");

    console.log('✓ SQLite database migrations completed successfully.');
    
    // Log audit event
    const stmt = db.prepare(`
      INSERT INTO audit_logs (action, details)
      VALUES (?, ?)
    `);
    stmt.run('DATABASE_MIGRATION_RUN', JSON.stringify({ status: 'success', timestamp: new Date().toISOString() }));
  } catch (error) {
    console.error('✗ Database migration failed:', error);
    process.exit(1);
  }
}

runMigration();

import readline from 'readline';
import { Writable } from 'stream';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import db from '../config/database.js';

// Helper to prompt for standard input
function ask(query) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  return new Promise(resolve => {
    rl.question(query, answer => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

// Helper to prompt for muted password input
function askPassword(query) {
  let muted = false;
  const mutableStdout = new Writable({
    write: function (chunk, encoding, callback) {
      if (!muted) {
        process.stdout.write(chunk, encoding);
      }
      callback();
    }
  });

  const rl = readline.createInterface({
    input: process.stdin,
    output: mutableStdout,
    terminal: true
  });

  return new Promise(resolve => {
    rl.question(query, answer => {
      rl.close();
      process.stdout.write('\n'); // Add newline after prompt completion
      resolve(answer);
    });
    muted = true; // Mute stdout immediately after printing the prompt query
  });
}

// Password strength validator
function isPasswordStrong(pwd) {
  if (pwd.length < 8) return false;
  const hasUppercase = /[A-Z]/.test(pwd);
  const hasLowercase = /[a-z]/.test(pwd);
  const hasNumbers = /\d/.test(pwd);
  const hasSpecial = /[^A-Za-z0-9]/.test(pwd);
  return hasUppercase && hasLowercase && hasNumbers && hasSpecial;
}

async function main() {
  console.log('\n========================================');
  console.log('NATURE\'S ALCHEMY - CREATE ADMIN USER CLI');
  console.log('========================================\n');

  try {
    // Username and role may be passed as arguments so that creating several
    // staff accounts in a row is quick:  npm run server:create-admin sales_1
    const [argUsername, argRole] = process.argv.slice(2);

    const username = argUsername || await ask('Enter Username: ');
    if (!username || username.length < 3) {
      console.error('✗ Error: Username must be at least 3 characters.');
      process.exit(1);
    }

    // Staff sign in with a username and password only - no email is involved
    // anywhere in the login flow. The column is still UNIQUE NOT NULL in the
    // schema, so a value derived from the username satisfies it without
    // asking for an address nobody uses.
    const email = `${username.toLowerCase()}@staff.local`;

    const role = argRole || await ask('Enter Role [admin]: ') || 'admin';
    const validRoles = ['owner', 'admin', 'editor', 'viewer'];
    if (!validRoles.includes(role)) {
      console.error(`✗ Error: Invalid role '${role}'. Must be owner, admin, editor, or viewer.`);
      process.exit(1);
    }

    const password = await askPassword('Enter Password (input will be hidden): ');
    if (!isPasswordStrong(password)) {
      console.error('✗ Error: Password is too weak.');
      console.error('  Requirements: Minimum 8 characters, at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character.');
      process.exit(1);
    }

    const confirmPassword = await askPassword('Confirm Password: ');
    if (password !== confirmPassword) {
      console.error('✗ Error: Passwords do not match.');
      process.exit(1);
    }

    // Check for duplicate username or email in database
    const existing = db.prepare('SELECT username, email FROM admin_users WHERE username = ? OR email = ?').get(username, email);
    if (existing) {
      if (existing.username.toLowerCase() === username.toLowerCase()) {
        console.error('✗ Error: Username is already registered.');
      } else {
        console.error('✗ Error: Email is already registered.');
      }
      process.exit(1);
    }

    // Generate secure ID and hash password using bcryptjs cost factor 12
    const id = `usr_${crypto.randomBytes(8).toString('hex')}`;
    const passwordHash = bcrypt.hashSync(password, 12);

    // Save admin user
    db.prepare(`
      INSERT INTO admin_users (id, username, email, password_hash, role, is_active)
      VALUES (?, ?, ?, ?, ?, 1)
    `).run(id, username, email, passwordHash, role);

    // Log audit event without storing the password
    db.prepare(`
      INSERT INTO audit_logs (action, resource_id, details)
      VALUES (?, ?, ?)
    `).run(
      'ADMIN_CREATED_CLI',
      id,
      JSON.stringify({ username, email, role, timestamp: new Date().toISOString() })
    );

    console.log('\n✓ Success: Administrative account created successfully.');
    console.log(`  User ID:  ${id}`);
    console.log(`  Username: ${username}`);
    console.log(`  Role:     ${role}`);
    console.log(`  Status:   Active\n`);

    process.exit(0);
  } catch (error) {
    console.error('\n✗ Error creating admin account:', error.message);
    process.exit(1);
  }
}

main();

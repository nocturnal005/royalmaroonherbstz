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
const MIN_PASSWORD_DIGITS = 8;

// Shop staff sign in from the counter and on phones, so passwords are numeric
// by request. Digits alone shrink the keyspace enormously compared with mixed
// characters, so length and obvious-pattern rejection now carry the weight that
// character variety used to. The login route is rate limited to 5 attempts per
// minute, which is what makes an 8 digit PIN defensible rather than reckless.
// Returns a message explaining the problem, or null when the password is fine.
function describePasswordWeakness(pwd) {
  if (!/^[0-9]+$/.test(pwd)) {
    return 'Password must contain numbers only.';
  }
  if (pwd.length < MIN_PASSWORD_DIGITS) {
    return `Password must be at least ${MIN_PASSWORD_DIGITS} digits. Longer is materially safer.`;
  }
  if (new Set(pwd).size === 1) {
    return 'Password cannot be the same digit repeated.';
  }

  // Runs like 12345678 or 87654321 are the first thing anyone guesses.
  let ascending = true;
  let descending = true;
  for (let i = 1; i < pwd.length; i++) {
    const step = Number(pwd[i]) - Number(pwd[i - 1]);
    if (step !== 1) ascending = false;
    if (step !== -1) descending = false;
  }
  if (ascending || descending) {
    return 'Password cannot be a sequence of consecutive digits.';
  }

  // A short list of PINs that turn up at the top of every breach corpus.
  const COMMON = ['12345678', '00000000', '11223344', '12341234', '11112222', '12121212', '10203040'];
  if (COMMON.includes(pwd)) {
    return 'That is one of the most commonly used PINs. Choose another.';
  }

  // A birth year or date is the usual fallback once letters are off the table.
  if (/^(19|20)[0-9]{2}$/.test(pwd.slice(0, 4)) && new Set(pwd.slice(4)).size === 1) {
    return 'Password looks like a year followed by a repeated digit. Choose something less guessable.';
  }

  return null;
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
    const weakness = describePasswordWeakness(password);
    if (weakness) {
      console.error(`✗ Error: ${weakness}`);
      console.error(`  Requirements: numbers only, at least ${MIN_PASSWORD_DIGITS} digits, not a repeat or a run.`);
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

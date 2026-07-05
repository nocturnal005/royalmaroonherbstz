import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const dbPath = process.env.DATABASE_PATH || './server/db/nature_alchemy.db';

// Ensure the db parent directory exists
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db = new Database(dbPath, {
  verbose: process.env.DEBUG_SQL === 'true' ? console.log : undefined
});

// Enable foreign key constraints
db.pragma('foreign_keys = ON');

export default db;

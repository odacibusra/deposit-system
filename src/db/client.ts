import Database from 'better-sqlite3';
import path from 'path';

const DB_PATH = path.resolve('./deposit.db');

const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL'); // better concurrent performance

export default db;

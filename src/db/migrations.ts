import db from './client.js';

export function runMigrations() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS deposits (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL CHECK(type IN ('can', 'bottle')),
      depositValue INTEGER NOT NULL,
      machineTag TEXT NOT NULL,
      createdAt TEXT NOT NULL
    );

     CREATE TABLE IF NOT EXISTS logs (
      id TEXT PRIMARY KEY,
      machineTag TEXT NOT NULL,
      event TEXT NOT NULL,
      details TEXT,
      createdAt TEXT NOT NULL
    );
  `);
}
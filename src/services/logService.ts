import db from '../db/client.js';
import { LogEvent } from '../models/item.js';

export function log(machineTag: string, event: LogEvent, details?: string) {
  const logEntry = {
    id: crypto.randomUUID(),
    machineTag,
    event,
    details: details || null,
    createdAt: new Date().toISOString(),
  };

  db.prepare(
    `
    INSERT INTO logs (id, machineTag, event, details, createdAt)
    VALUES (?, ?, ?, ?, ?)
  `
  ).run(logEntry.id, logEntry.machineTag, logEntry.event, logEntry.details, logEntry.createdAt);
}

export function getLogs(machineTag: string) {
  return db
    .prepare(
      `
    SELECT * FROM logs WHERE machineTag = ? ORDER BY createdAt DESC
  `
    )
    .all(machineTag);
}

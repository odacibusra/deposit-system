import { v4 as uuidv4 } from 'uuid';
import db from '../db/client.js';
import { DEPOSIT_VALUES, DepositItem, ItemType, Log } from '../models/item.js';

export function buildItems(machineTag: string, type: ItemType, count: number): DepositItem[] {
  return Array.from({ length: count }, () => ({
    id: uuidv4(),
    type,
    depositValue: DEPOSIT_VALUES[type],
    machineTag,
    createdAt: new Date().toISOString(),
  }));
}

export function saveDeposit(item: DepositItem): void {
  db.prepare(
    `
    INSERT INTO deposits (id, type, depositValue, machineTag, createdAt)
    VALUES (?, ?, ?, ?, ?)
  `
  ).run(item.id, item.type, item.depositValue, item.machineTag, item.createdAt);
}

export function getAndClearDeposits(machineTag: string): DepositItem[] {
  const getAndDelete = db.transaction(() => {
    const items = db
      .prepare(
        `
      SELECT * FROM deposits WHERE machineTag = ? ORDER BY createdAt DESC
    `
      )
      .all(machineTag) as DepositItem[];
    db.prepare(`DELETE FROM deposits WHERE machineTag = ?`).run(machineTag);
    return items;
  });

  return getAndDelete();
}

export function getHistory(machineTag: string): Log[] {
  return db
    .prepare(
      `
    SELECT * FROM logs WHERE machineTag = ? ORDER BY createdAt ASC
  `
    )
    .all(machineTag) as Log[];
}

import { buildItems, saveDeposit, getAndClearDeposits, getHistory } from './depositService.js';
import db from '../db/client.js';
import { runMigrations } from '../db/migrations.js';

beforeAll(() => {
  runMigrations();
});

beforeEach(() => {
  db.prepare('DELETE FROM deposits').run();
});

const machineTag = 'TEST-MACHINE';

describe('buildItems', () => {
  it('builds the correct number of items', () => {
    const items = buildItems(machineTag, 'can', 3);
    expect(items).toHaveLength(3);
  });

  it('sets correct deposit value for bottle', () => {
    const items = buildItems(machineTag, 'bottle', 1);
    expect(items[0].depositValue).toBe(300);
  });

  it('sets correct deposit value for can', () => {
    const items = buildItems(machineTag, 'can', 1);
    expect(items[0].depositValue).toBe(200);
  });

  it('assigns the correct machineTag', () => {
    const items = buildItems(machineTag, 'can', 1);
    expect(items[0].machineTag).toBe(machineTag);
  });

  it('generates unique ids', () => {
    const items = buildItems(machineTag, 'can', 3);
    const ids = items.map(i => i.id);
    expect(new Set(ids).size).toBe(3);
  });
});

describe('saveDeposit', () => {
  it('saves a deposit to the database', () => {
    const [item] = buildItems(machineTag, 'can', 1);
    saveDeposit(item);

    const saved = db.prepare('SELECT * FROM deposits WHERE id = ?').get(item.id);
    expect(saved).toBeTruthy();
  });
});

describe('getAndClearDeposits', () => {
  it('returns all deposits for a machine', () => {
    const items = buildItems(machineTag, 'can', 3);
    items.forEach(saveDeposit);

    const result = getAndClearDeposits(machineTag);
    expect(result).toHaveLength(3);
  });

  it('clears deposits after retrieval', () => {
    const items = buildItems(machineTag, 'can', 2);
    items.forEach(saveDeposit);

    getAndClearDeposits(machineTag);

    const remaining = db.prepare('SELECT * FROM deposits WHERE machineTag = ?').all(machineTag);
    expect(remaining).toHaveLength(0);
  });

  it('returns empty array if no deposits', () => {
    const result = getAndClearDeposits(machineTag);
    expect(result).toHaveLength(0);
  });

  it('only clears deposits for the given machine', () => {
    const items1 = buildItems(machineTag, 'can', 2);
    const items2 = buildItems('OTHER-MACHINE', 'bottle', 2);
    items1.forEach(saveDeposit);
    items2.forEach(saveDeposit);

    getAndClearDeposits(machineTag);

    const remaining = db.prepare('SELECT * FROM deposits WHERE machineTag = ?').all('OTHER-MACHINE');
    expect(remaining).toHaveLength(2);
  });
});

describe('getHistory', () => {
  it('returns deposit history for a machine', () => {
    const items = buildItems(machineTag, 'bottle', 2);
    items.forEach(saveDeposit);

    const history = getHistory(machineTag);
    expect(history).toHaveLength(2);
  });

  it('does not clear deposits', () => {
    const items = buildItems(machineTag, 'bottle', 2);
    items.forEach(saveDeposit);

    getHistory(machineTag);

    const remaining = db.prepare('SELECT * FROM deposits WHERE machineTag = ?').all(machineTag);
    expect(remaining).toHaveLength(2);
  });
});
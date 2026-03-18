import { processItems } from './processorService.js';
import { buildItems } from './depositService.js';
import { runMigrations } from '../db/migrations.js';
import { vi, beforeAll, describe, it, expect } from 'vitest';

beforeAll(() => {
  runMigrations();
});

const machineTag = 'TEST-MACHINE';

describe('processItems', () => {
  it('processes all items and returns them', async () => {
    const items = buildItems(machineTag, 'bottle', 2);
    const { processed } = await processItems(items, vi.fn());
    expect(processed).toHaveLength(2);
  }, 10000);

  it('calculates total value correctly', async () => {
    const items = buildItems(machineTag, 'bottle', 2); // 2 x 300 = 600
    const { totalValue } = await processItems(items, vi.fn());
    expect(totalValue).toBe(600);
  }, 10000);

  it('calls onItemProcessed for each item', async () => {
    const items = buildItems(machineTag, 'can', 3);
    const onItemProcessed = vi.fn();
    await processItems(items, onItemProcessed);
    expect(onItemProcessed).toHaveBeenCalledTimes(3);
  }, 15000);

  it('calls onItemProcessed with correct index and total', async () => {
    const items = buildItems(machineTag, 'bottle', 2);
    const calls: [number, number][] = [];

    await processItems(items, (_, index, total) => {
      calls.push([index, total]);
    });

    expect(calls).toEqual([[1, 2], [2, 2]]);
  }, 10000);

  it('returns empty array and zero total for no items', async () => {
    const { processed, totalValue } = await processItems([], vi.fn());
    expect(processed).toHaveLength(0);
    expect(totalValue).toBe(0);
  });
});
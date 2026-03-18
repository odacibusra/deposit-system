import { printReceipt } from './voucherService.js';
import { buildItems } from './depositService.js';
import { runMigrations } from '../db/migrations.js';
import { vi, beforeAll, describe, it, beforeEach, afterEach, expect } from 'vitest';

beforeAll(() => {
  runMigrations();
});

const machineTag = 'TEST-MACHINE';

describe('printReceipt', () => {
  let consoleSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  it('prints without throwing', () => {
    const items = buildItems(machineTag, 'bottle', 2);
    expect(() =>
      printReceipt({ items, date: '17.03.2026 14:00:00' })
    ).not.toThrow();
  });

  it('includes total refund in output', () => {
    const items = buildItems(machineTag, 'bottle', 2); // 2 x 3 kr = 6 kr
    printReceipt({  items, date: '17.03.2026 14:00:00' });

    const output = consoleSpy.mock.calls.flat().join('\n');
    expect(output).toContain('6');
  });

  it('handles mixed items', () => {
    const bottles = buildItems(machineTag, 'bottle', 2);
    const cans = buildItems(machineTag, 'can', 3);
    expect(() =>
      printReceipt({ items: [...bottles, ...cans], date: '17.03.2026 14:00:00' })
    ).not.toThrow();
  });
});
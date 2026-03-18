import { printReceipt } from './voucherService.js';
import { buildItems } from './depositService.js';
import { runMigrations } from '../db/migrations.js';

beforeAll(() => {
  runMigrations();
});

const machineTag = 'TEST-MACHINE';

describe('printReceipt', () => {
  let consoleSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  it('prints without throwing', () => {
    const items = buildItems(machineTag, 'bottle', 2);
    expect(() =>
      printReceipt({ machineName: machineTag, items, date: '17.03.2026 14:00:00' })
    ).not.toThrow();
  });

  it('includes machine name in output', () => {
    const items = buildItems(machineTag, 'can', 1);
    printReceipt({ machineName: 'OSLO-42', items, date: '17.03.2026 14:00:00' });

    const output = consoleSpy.mock.calls.flat().join('\n');
    expect(output).toContain('OSLO-42');
  });

  it('includes total refund in output', () => {
    const items = buildItems(machineTag, 'bottle', 2); // 2 x 3 kr = 6 kr
    printReceipt({ machineName: machineTag, items, date: '17.03.2026 14:00:00' });

    const output = consoleSpy.mock.calls.flat().join('\n');
    expect(output).toContain('6');
  });

  it('includes item type in output', () => {
    const items = buildItems(machineTag, 'can', 1);
    printReceipt({ machineName: machineTag, items, date: '17.03.2026 14:00:00' });

    const output = consoleSpy.mock.calls.flat().join('\n');
    expect(output).toContain('aluminium');
  });

  it('handles mixed items', () => {
    const bottles = buildItems(machineTag, 'bottle', 2);
    const cans = buildItems(machineTag, 'can', 3);
    expect(() =>
      printReceipt({ machineName: machineTag, items: [...bottles, ...cans], date: '17.03.2026 14:00:00' })
    ).not.toThrow();
  });
});
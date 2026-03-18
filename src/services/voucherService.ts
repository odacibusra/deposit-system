import { DepositItem, DEPOSIT_VALUES, ItemType } from '../models/item.js';

interface ReceiptData {
  machineName: string;
  items: DepositItem[];
  date: string;
}

interface ItemSummary {
  count: number;
  unitValue: number;
  total: number;
}

function buildSummary(items: DepositItem[]): Record<ItemType, ItemSummary> {
  const summary = {} as Record<ItemType, ItemSummary>;

  for (const item of items) {
    if (!summary[item.type]) {
      summary[item.type] = {
        count: 0,
        unitValue: DEPOSIT_VALUES[item.type],
        total: 0,
      };
    }
    summary[item.type].count++;
    summary[item.type].total += item.depositValue;
  }

  return summary;
}

export function printReceipt({ machineName, items, date }: ReceiptData): void {
  const summary = buildSummary(items);
  const grandTotal = items.reduce((sum, i) => sum + i.depositValue, 0);
  const width = 38;
  const line = '─'.repeat(width);
  const doubleLine = '═'.repeat(width);

  const center = (text: string) => {
    const padding = Math.max(0, Math.floor((width - text.length) / 2));
    return ' '.repeat(padding) + text;
  };

  const row = (label: string, value: string) =>
    `  ${label.padEnd(width - value.length - 2)}${value}`;

  console.log(`
${doubleLine}
${center('DEPOSIT RECEIPT')}
${doubleLine}
${center(date)}
${line}
${center('ITEMS ACCEPTED')}
${line}`);

  for (const [type, s] of Object.entries(summary)) {
    const label = type.replace('_', ' ');
    const detail = `${s.count} x ${s.unitValue / 100} kr`;
    const total = `${s.total / 100} kr`;
    console.log(row(`  ${label}`, ''));
    console.log(row(`    ${detail}`, total));
  }

  console.log(`${line}`);
  console.log(row('  TOTAL REFUND', `${grandTotal / 100} kr`));
  console.log(`${doubleLine}\n`);
}
import { DepositItem, PROCESSING_RATES } from '../models/item.js';

interface ProcessingResult {
  processed: DepositItem[];
  totalValue: number;
}

export async function processItems(
  items: DepositItem[],
  onItemProcessed: (item: DepositItem, index: number, total: number) => void
): Promise<ProcessingResult> {
  const processed: DepositItem[] = [];

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (!item) continue;
    const ratePerSecond = PROCESSING_RATES[item.type];
    const delayMs = (1 / ratePerSecond) * 1000;

    //delay to simulate processing time
    await new Promise(res => setTimeout(res, delayMs));

    processed.push(item);
    onItemProcessed(item, i + 1, items.length);
  }

  const totalValue = processed.reduce((sum, i) => sum + i.depositValue, 0);
  return { processed, totalValue };
}
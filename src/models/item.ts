export type ItemType = 'bottle' | 'can';

export interface DepositItem {
  id: string;
  type: ItemType;
  depositValue: number;
  machineTag: string;
  createdAt: string;
}

export type LogEvent =
  | 'DEPOSIT_STARTED'
  | 'ITEM_ACCEPTED'
  | 'DEPOSIT_COMPLETED'
  | 'REFUND_ISSUED'
  | 'REFUND_CANCELLED';

export interface Log {
  id: string;
  machineTag: string;
  event: LogEvent;
  details: string | null;
  createdAt: string;
}

export const ITEM_LABELS: Record<ItemType, string> = {
  bottle: 'Bottle',
  can: 'Can',
};

export const DEPOSIT_VALUES: Record<ItemType, number> = {
  bottle: 300, // 3 kr
  can: 200, // 2 kr
};

export const PROCESSING_RATES: Record<ItemType, number> = {
  bottle: 1, // 1 items/s
  can: 0.5, // 0.5 items/s
};

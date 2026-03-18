import inquirer from 'inquirer';
import { v4 as uuidv4 } from 'uuid';
import {
    ITEM_LABELS,
    ItemType,
    PROCESSING_RATES
} from '../models/item.js';
import {
    buildItems,
    getAndClearDeposits,
    getHistory,
    saveDeposit
} from '../services/depositService.js';
import { log } from '../services/logService.js';
import { processItems } from '../services/processorService.js';
import { printReceipt } from '../services/voucherService.js';

async function handleDeposit(machineTag: string) {
    const { types } = await inquirer.prompt([
        {
            type: 'checkbox',
            name: 'types',
            message: 'What is the customer depositing?',
            choices: Object.entries(ITEM_LABELS).map(([value, name]) => ({ name, value })),
            validate: (v: string[]) => v.length > 0 || 'Select at least one item type',
        },
    ]);

    const counts: { type: ItemType; count: number }[] = [];

    for (const type of types) {
        const { count } = await inquirer.prompt([
            {
                type: 'number',
                name: 'count',
                message: `How many ${type.replace('_', ' ')}s?`,
                default: 1,
                validate: (v: number) =>
                    (v > 0 && Number.isInteger(v)) || 'Must be a positive whole number',
            },
        ]);
        counts.push({ type, count });
    }

    const allItems = counts.flatMap(({ type, count }) =>
        buildItems(machineTag, type as ItemType, count)
    );

    const totalSeconds = counts.reduce((sum, { type, count }) => {
        return sum + count / PROCESSING_RATES[type as ItemType];
    }, 0);

    console.log(`\n  Estimated processing time: ${totalSeconds}s\n`);
    log(machineTag, 'DEPOSIT_STARTED', `Started processing ${allItems.length} item(s)`);

    const { processed, totalValue } = await processItems(
        allItems,
        (item, index, total) => {
            saveDeposit(item);
            console.log(
                `${index}/${total} — ${item.type.replace('_', ' ')} accepted (${item.depositValue / 100} kr)`
            );
            log(machineTag, 'ITEM_ACCEPTED', `Accepted ${item.type} (${item.depositValue / 100} kr)`);
        }
    );

    console.log(
        `\n Done! ${processed.length} item(s) processed — total value: ${totalValue / 100} kr\n`
    );
}

async function handleRefund(machineTag: string) {
    const items = getAndClearDeposits(machineTag);

    if (!items.length) {
        console.log('No deposits to refund.\n');
        return;
    }

    const total = items.reduce((sum, i) => sum + i.depositValue, 0);

    const { confirm } = await inquirer.prompt([
        {
            type: 'confirm',
            name: 'confirm',
            message: `${items.length} item(s) deposited. Issue refund of ${total / 100} kr?`,
            default: true,
        },
    ]);

    if (!confirm) {
        console.log('Refund cancelled.\n');
        log(machineTag, 'REFUND_CANCELLED', `Refund cancelled for ${items.length} item(s), total ${total / 100} kr`);
        return;
    }

    printReceipt({
        items,
        date: new Date().toLocaleString('nb-NO'),
    });
    log(machineTag, 'REFUND_ISSUED', `Issued refund for ${items.length} item(s), total ${total / 100} kr`);
}

async function handleHistory(machineTag: string) {
    const history = getHistory(machineTag);

    if (!history.length) {
        console.log('No deposit history.\n');
        return;
    }

    console.log('\n── Deposit History ──────────────────────────');
    history.forEach(d =>
        console.log(`  [${new Date(d.createdAt).toLocaleString('nb-NO')}] ${d.event} - ${d.details || ''}`)
    );
}

async function main() {
    console.log('\n Deposit System\n');

    //const machineTag = await getMachineTag();
    const machineTag = uuidv4();
    console.log(`\n Running as machine: ${machineTag}\n`);

    while (true) {
        const { action } = await inquirer.prompt([
            {
                type: 'list',
                name: 'action',
                message: 'What do you want to do?',
                choices: [
                    { name: 'Deposit items', value: 'deposit' },
                    { name: 'Get refund', value: 'refund' },
                    { name: 'View history', value: 'history' },
                    new inquirer.Separator(),
                    { name: 'Exit', value: 'exit' },
                ],
            },
        ]);

        if (action === 'exit') {
            process.exit(0);
        }

        const handlers: Record<string, () => Promise<void>> = {
            deposit: () => handleDeposit(machineTag).catch(console.error)
                .finally(() => log(machineTag, 'DEPOSIT_COMPLETED', 'Deposit process completed')),
            refund: () => handleRefund(machineTag).catch(console.error),
            history: () => handleHistory(machineTag).catch(console.error),
        };

        if (!handlers[action]) {
            console.log('Unknown action. Please try again.\n');
            continue;
        }

        await handlers[action]();
    }
}

main().catch(console.error);
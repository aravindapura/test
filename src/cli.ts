import { FinanceTracker } from './financeTracker.js';
import { Transaction } from './types.js';

interface CliOptions {
  [key: string]: string | undefined;
}

function parseOptions(args: string[]): CliOptions {
  const options: CliOptions = {};

  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];
    if (!arg.startsWith('--')) {
      continue;
    }

    const key = arg.slice(2);
    const value = args[i + 1];
    if (value && !value.startsWith('--')) {
      options[key] = value;
      i += 1;
    } else {
      options[key] = 'true';
    }
  }

  return options;
}

function printTransactions(transactions: Transaction[]): void {
  if (transactions.length === 0) {
    console.log('Нет операций. Добавьте доход или расход через команду add-income/add-expense.');
    return;
  }

  for (const transaction of transactions) {
    const sign = transaction.type === 'income' ? '+' : '-';
    console.log(
      `${transaction.id} | ${transaction.date} | ${transaction.category} | ${sign}${transaction.amount} | ${transaction.description ?? ''}`.trim(),
    );
  }
}

function printSummary(summary: { category: string; total: number }[]): void {
  if (summary.length === 0) {
    console.log('Сводка пуста. Добавьте операции, чтобы увидеть статистику.');
    return;
  }

  for (const entry of summary) {
    const sign = entry.total >= 0 ? '+' : '';
    console.log(`${entry.category}: ${sign}${entry.total}`);
  }
}

function printHelp(): void {
  console.log(`Использование: npm run start -- <команда> [опции]\n\nКоманды:\n  list                 Показать все операции\n  balance              Показать текущий баланс\n  summary              Показать сводку по категориям\n  add-income           Добавить доход\n  add-expense          Добавить расход\n\nОпции для add-income/add-expense:\n  --amount <число>     Сумма операции (обязательный параметр)\n  --category <текст>   Категория операции (обязательный параметр)\n  --description <текст>Описание операции (опционально)\n  --date <ISO-строка>  Дата операции (по умолчанию сейчас)\n`);
}

async function handleList(): Promise<void> {
  const tracker = await FinanceTracker.init();
  const transactions = tracker.getTransactions();
  printTransactions(transactions);
}

async function handleBalance(): Promise<void> {
  const tracker = await FinanceTracker.init();
  const balance = tracker.getBalance();
  console.log(`Текущий баланс: ${balance}`);
}

async function handleSummary(): Promise<void> {
  const tracker = await FinanceTracker.init();
  const summary = tracker.getSummaryByCategory();
  printSummary(summary);
}

function extractTransactionOptions(options: CliOptions) {
  const amountRaw = options.amount;
  const category = options.category;
  const description = options.description;
  const date = options.date;

  if (!amountRaw) {
    throw new Error('Укажите сумму через --amount.');
  }
  const amount = Number(amountRaw);
  if (!Number.isFinite(amount)) {
    throw new Error('Сумма должна быть числом.');
  }

  if (!category) {
    throw new Error('Укажите категорию через --category.');
  }

  return { amount, category, description, date };
}

async function handleAdd(type: 'income' | 'expense', args: string[]): Promise<void> {
  const options = parseOptions(args);
  const tracker = await FinanceTracker.init();
  const payload = extractTransactionOptions(options);
  const transaction =
    type === 'income'
      ? await tracker.addIncome(payload)
      : await tracker.addExpense(payload);

  console.log('Операция сохранена:');
  printTransactions([transaction]);
}

async function main() {
  const [, , rawCommand, ...rest] = process.argv;
  if (!rawCommand || rawCommand === 'help' || rawCommand === '--help' || rawCommand === '-h') {
    printHelp();
    return;
  }

  switch (rawCommand) {
    case 'list':
      await handleList();
      break;
    case 'balance':
      await handleBalance();
      break;
    case 'summary':
      await handleSummary();
      break;
    case 'add-income':
      await handleAdd('income', rest);
      break;
    case 'add-expense':
      await handleAdd('expense', rest);
      break;
    default:
      console.error(`Неизвестная команда: ${rawCommand}`);
      printHelp();
      process.exit(1);
  }
}

main().catch((error) => {
  console.error('Ошибка:', error instanceof Error ? error.message : error);
  process.exit(1);
});

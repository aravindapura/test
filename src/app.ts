import { createInterface } from 'readline/promises';
import { FinanceTracker } from './financeTracker.js';
import type { SummaryEntry, Transaction } from './types.js';

async function promptMenu(): Promise<string> {
  console.log('\nВыберите действие:');
  console.log('1. Добавить доход');
  console.log('2. Добавить расход');
  console.log('3. Показать все операции');
  console.log('4. Показать баланс');
  console.log('5. Показать сводку по категориям');
  console.log('0. Выход');

  const answer = await ask('Ваш выбор: ');
  return answer.trim();
}

const rl = createInterface({ input: process.stdin, output: process.stdout });

async function ask(question: string): Promise<string> {
  const response = await rl.question(question);
  return response;
}

function formatTransaction(transaction: Transaction): string {
  const sign = transaction.type === 'income' ? '+' : '-';
  const formattedAmount = `${sign}${transaction.amount}`;
  const description = transaction.description ? ` | ${transaction.description}` : '';
  return `${transaction.date} | ${transaction.category} | ${formattedAmount}${description}`;
}

function printTransactions(transactions: Transaction[]): void {
  if (transactions.length === 0) {
    console.log('Операции отсутствуют. Добавьте доход или расход.');
    return;
  }

  console.log('\nСписок операций:');
  for (const transaction of transactions) {
    console.log(`- ${formatTransaction(transaction)}`);
  }
}

function printSummary(summary: SummaryEntry[]): void {
  if (summary.length === 0) {
    console.log('Сводка пуста. Добавьте операции для анализа.');
    return;
  }

  console.log('\nСводка по категориям:');
  for (const entry of summary) {
    const sign = entry.total >= 0 ? '+' : '';
    console.log(`- ${entry.category}: ${sign}${entry.total}`);
  }
}

async function promptAmount(): Promise<number> {
  while (true) {
    const value = (await ask('Введите сумму: ')).trim();
    const parsed = Number(value);
    if (Number.isFinite(parsed) && parsed > 0) {
      return parsed;
    }

    console.log('Сумма должна быть положительным числом.');
  }
}

async function promptCategory(): Promise<string> {
  while (true) {
    const value = (await ask('Введите категорию: ')).trim();
    if (value.length > 0) {
      return value;
    }

    console.log('Категория не может быть пустой.');
  }
}

async function promptOptional(question: string): Promise<string | undefined> {
  const value = (await ask(question)).trim();
  return value.length > 0 ? value : undefined;
}

async function handleAddIncome(tracker: FinanceTracker): Promise<void> {
  console.log('\nДобавление дохода');
  const amount = await promptAmount();
  const category = await promptCategory();
  const description = await promptOptional('Описание (необязательно): ');
  const date = await promptOptional('Дата в формате ISO (необязательно): ');

  try {
    const transaction = await tracker.addIncome({ amount, category, description, date });
    console.log('Доход сохранён:');
    console.log(`- ${formatTransaction(transaction)}`);
  } catch (error) {
    console.log('Не удалось сохранить доход:', error instanceof Error ? error.message : error);
  }
}

async function handleAddExpense(tracker: FinanceTracker): Promise<void> {
  console.log('\nДобавление расхода');
  const amount = await promptAmount();
  const category = await promptCategory();
  const description = await promptOptional('Описание (необязательно): ');
  const date = await promptOptional('Дата в формате ISO (необязательно): ');

  try {
    const transaction = await tracker.addExpense({ amount, category, description, date });
    console.log('Расход сохранён:');
    console.log(`- ${formatTransaction(transaction)}`);
  } catch (error) {
    console.log('Не удалось сохранить расход:', error instanceof Error ? error.message : error);
  }
}

async function showTransactions(tracker: FinanceTracker): Promise<void> {
  const transactions = tracker.getTransactions();
  printTransactions(transactions);
}

async function showBalance(tracker: FinanceTracker): Promise<void> {
  const balance = tracker.getBalance();
  console.log(`\nТекущий баланс: ${balance}`);
}

async function showSummary(tracker: FinanceTracker): Promise<void> {
  const summary = tracker.getSummaryByCategory();
  printSummary(summary);
}

async function main() {
  console.log('Простое приложение для учёта финансов. Данные сохраняются в файле data/finance-data.json.');
  const tracker = await FinanceTracker.init();

  let exit = false;
  while (!exit) {
    const choice = await promptMenu();

    switch (choice) {
      case '1':
        await handleAddIncome(tracker);
        break;
      case '2':
        await handleAddExpense(tracker);
        break;
      case '3':
        await showTransactions(tracker);
        break;
      case '4':
        await showBalance(tracker);
        break;
      case '5':
        await showSummary(tracker);
        break;
      case '0':
        exit = true;
        break;
      default:
        console.log('Неизвестная команда. Попробуйте снова.');
    }
  }

  rl.close();
  console.log('До встречи!');
}

main().catch((error) => {
  console.error('Неожиданная ошибка:', error instanceof Error ? error.message : error);
  rl.close();
  process.exit(1);
});

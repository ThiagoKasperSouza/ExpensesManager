export type PaymentMethod = 'CREDIT_CARD' | 'DEBIT_CARD' | 'PIX';

export type Expense = {
  id: number;
  description: string;
  value: number;
  date: string;
  paymentMethod: PaymentMethod;
  expenseType: 'FIXED' | 'VARIABLE';
};

export const mockExpenses: Expense[] = [
  {
    id: 1,
    description: 'Almoço1',
    value: 50,
    date: '2026-11-01',
    paymentMethod: 'PIX',
    expenseType: 'VARIABLE',
  },
  {
    id: 2,
    description: 'Almoço2',
    value: 30,
    date: '2026-11-05',
    paymentMethod: 'PIX',
    expenseType: 'VARIABLE',
  },
  {
    id: 3,
    description: 'Almoço3',
    value: 100,
    date: '2026-11-07',
    paymentMethod: 'PIX',
    expenseType: 'VARIABLE',
  },
];

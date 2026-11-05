import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import type { PropsWithChildren } from 'react';
import {
  createExpense as createExpenseRequest,
  getCsrfToken,
  login,
  logout,
  register,
} from '../services/expensesApi';
import { mockExpenses, type Expense } from '../mocks/expenses';
import type { ExpenseInput } from '../services/expensesApi';

type SessionContextValue = {
  isAuthenticated: boolean;
  expenses: Expense[];
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  addExpense: (input: ExpenseInput) => Promise<void>;
  signOut: () => Promise<void>;
};

const SessionContext = createContext<SessionContextValue | undefined>(
  undefined,
);

export function SessionProvider({ children }: PropsWithChildren) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [csrfToken, setCsrfToken] = useState<string>();
  const [expenses, setExpenses] = useState<Expense[]>(mockExpenses);

  const establishSession = useCallback(async () => {
    const token = await getCsrfToken();
    setCsrfToken(token);
    setIsAuthenticated(true);
  }, []);

  const signIn = useCallback(
    async (email: string, password: string) => {
      await login(email, password);
      await establishSession();
    },
    [establishSession],
  );

  const signUp = useCallback(
    async (name: string, email: string, password: string) => {
      await register(name, email, password);
      await login(email, password);
      await establishSession();
    },
    [establishSession],
  );

  const addExpense = useCallback(
    async (input: ExpenseInput) => {
      if (!csrfToken || !isAuthenticated) {
        throw new Error('Faça login novamente para cadastrar uma despesa.');
      }

      const savedExpense = await createExpenseRequest(input, csrfToken);
      setExpenses(currentExpenses => [savedExpense, ...currentExpenses]);
    },
    [csrfToken, isAuthenticated],
  );

  const signOut = useCallback(async () => {
    if (!csrfToken || !isAuthenticated) {
      throw new Error('Não há uma sessão ativa para encerrar.');
    }

    await logout(csrfToken);
    setCsrfToken(undefined);
    setIsAuthenticated(false);
  }, [csrfToken, isAuthenticated]);

  const value = useMemo(
    () => ({
      isAuthenticated,
      expenses,
      signIn,
      signUp,
      addExpense,
      signOut,
    }),
    [isAuthenticated, expenses, signIn, signUp, addExpense, signOut],
  );

  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
}

export function useSession() {
  const context = useContext(SessionContext);

  if (!context) {
    throw new Error('useSession must be used within a SessionProvider');
  }

  return context;
}

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
  getExpenses,
  login,
  logout,
  register,
} from '../services/expensesApi';
import type { Expense } from '../mocks/expenses';
import type { ExpenseInput } from '../services/expensesApi';

type SessionContextValue = {
  isAuthenticated: boolean;
  expenses: Expense[];
  isLoadingExpenses: boolean;
  expensesError: string | undefined;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  addExpense: (input: ExpenseInput) => Promise<void>;
  refreshExpenses: () => Promise<void>;
  signOut: () => Promise<void>;
};

const SessionContext = createContext<SessionContextValue | undefined>(
  undefined,
);

export function SessionProvider({ children }: PropsWithChildren) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [csrfToken, setCsrfToken] = useState<string>();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoadingExpenses, setIsLoadingExpenses] = useState(false);
  const [expensesError, setExpensesError] = useState<string>();

  const loadExpenses = useCallback(async () => {
    setIsLoadingExpenses(true);
    setExpensesError(undefined);

    try {
      const loadedExpenses = await getExpenses();
      setExpenses(loadedExpenses);
    } catch (error) {
      setExpensesError(
        error instanceof Error
          ? error.message
          : 'Não foi possível carregar as despesas.',
      );
    } finally {
      setIsLoadingExpenses(false);
    }
  }, []);

  const establishSession = useCallback(async () => {
    const token = await getCsrfToken();
    setCsrfToken(token);
    setIsAuthenticated(true);
    await loadExpenses();
  }, [loadExpenses]);

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

  const refreshExpenses = useCallback(async () => {
    if (!csrfToken || !isAuthenticated) {
      throw new Error('Faça login novamente para carregar as despesas.');
    }

    await loadExpenses();
  }, [csrfToken, isAuthenticated, loadExpenses]);

  const signOut = useCallback(async () => {
    if (!csrfToken || !isAuthenticated) {
      throw new Error('Não há uma sessão ativa para encerrar.');
    }

    await logout(csrfToken);
    setCsrfToken(undefined);
    setIsAuthenticated(false);
    setExpenses([]);
    setExpensesError(undefined);
  }, [csrfToken, isAuthenticated]);

  const value = useMemo(
    () => ({
      isAuthenticated,
      expenses,
      isLoadingExpenses,
      expensesError,
      signIn,
      signUp,
      addExpense,
      refreshExpenses,
      signOut,
    }),
    [
      isAuthenticated,
      expenses,
      isLoadingExpenses,
      expensesError,
      signIn,
      signUp,
      addExpense,
      refreshExpenses,
      signOut,
    ],
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

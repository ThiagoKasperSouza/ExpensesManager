import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type { PropsWithChildren } from 'react';

function getCurrentMonthKey() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

function getIncomeStorageKey(month: string) {
  return `monthly-income:${month}`;
}

type MonthlyBudgetContextValue = {
  month: string;
  monthlyIncome: number | null;
  isLoadingIncome: boolean;
  incomeError: string | undefined;
  saveMonthlyIncome: (amount: number) => Promise<void>;
};

const MonthlyBudgetContext = createContext<
  MonthlyBudgetContextValue | undefined
>(undefined);

export function MonthlyBudgetProvider({ children }: PropsWithChildren) {
  const [month, setMonth] = useState(getCurrentMonthKey);
  const [monthlyIncome, setMonthlyIncome] = useState<number | null>(null);
  const [isLoadingIncome, setIsLoadingIncome] = useState(true);
  const [incomeError, setIncomeError] = useState<string>();

  useEffect(() => {
    const monthCheck = setInterval(() => {
      setMonth(getCurrentMonthKey());
    }, 60_000);

    return () => clearInterval(monthCheck);
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function loadMonthlyIncome() {
      try {
        const storedIncome = await AsyncStorage.getItem(
          getIncomeStorageKey(month),
        );

        if (storedIncome === null) {
          return;
        }

        const parsedIncome: unknown = JSON.parse(storedIncome);
        if (
          typeof parsedIncome !== 'number' ||
          !Number.isFinite(parsedIncome) ||
          parsedIncome <= 0
        ) {
          throw new Error('O valor de receita salvo está inválido.');
        }

        if (isMounted) {
          setMonthlyIncome(parsedIncome);
        }
      } catch (error) {
        if (isMounted) {
          setIncomeError(
            error instanceof Error
              ? error.message
              : 'Não foi possível carregar a receita mensal.',
          );
        }
      } finally {
        if (isMounted) {
          setIsLoadingIncome(false);
        }
      }
    }

    loadMonthlyIncome();

    return () => {
      isMounted = false;
    };
  }, [month]);

  const saveMonthlyIncome = useCallback(
    async (amount: number) => {
      if (!Number.isFinite(amount) || amount <= 0) {
        throw new Error('Informe uma receita válida maior que zero.');
      }

      await AsyncStorage.setItem(
        getIncomeStorageKey(month),
        JSON.stringify(amount),
      );
      setMonthlyIncome(amount);
      setIncomeError(undefined);
    },
    [month],
  );

  const value = useMemo(
    () => ({
      month,
      monthlyIncome,
      isLoadingIncome,
      incomeError,
      saveMonthlyIncome,
    }),
    [month, monthlyIncome, isLoadingIncome, incomeError, saveMonthlyIncome],
  );

  return (
    <MonthlyBudgetContext.Provider value={value}>
      {children}
    </MonthlyBudgetContext.Provider>
  );
}

export function useMonthlyBudget() {
  const context = useContext(MonthlyBudgetContext);

  if (!context) {
    throw new Error(
      'useMonthlyBudget must be used within a MonthlyBudgetProvider',
    );
  }

  return context;
}

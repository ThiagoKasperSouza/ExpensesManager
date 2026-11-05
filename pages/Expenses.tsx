import {
  AntDesign,
  type AntDesignIconName,
} from '@react-native-vector-icons/ant-design';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { ExpenseFormModal } from '../components/ExpenseFormModal';
import { useAppTheme } from '../contexts/ThemeContext';
import { useSession } from '../contexts/SessionContext';
import type { Expense } from '../mocks/expenses';

const categoryIcons: AntDesignIconName[] = [
  'coffee',
  'shopping',
  'car',
  'wallet',
];

const categoryColors = ['#F6D7B8', '#C9E9D5', '#F6D1CC', '#D6DDF8'];

const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

const dateFormatter = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: 'long',
});

function formatDate(date: string) {
  const [year, month, day] = date.split('-').map(Number);
  return dateFormatter.format(new Date(year, month - 1, day));
}

function groupExpensesByDate(expenses: Expense[]) {
  return Object.entries(
    expenses.reduce<Record<string, Expense[]>>((groups, expense) => {
      (groups[expense.date] ??= []).push(expense);
      return groups;
    }, {}),
  ).sort(([dateA], [dateB]) => dateB.localeCompare(dateA));
}

export function Expenses() {
  const { colors } = useAppTheme();
  const { expenses } = useSession();
  const [isFormVisible, setIsFormVisible] = useState(false);
  const groupedExpenses = useMemo(
    () => groupExpensesByDate(expenses),
    [expenses],
  );
  const total = expenses.reduce((sum, expense) => sum + expense.value, 0);

  return (
    <>
      <ScrollView
        style={[styles.screen, { backgroundColor: colors.background }]}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View>
            <Text style={[styles.eyebrow, { color: colors.muted }]}>
              SEU CONTROLE FINANCEIRO
            </Text>
            <Text style={[styles.title, { color: colors.text }]}>Despesas</Text>
          </View>
          <Pressable
            accessibilityLabel="Cadastrar despesa"
            accessibilityRole="button"
            onPress={() => setIsFormVisible(true)}
            style={[styles.addButton, { backgroundColor: colors.primary }]}
          >
            <AntDesign name="plus" size={18} color="#FFFFFF" />
            <Text style={styles.addButtonText}>Nova despesa</Text>
          </Pressable>
        </View>

        <View style={[styles.summaryCard, { backgroundColor: colors.surface }]}>
          <View style={styles.summaryTop}>
            <View>
              <Text style={[styles.summaryLabel, { color: colors.muted }]}>
                Total registrado
              </Text>
              <Text style={[styles.total, { color: colors.text }]}>
                {currencyFormatter.format(total)}
              </Text>
            </View>
            <View
              style={[
                styles.summaryIcon,
                { backgroundColor: `${colors.primary}18` },
              ]}
            >
              <AntDesign name="wallet" size={22} color={colors.primary} />
            </View>
          </View>
          <View
            style={[styles.summaryDivider, { backgroundColor: colors.border }]}
          />
          <View style={styles.summaryFooter}>
            <View style={styles.summaryMetric}>
              <AntDesign name="profile" size={14} color={colors.muted} />
              <Text style={[styles.metricText, { color: colors.muted }]}>
                {expenses.length} lançamentos
              </Text>
            </View>
            <View
              style={[
                styles.variableBadge,
                { backgroundColor: `${colors.primary}18` },
              ]}
            >
              <Text style={[styles.variableText, { color: colors.primary }]}>
                Variáveis
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.listHeading}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Histórico
          </Text>
          <Text style={[styles.listCount, { color: colors.muted }]}>
            {expenses.length} itens
          </Text>
        </View>

        {groupedExpenses.map(([date, dateExpenses]) => (
          <View key={date} style={styles.dateGroup}>
            <View style={styles.dateHeading}>
              <View
                style={[styles.dateDot, { backgroundColor: colors.primary }]}
              />
              <Text style={[styles.dateText, { color: colors.text }]}>
                {formatDate(date)}
              </Text>
              <View
                style={[styles.dateLine, { backgroundColor: colors.border }]}
              />
            </View>

            <View style={styles.expenseList}>
              {dateExpenses.map(expense => {
                const colorIndex = (expense.id - 1) % categoryColors.length;

                return (
                  <View
                    key={expense.id}
                    style={[
                      styles.expenseCard,
                      {
                        backgroundColor: colors.surface,
                        borderColor: colors.border,
                      },
                    ]}
                  >
                    <View
                      style={[
                        styles.categoryIcon,
                        { backgroundColor: categoryColors[colorIndex] },
                      ]}
                    >
                      <AntDesign
                        name={categoryIcons[colorIndex]}
                        size={19}
                        color="#433B35"
                      />
                    </View>
                    <View style={styles.expenseDetails}>
                      <Text
                        numberOfLines={1}
                        style={[styles.expenseName, { color: colors.text }]}
                      >
                        {expense.description}
                      </Text>
                      <View style={styles.expenseMetadata}>
                        <Text
                          style={[styles.metadataText, { color: colors.muted }]}
                        >
                          {expense.paymentMethod}
                        </Text>
                        <View
                          style={[
                            styles.metadataDot,
                            { backgroundColor: categoryColors[colorIndex] },
                          ]}
                        />
                        <Text
                          style={[styles.metadataText, { color: colors.muted }]}
                        >
                          {expense.expenseType === 'VARIABLE'
                            ? 'Variável'
                            : 'Fixa'}
                        </Text>
                      </View>
                    </View>
                    <Text
                      style={[styles.expenseAmount, { color: colors.text }]}
                    >
                      −{currencyFormatter.format(expense.value)}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>
        ))}
      </ScrollView>
      <ExpenseFormModal
        visible={isFormVisible}
        onClose={() => setIsFormVisible(false)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 150,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 22,
  },
  addButton: {
    alignItems: 'center',
    borderRadius: 13,
    flexDirection: 'row',
    gap: 7,
    paddingHorizontal: 12,
    paddingVertical: 11,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  eyebrow: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.2,
    marginBottom: 5,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  headerIcon: {
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  summaryCard: {
    borderRadius: 22,
    marginBottom: 30,
    padding: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  summaryTop: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryLabel: {
    fontSize: 13,
    marginBottom: 7,
  },
  total: {
    fontSize: 30,
    fontWeight: '800',
    letterSpacing: -0.6,
  },
  summaryIcon: {
    alignItems: 'center',
    borderRadius: 16,
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  summaryDivider: {
    height: StyleSheet.hairlineWidth,
    marginBottom: 14,
    marginTop: 18,
  },
  summaryFooter: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryMetric: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 7,
  },
  metricText: {
    fontSize: 12,
    fontWeight: '500',
  },
  variableBadge: {
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  variableText: {
    fontSize: 11,
    fontWeight: '700',
  },
  listHeading: {
    alignItems: 'baseline',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  sectionTitle: {
    fontSize: 19,
    fontWeight: '700',
  },
  listCount: {
    fontSize: 12,
  },
  dateGroup: {
    marginBottom: 20,
  },
  dateHeading: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    marginBottom: 11,
  },
  dateDot: {
    borderRadius: 4,
    height: 8,
    width: 8,
  },
  dateText: {
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  dateLine: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    marginLeft: 4,
  },
  expenseList: {
    gap: 10,
  },
  expenseCard: {
    alignItems: 'center',
    borderRadius: 17,
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    minHeight: 76,
    paddingHorizontal: 13,
    paddingVertical: 12,
  },
  categoryIcon: {
    alignItems: 'center',
    borderRadius: 13,
    height: 44,
    justifyContent: 'center',
    marginRight: 12,
    width: 44,
  },
  expenseDetails: {
    flex: 1,
    marginRight: 8,
  },
  expenseName: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 6,
  },
  expenseMetadata: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  metadataText: {
    fontSize: 11,
    fontWeight: '500',
  },
  metadataDot: {
    borderRadius: 3,
    height: 6,
    width: 6,
  },
  expenseAmount: {
    fontSize: 13,
    fontWeight: '700',
  },
});

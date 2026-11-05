import {
  AntDesign,
  type AntDesignIconName,
} from '@react-native-vector-icons/ant-design';
import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useAppTheme } from '../contexts/ThemeContext';
import { useSession } from '../contexts/SessionContext';
import type { Expense } from '../mocks/expenses';

const categoryColors = ['#F3A66B', '#67BFA4', '#E67578', '#7C91E8', '#D18BC8'];
const categoryIcons: AntDesignIconName[] = [
  'coffee',
  'shopping',
  'car',
  'wallet',
  'gift',
];

const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

type ExpenseGroup = {
  description: string;
  total: number;
  count: number;
};

function getExpenseGroups(expenses: Expense[]) {
  const groups = expenses.reduce<Record<string, ExpenseGroup>>(
    (result, expense) => {
      const description = expense.description.replace(/\d+$/, '');
      const group = (result[description] ??= {
        description,
        total: 0,
        count: 0,
      });
      group.total += expense.value;
      group.count += 1;
      return result;
    },
    {},
  );

  return Object.values(groups).sort((a, b) => b.total - a.total);
}

function getPeriodLabel(expenses: Expense[]) {
  const latestDate = expenses
    .map(expense => expense.date)
    .sort()
    .at(-1);

  if (!latestDate) {
    return 'Sem lançamentos';
  }

  const [year, month] = latestDate.split('-').map(Number);
  return new Intl.DateTimeFormat('pt-BR', {
    month: 'long',
    year: 'numeric',
  }).format(new Date(year, month - 1, 1));
}

export function Home() {
  const { colors } = useAppTheme();
  const { expenses } = useSession();
  const [search, setSearch] = useState('');
  const expenseGroups = useMemo(() => getExpenseGroups(expenses), [expenses]);
  const totalExpenses = expenses.reduce(
    (total, expense) => total + expense.value,
    0,
  );
  const visibleGroups = expenseGroups.filter(group =>
    group.description
      .toLocaleLowerCase('pt-BR')
      .includes(search.toLocaleLowerCase('pt-BR')),
  );

  return (
    <ScrollView
      style={[styles.screen, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.header}>
        <View>
          <Text style={[styles.eyebrow, { color: colors.muted }]}>
            RESUMO FINANCEIRO
          </Text>
          <Text style={[styles.title, { color: colors.text }]}>
            Visão geral
          </Text>
        </View>
        <View
          style={[
            styles.periodChip,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <AntDesign name="calendar" size={14} color={colors.primary} />
          <Text style={[styles.periodText, { color: colors.text }]}>
            {getPeriodLabel(expenses)}
          </Text>
        </View>
      </View>

      <View style={styles.metrics}>
        <View style={[styles.metricCard, { backgroundColor: colors.surface }]}>
          <View style={styles.metricHeader}>
            <View
              style={[
                styles.metricIcon,
                { backgroundColor: `${colors.primary}18` },
              ]}
            >
              <AntDesign name="arrow-down" size={16} color={colors.primary} />
            </View>
            <Text style={[styles.metricLabel, { color: colors.muted }]}>
              Despesas
            </Text>
          </View>
          <Text style={[styles.metricValue, { color: colors.text }]}>
            {currencyFormatter.format(totalExpenses)}
          </Text>
          <Text style={[styles.metricCaption, { color: colors.muted }]}>
            {expenses.length} lançamentos
          </Text>
        </View>

        <View style={[styles.metricCard, { backgroundColor: colors.surface }]}>
          <View style={styles.metricHeader}>
            <View style={[styles.metricIcon, styles.incomeIcon]}>
              <AntDesign name="arrow-up" size={16} color="#359B72" />
            </View>
            <Text style={[styles.metricLabel, { color: colors.muted }]}>
              Receitas
            </Text>
          </View>
          <Text style={[styles.metricValue, { color: colors.text }]}>—</Text>
          <Text style={[styles.metricCaption, { color: colors.muted }]}>
            Sem dados cadastrados
          </Text>
        </View>
      </View>

      <View
        style={[
          styles.searchBox,
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}
      >
        <AntDesign name="search" size={17} color={colors.muted} />
        <TextInput
          accessibilityLabel="Buscar despesas"
          value={search}
          onChangeText={setSearch}
          placeholder="Buscar despesa"
          placeholderTextColor={colors.muted}
          style={[styles.searchInput, { color: colors.text }]}
          returnKeyType="search"
        />
      </View>

      <View style={styles.sectionHeader}>
        <View>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Despesas por descrição
          </Text>
          <Text style={[styles.sectionSubtitle, { color: colors.muted }]}>
            Distribuição do total registrado
          </Text>
        </View>
        <View
          style={[
            styles.chartIcon,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <AntDesign name="pie-chart" size={17} color={colors.primary} />
        </View>
      </View>

      <View style={[styles.breakdownCard, { backgroundColor: colors.surface }]}>
        {visibleGroups.length > 0 ? (
          visibleGroups.map((group, index) => {
            const percentage =
              totalExpenses > 0 ? (group.total / totalExpenses) * 100 : 0;
            const color = categoryColors[index % categoryColors.length];

            return (
              <View key={group.description} style={styles.breakdownRow}>
                <View style={styles.breakdownTop}>
                  <View style={styles.categoryName}>
                    <View
                      style={[
                        styles.categoryIcon,
                        { backgroundColor: `${color}25` },
                      ]}
                    >
                      <AntDesign
                        name={categoryIcons[index % categoryIcons.length]}
                        size={15}
                        color={color}
                      />
                    </View>
                    <View style={styles.categoryLabels}>
                      <Text
                        numberOfLines={1}
                        style={[styles.categoryTitle, { color: colors.text }]}
                      >
                        {group.description}
                      </Text>
                      <Text
                        style={[styles.categoryCount, { color: colors.muted }]}
                      >
                        {group.count}{' '}
                        {group.count === 1 ? 'lançamento' : 'lançamentos'}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.amountLabels}>
                    <Text
                      style={[styles.categoryAmount, { color: colors.text }]}
                    >
                      {currencyFormatter.format(group.total)}
                    </Text>
                    <Text style={[styles.percentage, { color: colors.muted }]}>
                      {percentage.toFixed(0)}%
                    </Text>
                  </View>
                </View>
                <View
                  style={[
                    styles.progressTrack,
                    { backgroundColor: colors.background },
                  ]}
                >
                  <View
                    style={[
                      styles.progressFill,
                      { backgroundColor: color, width: `${percentage}%` },
                    ]}
                  />
                </View>
              </View>
            );
          })
        ) : (
          <Text style={[styles.emptyText, { color: colors.muted }]}>
            Nenhuma despesa encontrada.
          </Text>
        )}
      </View>

      <View style={styles.footerNote}>
        <AntDesign name="info-circle" size={14} color={colors.muted} />
        <Text style={[styles.footerText, { color: colors.muted }]}>
          Os valores são calculados com base nos dados disponíveis.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 140,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 22,
  },
  eyebrow: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 5,
  },
  title: {
    fontSize: 25,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  periodChip: {
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    gap: 7,
    maxWidth: '47%',
    paddingHorizontal: 11,
    paddingVertical: 9,
  },
  periodText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  metrics: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  metricCard: {
    borderRadius: 18,
    elevation: 2,
    flex: 1,
    minHeight: 128,
    padding: 14,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  metricHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 7,
    marginBottom: 12,
  },
  metricIcon: {
    alignItems: 'center',
    borderRadius: 10,
    height: 28,
    justifyContent: 'center',
    width: 28,
  },
  incomeIcon: {
    backgroundColor: '#359B7218',
  },
  metricLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  metricValue: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  metricCaption: {
    fontSize: 10,
    marginTop: 5,
  },
  searchBox: {
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    gap: 10,
    height: 48,
    marginBottom: 26,
    paddingHorizontal: 14,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    paddingVertical: 0,
  },
  sectionHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  sectionSubtitle: {
    fontSize: 11,
    marginTop: 4,
  },
  chartIcon: {
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    height: 38,
    justifyContent: 'center',
    width: 38,
  },
  breakdownCard: {
    borderRadius: 18,
    elevation: 2,
    padding: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  breakdownRow: {
    marginBottom: 18,
  },
  breakdownTop: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  categoryName: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    marginRight: 8,
  },
  categoryIcon: {
    alignItems: 'center',
    borderRadius: 10,
    height: 34,
    justifyContent: 'center',
    marginRight: 10,
    width: 34,
  },
  categoryLabels: {
    flex: 1,
  },
  categoryTitle: {
    fontSize: 12,
    fontWeight: '700',
  },
  categoryCount: {
    fontSize: 10,
    marginTop: 3,
  },
  amountLabels: {
    alignItems: 'flex-end',
  },
  categoryAmount: {
    fontSize: 12,
    fontWeight: '700',
  },
  percentage: {
    fontSize: 10,
    marginTop: 3,
  },
  progressTrack: {
    borderRadius: 4,
    height: 7,
    overflow: 'hidden',
  },
  progressFill: {
    borderRadius: 4,
    height: '100%',
  },
  emptyText: {
    fontSize: 13,
    paddingVertical: 16,
    textAlign: 'center',
  },
  footerNote: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 7,
    justifyContent: 'center',
    marginTop: 16,
  },
  footerText: {
    fontSize: 10,
  },
});

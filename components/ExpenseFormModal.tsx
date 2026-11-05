import { AntDesign } from '@react-native-vector-icons/ant-design';
import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useAppTheme } from '../contexts/ThemeContext';
import { useSession } from '../contexts/SessionContext';
import type { Expense, PaymentMethod } from '../mocks/expenses';

type ExpenseFormModalProps = {
  visible: boolean;
  onClose: () => void;
};

const paymentMethods: { value: PaymentMethod; label: string }[] = [
  { value: 'CREDIT_CARD', label: 'Crédito' },
  { value: 'DEBIT_CARD', label: 'Débito' },
  { value: 'PIX', label: 'PIX' },
];

function getTodayISODate() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function parseAmount(value: string) {
  const normalized = value.trim().includes(',')
    ? value.trim().replace(/\./g, '').replace(',', '.')
    : value.trim();
  const amount = Number(normalized);
  return Number.isFinite(amount) && amount > 0 ? amount : undefined;
}

function isValidISODate(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) {
    return false;
  }

  const [, yearText, monthText, dayText] = match;
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);
  const date = new Date(year, month - 1, day);

  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
}

export function ExpenseFormModal({ visible, onClose }: ExpenseFormModalProps) {
  const { colors } = useAppTheme();
  const { addExpense } = useSession();
  const [description, setDescription] = useState('');
  const [value, setValue] = useState('');
  const [date, setDate] = useState(getTodayISODate);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('PIX');
  const [expenseType, setExpenseType] =
    useState<Expense['expenseType']>('VARIABLE');
  const [error, setError] = useState<string>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit() {
    const amount = parseAmount(value);

    if (!description.trim()) {
      setError('Informe a descrição da despesa.');
      return;
    }

    if (!amount) {
      setError('Informe um valor válido maior que zero.');
      return;
    }

    if (!isValidISODate(date)) {
      setError('Informe uma data válida no formato AAAA-MM-DD.');
      return;
    }

    setError(undefined);
    setIsSubmitting(true);

    try {
      await addExpense({
        description: description.trim(),
        value: amount,
        date,
        paymentMethod,
        expenseType,
      });
      setDescription('');
      setValue('');
      setDate(getTodayISODate());
      setPaymentMethod('PIX');
      setExpenseType('VARIABLE');
      onClose();
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'Não foi possível cadastrar a despesa.',
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  const inputStyle = [
    styles.input,
    {
      backgroundColor: colors.background,
      borderColor: colors.border,
      color: colors.text,
    },
  ];

  return (
    <Modal
      animationType="slide"
      onRequestClose={onClose}
      transparent
      visible={visible}
    >
      <View style={styles.overlay}>
        <Pressable
          accessibilityLabel="Fechar formulário"
          accessibilityRole="button"
          disabled={isSubmitting}
          onPress={onClose}
          style={StyleSheet.absoluteFill}
        />
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.keyboardAvoiding}
        >
          <View
            style={[
              styles.sheet,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <View style={styles.sheetHeader}>
              <View>
                <Text style={[styles.title, { color: colors.text }]}>
                  Nova despesa
                </Text>
                <Text style={[styles.subtitle, { color: colors.muted }]}>
                  Preencha os dados do lançamento
                </Text>
              </View>
              <Pressable
                accessibilityLabel="Fechar"
                accessibilityRole="button"
                disabled={isSubmitting}
                hitSlop={8}
                onPress={onClose}
                style={[
                  styles.closeButton,
                  { backgroundColor: colors.background },
                ]}
              >
                <AntDesign name="close" size={16} color={colors.text} />
              </Pressable>
            </View>

            <ScrollView
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <Text style={[styles.label, { color: colors.text }]}>
                Descrição
              </Text>
              <TextInput
                accessibilityLabel="Descrição"
                onChangeText={setDescription}
                placeholder="Ex.: Almoço"
                placeholderTextColor={colors.muted}
                returnKeyType="next"
                style={inputStyle}
                value={description}
              />

              <View style={styles.fieldRow}>
                <View style={styles.halfField}>
                  <Text style={[styles.label, { color: colors.text }]}>
                    Valor (R$)
                  </Text>
                  <TextInput
                    accessibilityLabel="Valor"
                    keyboardType="decimal-pad"
                    onChangeText={setValue}
                    placeholder="0,00"
                    placeholderTextColor={colors.muted}
                    style={inputStyle}
                    value={value}
                  />
                </View>
                <View style={styles.halfField}>
                  <Text style={[styles.label, { color: colors.text }]}>
                    Data
                  </Text>
                  <TextInput
                    accessibilityLabel="Data"
                    onChangeText={setDate}
                    placeholder="AAAA-MM-DD"
                    placeholderTextColor={colors.muted}
                    style={inputStyle}
                    value={date}
                  />
                </View>
              </View>

              <Text style={[styles.label, { color: colors.text }]}>
                Forma de pagamento
              </Text>
              <View style={styles.typeOptions}>
                {paymentMethods.map(method => {
                  const selected = paymentMethod === method.value;

                  return (
                    <Pressable
                      accessibilityRole="button"
                      accessibilityState={{ selected }}
                      key={method.value}
                      onPress={() => setPaymentMethod(method.value)}
                      style={[
                        styles.typeOption,
                        {
                          backgroundColor: selected
                            ? `${colors.primary}18`
                            : colors.background,
                          borderColor: selected
                            ? colors.primary
                            : colors.border,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.typeOptionText,
                          { color: selected ? colors.primary : colors.muted },
                        ]}
                      >
                        {method.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              <Text
                style={[styles.label, styles.typeLabel, { color: colors.text }]}
              >
                Tipo de despesa
              </Text>
              <View style={styles.typeOptions}>
                {(['VARIABLE', 'FIXED'] as const).map(type => {
                  const selected = expenseType === type;
                  return (
                    <Pressable
                      accessibilityRole="button"
                      accessibilityState={{ selected }}
                      key={type}
                      onPress={() => setExpenseType(type)}
                      style={[
                        styles.typeOption,
                        {
                          backgroundColor: selected
                            ? `${colors.primary}18`
                            : colors.background,
                          borderColor: selected
                            ? colors.primary
                            : colors.border,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.typeOptionText,
                          { color: selected ? colors.primary : colors.muted },
                        ]}
                      >
                        {type === 'VARIABLE' ? 'Variável' : 'Fixa'}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              {error ? (
                <Text accessibilityRole="alert" style={styles.error}>
                  {error}
                </Text>
              ) : null}

              <Pressable
                accessibilityRole="button"
                disabled={isSubmitting}
                onPress={handleSubmit}
                style={({ pressed }) => [
                  styles.submitButton,
                  { backgroundColor: colors.primary },
                  (pressed || isSubmitting) && styles.buttonPressed,
                ]}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.submitText}>Salvar despesa</Text>
                )}
              </Pressable>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    backgroundColor: '#00000066',
    flex: 1,
    justifyContent: 'flex-end',
  },
  keyboardAvoiding: {
    maxHeight: '92%',
  },
  sheet: {
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    borderWidth: StyleSheet.hairlineWidth,
    maxHeight: '100%',
    paddingBottom: 24,
    paddingHorizontal: 22,
    paddingTop: 24,
  },
  sheetHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 22,
  },
  title: {
    fontSize: 21,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 12,
    marginTop: 4,
  },
  closeButton: {
    alignItems: 'center',
    borderRadius: 18,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 7,
  },
  input: {
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    fontSize: 14,
    height: 48,
    marginBottom: 16,
    paddingHorizontal: 12,
  },
  fieldRow: {
    flexDirection: 'row',
    gap: 12,
  },
  halfField: {
    flex: 1,
  },
  typeLabel: {
    marginTop: 2,
  },
  typeOptions: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 4,
  },
  typeOption: {
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    flex: 1,
    height: 44,
    justifyContent: 'center',
  },
  typeOptionText: {
    fontSize: 13,
    fontWeight: '700',
  },
  error: {
    color: '#D14343',
    fontSize: 12,
    lineHeight: 18,
    marginTop: 10,
  },
  submitButton: {
    alignItems: 'center',
    borderRadius: 13,
    height: 50,
    justifyContent: 'center',
    marginTop: 18,
  },
  buttonPressed: {
    opacity: 0.78,
  },
  submitText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});

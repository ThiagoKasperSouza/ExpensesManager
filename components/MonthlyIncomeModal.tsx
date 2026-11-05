import { useEffect, useState } from 'react';
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
import { useMonthlyBudget } from '../contexts/MonthlyBudgetContext';

type MonthlyIncomeModalProps = {
  visible: boolean;
  onClose: () => void;
};

function parseAmount(value: string) {
  const normalized = value.trim().includes(',')
    ? value.trim().replace(/\./g, '').replace(',', '.')
    : value.trim();
  const amount = Number(normalized);
  return Number.isFinite(amount) && amount > 0 ? amount : undefined;
}

export function MonthlyIncomeModal({
  visible,
  onClose,
}: MonthlyIncomeModalProps) {
  const { colors } = useAppTheme();
  const { monthlyIncome, month, saveMonthlyIncome } = useMonthlyBudget();
  const [value, setValue] = useState('');
  const [error, setError] = useState<string>();
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (visible) {
      setValue(
        monthlyIncome === null
          ? ''
          : new Intl.NumberFormat('pt-BR', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            }).format(monthlyIncome),
      );
      setError(undefined);
    }
  }, [monthlyIncome, visible]);

  const monthLabel = new Intl.DateTimeFormat('pt-BR', {
    month: 'long',
    year: 'numeric',
  }).format(
    new Date(Number(month.slice(0, 4)), Number(month.slice(5, 7)) - 1, 1),
  );

  async function handleSave() {
    const amount = parseAmount(value);
    if (!amount) {
      setError('Informe uma receita válida maior que zero.');
      return;
    }

    setError(undefined);
    setIsSaving(true);
    try {
      await saveMonthlyIncome(amount);
      onClose();
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : 'Não foi possível salvar a receita.',
      );
    } finally {
      setIsSaving(false);
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
          disabled={isSaving}
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
            <View style={styles.header}>
              <View>
                <Text style={[styles.title, { color: colors.text }]}>
                  Receita mensal
                </Text>
                <Text
                  style={[
                    styles.subtitle,
                    styles.capitalize,
                    { color: colors.muted },
                  ]}
                >
                  {monthLabel}
                </Text>
              </View>
              <Pressable
                accessibilityLabel="Fechar"
                accessibilityRole="button"
                disabled={isSaving}
                hitSlop={8}
                onPress={onClose}
                style={[
                  styles.closeButton,
                  { backgroundColor: colors.background },
                ]}
              >
                <Text style={[styles.closeText, { color: colors.text }]}>
                  ×
                </Text>
              </Pressable>
            </View>

            <ScrollView keyboardShouldPersistTaps="handled">
              <Text style={[styles.label, { color: colors.text }]}>
                Valor da receita (R$)
              </Text>
              <TextInput
                accessibilityLabel="Valor da receita mensal"
                autoFocus
                keyboardType="decimal-pad"
                onChangeText={setValue}
                onSubmitEditing={handleSave}
                placeholder="0,00"
                placeholderTextColor={colors.muted}
                style={inputStyle}
                value={value}
              />
              {error ? (
                <Text accessibilityRole="alert" style={styles.error}>
                  {error}
                </Text>
              ) : null}
              <Pressable
                accessibilityRole="button"
                disabled={isSaving}
                onPress={handleSave}
                style={({ pressed }) => [
                  styles.saveButton,
                  { backgroundColor: colors.primary },
                  (pressed || isSaving) && styles.buttonPressed,
                ]}
              >
                {isSaving ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.saveText}>Salvar receita</Text>
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
    maxHeight: '80%',
  },
  sheet: {
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    borderWidth: StyleSheet.hairlineWidth,
    paddingBottom: 28,
    paddingHorizontal: 22,
    paddingTop: 24,
  },
  header: {
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
  capitalize: {
    textTransform: 'capitalize',
  },
  closeButton: {
    alignItems: 'center',
    borderRadius: 18,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  closeText: {
    fontSize: 25,
    fontWeight: '400',
    lineHeight: 28,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 7,
  },
  input: {
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    fontSize: 16,
    height: 50,
    paddingHorizontal: 14,
  },
  error: {
    color: '#D14343',
    fontSize: 12,
    lineHeight: 18,
    marginTop: 10,
  },
  saveButton: {
    alignItems: 'center',
    borderRadius: 13,
    height: 50,
    justifyContent: 'center',
    marginTop: 18,
  },
  buttonPressed: {
    opacity: 0.78,
  },
  saveText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});

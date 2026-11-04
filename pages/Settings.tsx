import { StyleSheet, Switch, Text, View } from 'react-native';
import { useAppTheme } from '../contexts/ThemeContext';

export function Settings() {
  const { mode, colors, toggleTheme } = useAppTheme();
  const isDarkMode = mode === 'dark';

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>Configurações</Text>
      <View
        style={[
          styles.option,
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}
      >
        <View style={styles.optionText}>
          <Text style={[styles.label, { color: colors.text }]}>Tema escuro</Text>
          <Text style={[styles.description, { color: colors.muted }]}>
            Ativar aparência escura no aplicativo
          </Text>
        </View>
        <Switch
          accessibilityLabel="Tema escuro"
          value={isDarkMode}
          onValueChange={toggleTheme}
          trackColor={{ false: colors.border, true: colors.primary }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 20,
  },
  option: {
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
  },
  optionText: {
    flex: 1,
    gap: 4,
    marginRight: 12,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
  },
  description: {
    fontSize: 13,
  },
});
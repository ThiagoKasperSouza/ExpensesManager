import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import { useSession } from '../contexts/SessionContext';
import { useAppTheme } from '../contexts/ThemeContext';

export function Settings() {
  const { mode, colors, toggleTheme } = useAppTheme();
  const { signOut } = useSession();
  const [logoutError, setLogoutError] = useState<string>();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const isDarkMode = mode === 'dark';

  async function handleLogout() {
    setLogoutError(undefined);
    setIsLoggingOut(true);

    try {
      await signOut();
    } catch (error) {
      setLogoutError(
        error instanceof Error
          ? error.message
          : 'Não foi possível encerrar a sessão. Tente novamente.',
      );
    } finally {
      setIsLoggingOut(false);
    }
  }

  function confirmLogout() {
    Alert.alert(
      'Sair da conta?',
      'Você precisará entrar novamente para acessar suas despesas.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sair',
          style: 'destructive',
          onPress: () => {
            handleLogout();
          },
        },
      ],
    );
  }

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
          <Text style={[styles.label, { color: colors.text }]}>
            Tema escuro
          </Text>
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

      <Pressable
        accessibilityRole="button"
        disabled={isLoggingOut}
        onPress={confirmLogout}
        style={[
          styles.logoutButton,
          { backgroundColor: colors.surface },
          isLoggingOut && styles.disabled,
        ]}
      >
        <Text style={styles.logoutText}>
          {isLoggingOut ? 'Encerrando sessão…' : 'Sair da conta'}
        </Text>
      </Pressable>
      {logoutError ? (
        <Text accessibilityRole="alert" style={styles.error}>
          {logoutError}
        </Text>
      ) : null}
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
  logoutButton: {
    alignItems: 'center',
    borderRadius: 16,
    borderColor: '#D14343',
    borderWidth: 1,
    marginTop: 24,
    padding: 16,
  },
  logoutText: {
    color: '#D14343',
    fontSize: 15,
    fontWeight: '700',
  },
  disabled: {
    opacity: 0.6,
  },
  error: {
    color: '#D14343',
    fontSize: 13,
    lineHeight: 19,
    marginTop: 12,
  },
});

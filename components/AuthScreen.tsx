import { AntDesign } from '@react-native-vector-icons/ant-design';
import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
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

type AuthMode = 'login' | 'register';

export function AuthScreen() {
  const { colors } = useAppTheme();
  const { signIn, signUp } = useSession();
  const [mode, setMode] = useState<AuthMode>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isRegistering = mode === 'register';

  async function handleSubmit() {
    const normalizedEmail = email.trim();

    if (isRegistering && !name.trim()) {
      setError('Informe seu nome.');
      return;
    }

    if (!normalizedEmail || !normalizedEmail.includes('@') || !password) {
      setError('Informe um e-mail válido e sua senha.');
      return;
    }

    setError(undefined);
    setIsSubmitting(true);

    try {
      if (isRegistering) {
        await signUp(name.trim(), normalizedEmail, password);
      } else {
        await signIn(normalizedEmail, password);
      }
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'Não foi possível autenticar. Tente novamente.',
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  function changeMode(nextMode: AuthMode) {
    setMode(nextMode);
    setError(undefined);
  }

  return (
    <KeyboardAvoidingView
      style={[styles.keyboardView, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View
          style={[styles.brandIcon, { backgroundColor: `${colors.primary}18` }]}
        >
          <AntDesign name="wallet" size={28} color={colors.primary} />
        </View>
        <Text style={[styles.title, { color: colors.text }]}>
          {isRegistering ? 'Crie sua conta' : 'Bem-vindo de volta'}
        </Text>
        <Text style={[styles.subtitle, { color: colors.muted }]}>
          {isRegistering
            ? 'Cadastre-se para organizar suas despesas.'
            : 'Entre para acessar seu controle financeiro.'}
        </Text>

        <View
          style={[
            styles.form,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          {isRegistering ? (
            <>
              <Text style={[styles.label, { color: colors.text }]}>Nome</Text>
              <TextInput
                accessibilityLabel="Nome"
                autoCapitalize="words"
                autoComplete="name"
                onChangeText={setName}
                placeholder="Seu nome"
                placeholderTextColor={colors.muted}
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.background,
                    borderColor: colors.border,
                    color: colors.text,
                  },
                ]}
                value={name}
              />
            </>
          ) : null}

          <Text style={[styles.label, { color: colors.text }]}>E-mail</Text>
          <TextInput
            accessibilityLabel="E-mail"
            autoCapitalize="none"
            autoComplete="email"
            autoCorrect={false}
            keyboardType="email-address"
            onChangeText={setEmail}
            placeholder="voce@exemplo.com"
            placeholderTextColor={colors.muted}
            style={[
              styles.input,
              {
                backgroundColor: colors.background,
                borderColor: colors.border,
                color: colors.text,
              },
            ]}
            value={email}
          />

          <Text
            style={[styles.label, styles.passwordLabel, { color: colors.text }]}
          >
            Senha
          </Text>
          <TextInput
            accessibilityLabel="Senha"
            autoCapitalize="none"
            autoComplete={isRegistering ? 'new-password' : 'current-password'}
            onChangeText={setPassword}
            onSubmitEditing={handleSubmit}
            placeholder="Sua senha"
            placeholderTextColor={colors.muted}
            secureTextEntry
            style={[
              styles.input,
              {
                backgroundColor: colors.background,
                borderColor: colors.border,
                color: colors.text,
              },
            ]}
            value={password}
          />

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
              <Text style={styles.submitText}>
                {isRegistering ? 'Cadastrar' : 'Entrar'}
              </Text>
            )}
          </Pressable>
        </View>

        <View style={styles.switchRow}>
          <Text style={[styles.switchText, { color: colors.muted }]}>
            {isRegistering ? 'Já tem uma conta?' : 'Ainda não tem uma conta?'}
          </Text>
          <Pressable
            accessibilityRole="button"
            disabled={isSubmitting}
            onPress={() => changeMode(isRegistering ? 'login' : 'register')}
            hitSlop={8}
          >
            <Text style={[styles.switchAction, { color: colors.primary }]}>
              {isRegistering ? 'Entrar' : 'Cadastrar'}
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 36,
  },
  brandIcon: {
    alignItems: 'center',
    alignSelf: 'center',
    borderRadius: 20,
    height: 64,
    justifyContent: 'center',
    marginBottom: 20,
    width: 64,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 21,
    marginBottom: 26,
    marginTop: 8,
    textAlign: 'center',
  },
  form: {
    borderRadius: 22,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 20,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
  },
  passwordLabel: {
    marginTop: 18,
  },
  input: {
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    fontSize: 15,
    height: 50,
    paddingHorizontal: 14,
  },
  error: {
    color: '#D14343',
    fontSize: 13,
    lineHeight: 19,
    marginTop: 14,
  },
  submitButton: {
    alignItems: 'center',
    borderRadius: 13,
    height: 50,
    justifyContent: 'center',
    marginTop: 22,
  },
  buttonPressed: {
    opacity: 0.78,
  },
  submitText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  switchRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 5,
    justifyContent: 'center',
    marginTop: 22,
  },
  switchText: {
    fontSize: 13,
  },
  switchAction: {
    fontSize: 13,
    fontWeight: '700',
  },
});

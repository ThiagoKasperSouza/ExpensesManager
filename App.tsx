/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import { StatusBar, StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { BottomNav } from './components/BottomNav';
import { AuthScreen } from './components/AuthScreen';
import { MonthlyBudgetProvider } from './contexts/MonthlyBudgetContext';
import { SessionProvider, useSession } from './contexts/SessionContext';
import { ThemeProvider, useAppTheme } from './contexts/ThemeContext';

function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <SessionProvider>
          <MonthlyBudgetProvider>
            <AppContent />
          </MonthlyBudgetProvider>
        </SessionProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

function AppContent() {
  const { mode, colors } = useAppTheme();
  const { isAuthenticated } = useSession();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar
        barStyle={mode === 'dark' ? 'light-content' : 'dark-content'}
      />
      {isAuthenticated ? <BottomNav /> : <AuthScreen />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
});

export default App;

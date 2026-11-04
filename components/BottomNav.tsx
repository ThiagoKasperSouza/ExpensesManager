
import {
  DarkTheme,
  DefaultTheme,
  NavigationContainer,
} from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Expenses } from '../pages/Expenses';
import { Home } from '../pages/Home';
import { Settings } from '../pages/Settings';
import { AntDesign, type AntDesignIconName } from '@react-native-vector-icons/ant-design';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from '../contexts/ThemeContext';

type TabParamList = {
  Home: undefined;
  Expenses: undefined;
  Settings: undefined;
};

const Tab = createBottomTabNavigator<TabParamList>();

const icons: Record<keyof TabParamList, AntDesignIconName> = {
  Home: 'home',
  Expenses: 'wallet',
  Settings: 'setting',
};

type TabBarIconProps = {
  color: string;
  size: number;
};

function HomeTabIcon({ color, size }: TabBarIconProps) {
  return <AntDesign name={icons.Home} size={size} color={color} />;
}

function ExpensesTabIcon({ color, size }: TabBarIconProps) {
  return <AntDesign name={icons.Expenses} size={size} color={color} />;
}

function SettingsTabIcon({ color, size }: TabBarIconProps) {
  return <AntDesign name={icons.Settings} size={size} color={color} />;
}

export function BottomNav() {
  const insets = useSafeAreaInsets();
  const { mode, colors } = useAppTheme();
  const navigationTheme = mode === 'dark' ? DarkTheme : DefaultTheme;

  return (
    <NavigationContainer
      theme={{
        ...navigationTheme,
        colors: {
          ...navigationTheme.colors,
          primary: colors.primary,
          background: colors.background,
          card: colors.surface,
          text: colors.text,
          border: colors.border,
        },
      }}
    >
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.muted,
          tabBarStyle: {
            position: 'absolute',
            left: 16,
            right: 16,
            bottom: insets.bottom + 12,
            height: 64,
            paddingBottom: 5,
            borderTopWidth: 0,
            borderRadius: 20,
            backgroundColor: colors.surface,
            borderColor: colors.border,
            elevation: 8,
          },
        }}
      >
        <Tab.Screen
          name="Home"
          component={Home}
          options={{ tabBarIcon: HomeTabIcon }}
        />
        <Tab.Screen
          name="Expenses"
          component={Expenses}
          options={{ tabBarIcon: ExpensesTabIcon }}
        />
        <Tab.Screen
          name="Settings"
          component={Settings}
          options={{ tabBarIcon: SettingsTabIcon }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
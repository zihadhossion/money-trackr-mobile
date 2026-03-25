import { Redirect, Tabs } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../src/contexts/ThemeContext';
import { useAuth } from '../../src/contexts/AuthContext';
import { View, ActivityIndicator } from 'react-native';

export default function TabsLayout() {
  const { colors } = useTheme();
  const { isAuthenticated, loading } = useAuth();
  const { t } = useTranslation();
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.bgPrimary }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.bgPrimary,
          borderTopColor: colors.borderColor,
          borderTopWidth: 1,
          height: 60,
          paddingBottom: 8,
          paddingTop: 4,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: { fontSize: 11, fontWeight: '500' },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: t('tabs.home'), tabBarIcon: ({ color, size }) => <Feather name="home" size={size} color={color} /> }}
      />
      <Tabs.Screen
        name="income"
        options={{ title: t('tabs.income'), tabBarIcon: ({ color, size }) => <Feather name="trending-up" size={size} color={color} /> }}
      />
      <Tabs.Screen
        name="expenses"
        options={{ title: t('tabs.expenses'), tabBarIcon: ({ color, size }) => <Feather name="trending-down" size={size} color={color} /> }}
      />
      <Tabs.Screen
        name="lending"
        options={{ title: t('tabs.lending'), tabBarIcon: ({ color, size }) => <Feather name="repeat" size={size} color={color} /> }}
      />
      <Tabs.Screen
        name="categories"
        options={{ title: t('tabs.categories'), tabBarIcon: ({ color, size }) => <Feather name="grid" size={size} color={color} /> }}
      />
      <Tabs.Screen
        name="settings"
        options={{ title: t('tabs.settings'), tabBarIcon: ({ color, size }) => <Feather name="settings" size={size} color={color} /> }}
      />
    </Tabs>
  );
}

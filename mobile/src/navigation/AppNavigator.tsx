import React from 'react';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AIChatScreen from '../screens/AIChatScreen';
import AIProjectScreen from '../screens/AIProjectScreen';
import AIPresentationsScreen from '../screens/AIPresentationsScreen';
import SettingsScreen from '../screens/SettingsScreen';
import AuthScreen, { RootStackParamList } from '../screens/AuthScreen';
import { useLanguage } from '../context/LanguageContext';

type MainTabsParamList = {
  Chat: undefined;
  Project: undefined;
  Presentations: undefined;
  Settings: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tabs = createBottomTabNavigator<MainTabsParamList>();

function MainTabs({ onOpenAuth }: { onOpenAuth: () => void }) {
  const { t } = useLanguage();
  return (
    <Tabs.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#0f1115' },
        headerTintColor: '#f0f3fc',
        tabBarStyle: { backgroundColor: '#121721', borderTopColor: '#263043' },
        tabBarActiveTintColor: '#6e8bff',
        tabBarInactiveTintColor: '#8b96af',
      }}
    >
      <Tabs.Screen
        name="Chat"
        component={AIChatScreen}
        options={{
          title: t('tabs.chat'),
          tabBarIcon: () => <TabIcon label="💬" />,
        }}
      />
      <Tabs.Screen
        name="Project"
        options={{
          title: t('tabs.project'),
          tabBarIcon: () => <TabIcon label="✨" />,
        }}
      >
        {() => <AIProjectScreen onNeedAuth={onOpenAuth} />}
      </Tabs.Screen>
      <Tabs.Screen
        name="Presentations"
        component={AIPresentationsScreen}
        options={{
          title: t('tabs.presentations'),
          tabBarIcon: () => <TabIcon label="📊" />,
        }}
      />
      <Tabs.Screen
        name="Settings"
        options={{
          title: t('tabs.settings'),
          tabBarIcon: () => <TabIcon label="⚙️" />,
        }}
      >
        {() => <SettingsScreen onOpenAuth={onOpenAuth} />}
      </Tabs.Screen>
    </Tabs.Navigator>
  );
}

function TabIcon({ label }: { label: string }) {
  return <>{label}</>;
}

export default function AppNavigator() {
  return (
    <NavigationContainer theme={DarkTheme}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Main">
          {({ navigation }) => <MainTabs onOpenAuth={() => navigation.navigate('Auth')} />}
        </Stack.Screen>
        <Stack.Screen name="Auth" component={AuthScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

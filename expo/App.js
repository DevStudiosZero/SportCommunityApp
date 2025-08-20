import React from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { View, Text } from 'react-native';
import { Home, PlusCircle, UserRound } from 'lucide-react-native';
import Onboarding from './src/screens/Onboarding';
import Feed from './src/screens/Feed';
import EventDetailScreen from './src/screens/EventDetailScreen';
import CreateEvent from './src/screens/CreateEvent';
import Profile from './src/screens/Profile';
import Matching from './src/screens/Matching';
import Filters from './src/screens/Filters';
import UserProfile from './src/screens/UserProfile';
import { AuthProvider, useAuth } from './src/state/AuthContext';
import { FiltersProvider } from './src/state/FiltersContext';
import { ToastProvider } from './src/state/ToastContext';
import { Colors } from './src/styles/colors';
import { useAppFonts } from './src/styles/typography';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const MyTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: Colors.background,
    card: Colors.primary,
    text: Colors.text,
    primary: Colors.accent
  }
};

function Tabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.accent,
        tabBarStyle: { backgroundColor: Colors.primary }
      }}
    >
      <Tab.Screen name="Feed" component={Feed} options={{
        tabBarIcon: ({ color, size }) => <Home color={color} size={size} />
      }} />
      <Tab.Screen name="CreateEvent" component={CreateEvent} options={{
        title: 'Erstellen',
        tabBarIcon: ({ color, size }) => <PlusCircle color={color} size={size} />
      }} />
      <Tab.Screen name="Profile" component={Profile} options={{
        title: 'Profil',
        tabBarIcon: ({ color, size }) => <UserRound color={color} size={size} />
      }} />
    </Tab.Navigator>
  );
}

function RootNavigator() {
  const { session, initializing } = useAuth();

  if (initializing) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <Text className="text-black">Lade…</Text>
      </View>
    );
  }

  return (
    <Stack.Navigator>
      {!session ? (
        <Stack.Screen name="Onboarding" component={Onboarding} options={{ headerShown: false }} />
      ) : (
        <>
          <Stack.Screen name="Tabs" component={Tabs} options={{ headerShown: false }} />
          <Stack.Screen name="EventDetail" component={EventDetailScreen} options={{ title: 'Event' }} />
          <Stack.Screen name="Matching" component={Matching} />
          <Stack.Screen name="Filters" component={Filters} options={{ title: 'Filter' }} />
          <Stack.Screen name="UserProfile" component={UserProfile} options={{ title: 'Profil' }} />
        </>
      )}
    </Stack.Navigator>
  );
}

export default function App() {
  const fontsLoaded = useAppFonts();

  if (!fontsLoaded) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <Text className="text-black">Lade Schriftarten…</Text>
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <FiltersProvider>
          <ToastProvider>
            <NavigationContainer theme={MyTheme}>
              <StatusBar style="dark" />
              <RootNavigator />
            </NavigationContainer>
          </ToastProvider>
        </FiltersProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
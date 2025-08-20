import React, { useEffect } from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { View, Text } from 'react-native';
import { Home, PlusCircle, UserRound, MessageSquare } from 'lucide-react-native';
import Onboarding from './src/screens/Onboarding';
import Feed from './src/screens/Feed';
import EventDetailScreen from './src/screens/EventDetailScreen';
import CreateEvent from './src/screens/CreateEvent';
import Profile from './src/screens/Profile';
import Matching from './src/screens/Matching';
import Filters from './src/screens/Filters';
import UserProfile from './src/screens/UserProfile';
import Inbox from './src/screens/Inbox';
import Chat from './src/screens/Chat';
import MapPicker from './src/screens/MapPicker';
import { AuthProvider, useAuth } from './src/state/AuthContext';
import { FiltersProvider } from './src/state/FiltersContext';
import { ToastProvider, useToast } from './src/state/ToastContext';
import { UnreadProvider, useUnread } from './src/state/UnreadContext';
import { Colors } from './src/styles/colors';
import { useAppFonts } from './src/styles/typography';
import { subscribeMyIncomingMessages } from './src/services/realtime';
import { supabase } from './src/supabaseClient';
import { ensurePushPreferenceRespected } from './src/services/notifications';
import { getProfile } from './src/services/profile';

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
  const { count } = useUnread();
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
      <Tab.Screen name="Inbox" component={Inbox} options={{
        title: 'Nachrichten',
        tabBarIcon: ({ color, size }) => <MessageSquare color={color} size={size} />,
        tabBarBadge: count > 0 ? count : undefined
      }} />
      <Tab.Screen name="Profile" component={Profile} options={{
        title: 'Profil',
        tabBarIcon: ({ color, size }) => <UserRound color={color} size={size} />
      }} />
    </Tab.Navigator>
  );
}

function GlobalRealtimeToasts() {
  const { show } = useToast();
  useEffect(() => {
    let off;
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      off = subscribeMyIncomingMessages({
        userId: user.id,
        onInsert: (payload) => {
          const m = payload?.new;
          if (m?.from_display_name) {
            show(`Neue Nachricht von ${m.from_display_name}`, 'info');
          } else {
            show('Neue Nachricht', 'info');
          }
        }
      });
    })();
    return () => off?.();
  }, [show]);
  return null;
}

function GlobalPushRegister() {
  useEffect(() => {
    (async () => {
      const profile = await getProfile();
      if (profile?.push_enabled === false) {
        await ensurePushPreferenceRespected();
      } else {
        await ensurePushPreferenceRespected();
      }
    })();
  }, []);
  return null;
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
          <Stack.Screen name="Matching" component={Matching} options={{ title: 'Matching' }} />
          <Stack.Screen name="Filters" component={Filters} options={{ title: 'Filter' }} />
          <Stack.Screen name="UserProfile" component={UserProfile} options={{ title: 'Profil' }} />
          <Stack.Screen name="Inbox" component={Inbox} options={{ title: 'Nachrichten' }} />
          <Stack.Screen name="Chat" component={Chat} options={{ title: 'Chat' }} />
          <Stack.Screen name="MapPicker" component={MapPicker} options={{ title: 'Treffpunkt wählen' }} />
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
            <UnreadProvider>
              <NavigationContainer theme={MyTheme}>
                <StatusBar style="dark" />
                <GlobalRealtimeToasts />
                <GlobalPushRegister />
                <RootNavigator />
              </NavigationContainer>
            </UnreadProvider>
          </ToastProvider>
        </FiltersProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
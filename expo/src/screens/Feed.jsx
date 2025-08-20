import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import { City, Settings } from 'lucide-react-native';
import EventCard from '../components/EventCard';
import { listEvents } from '../services/events';

export default function Feed({ navigation }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const rows = await listEvents();
      setEvents(rows);
    } catch (e) {
      Alert.alert('Fehler', e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, []);

  return (
    <View className="flex-1 bg-background">
      <View className="px-4 pt-6 pb-3 bg-white flex-row items-center justify-between">
        <TouchableOpacity className="flex-row items-center">
          <City color="#000" size={20} />
          <Text className="ml-2 font-bold text-black">Stadt wählen</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Filters')}>
          <Settings color="#000" size={20} />
        </TouchableOpacity>
      </View>

      <ScrollView className="p-4" refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        {loading && (
          <Text className="text-gray-600">Laden…</Text>
        )}
        {!loading && events.length === 0 && (
          <Text className="text-gray-600">Keine Events gefunden.</Text>
        )}
        {events.map((e) => (
          <EventCard key={e.id} event={{
            id: e.id,
            title: e.title,
            location: e.location_text,
            date: new Date(e.date).toLocaleDateString(),
            time: new Date(e.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            participants: e.participantsCount,
            distance: e.distance_km,
            pace: e.pace
          }} onPress={() => navigation.navigate('EventDetail', { id: e.id })} />
        ))}
      </ScrollView>
    </View>
  );
}
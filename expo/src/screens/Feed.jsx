import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { City, Settings } from 'lucide-react-native';
import EventCard from '../components/EventCard';
import { mockEvents } from '../utils/mockData';

export default function Feed({ navigation }) {
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

      <ScrollView className="p-4">
        {mockEvents.map((e) => (
          <EventCard key={e.id} event={e} onPress={() => navigation.navigate('EventDetail', { id: e.id })} />
        ))}
      </ScrollView>
    </View>
  );
}
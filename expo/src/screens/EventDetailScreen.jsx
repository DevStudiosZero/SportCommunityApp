import React from 'react';
import { View, Text } from 'react-native';

export default function EventDetailScreen({ route }) {
  const { id } = route.params || {};
  return (
    <View className="flex-1 bg-background p-4">
      <Text className="text-xl font-bold text-black mb-2">Event Detail</Text>
      <Text className="text-gray-700">ID: {id}</Text>
      <Text className="mt-4">Hier kommen Beschreibung, Teilnehmerliste und Karte.</Text>
    </View>
  );
}
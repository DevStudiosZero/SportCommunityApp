import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { MapPin, Users, Calendar, Timer, Dumbbell, Rocket } from 'lucide-react-native';

export default function EventCard({ event, onPress }) {
  return (
    <TouchableOpacity onPress={onPress} className="bg-white rounded-[20px] shadow-card p-4 mb-4">
      <View className="flex-row items-center mb-2 justify-between">
        <View className="flex-row items-center">
          <Dumbbell color="#FE0100" size={20} />
          <Text className="ml-2 font-bold text-black">{event.title}</Text>
        </View>
        {typeof event.boostsCount === 'number' && event.boostsCount > 0 && (
          <View className="flex-row items-center">
            <Rocket color="#FE0100" size={16} />
            <Text className="ml-1 text-accent font-bold">{event.boostsCount}</Text>
          </View>
        )}
      </View>
      <View className="flex-row items-center mb-1">
        <MapPin color="#888" size={16} />
        <Text className="ml-2 text-gray-600">{event.location}</Text>
      </View>
      <View className="flex-row items-center mb-1">
        <Calendar color="#888" size={16} />
        <Text className="ml-2 text-gray-600">{event.date} | {event.time}</Text>
      </View>
      <View className="flex-row items-center mb-1">
        <Users color="#888" size={16} />
        <Text className="ml-2 text-gray-600">{event.participants} Teilnehmer</Text>
      </View>
      {event.distance && (
        <View className="flex-row items-center mb-1">
          <Timer color="#888" size={16} />
          <Text className="ml-2 text-gray-600">{event.distance} km{event.pace ? ` | Pace: ${event.pace}` : ''}</Text>
        </View>
      )}
      <View className="mt-3">
        <Text className="text-accent font-bold">Teilnehmen</Text>
      </View>
    </TouchableOpacity>
  );
}
import React from 'react';
import { View, Text } from 'react-native';

export default function Filters() {
  return (
    <View className="flex-1 bg-background p-4">
      <Text className="text-xl font-bold text-black">Filter</Text>
      <Text className="text-gray-600 mt-2">Standort, Sportarten, Datum, Pace, Distanz, Pacer-Badge</Text>
    </View>
  );
}
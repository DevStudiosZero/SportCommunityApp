import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';

export function Loading({ label = 'Laden…' }) {
  return (
    <View className="flex-1 items-center justify-center bg-background p-4">
      <ActivityIndicator color="#FE0100" />
      <Text className="text-gray-600 mt-2">{label}</Text>
    </View>
  );
}

export function Empty({ label = 'Keine Daten' }) {
  return (
    <View className="flex-1 items-center justify-center bg-background p-4">
      <Text className="text-gray-600">{label}</Text>
    </View>
  );
}

export function ErrorBanner({ message }) {
  if (!message) return null;
  return (
    <View className="bg-red-50 border border-red-200 rounded-2xl p-3">
      <Text className="text-red-700">{message}</Text>
    </View>
  );
}
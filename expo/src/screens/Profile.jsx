import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { supabase } from '../supabaseClient';

export default function Profile() {
  const logout = async () => {
    await supabase.auth.signOut();
  };
  return (
    <View className="flex-1 bg-background p-4">
      <Text className="text-2xl font-bold text-black mb-2">Mein Profil</Text>
      <Text className="text-gray-600 mb-6">Eigene Sportarten, Über mich, Bestzeiten usw.</Text>
      <TouchableOpacity onPress={logout} className="bg-accent rounded-full py-3 px-4">
        <Text className="text-white text-center font-bold">Logout</Text>
      </TouchableOpacity>
    </View>
  );
}
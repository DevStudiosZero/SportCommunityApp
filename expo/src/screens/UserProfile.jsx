import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { getProfileById, getHostBoostsByUser } from '../services/profile';
import { Rocket } from 'lucide-react-native';

export default function UserProfile({ route }) {
  const { userId } = route.params || {};
  const [profile, setProfile] = useState(null);
  const [boosts, setBoosts] = useState({ total: 0, byEvent: [] });

  useEffect(() => {
    (async () => {
      try {
        const p = await getProfileById(userId);
        setProfile(p);
        const b = await getHostBoostsByUser(userId);
        setBoosts(b);
      } catch (e) {
        // ignore for now
      }
    })();
  }, [userId]);

  if (!profile) {
    return (
      <View className="flex-1 bg-background p-4">
        <Text className="text-gray-600">Laden…</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-background p-4">
      <Text className="text-2xl font-bold text-black mb-2">{profile.full_name || 'Athlet'}</Text>
      {profile.city ? <Text className="text-gray-700 mb-2">{profile.city}</Text> : null}
      {Array.isArray(profile.sports) && profile.sports.length > 0 && (
        <View className="flex-row flex-wrap mb-3">
          {profile.sports.map((s) => (
            <View key={s} className="px-3 py-2 rounded-full bg-white border border-gray-200 mr-2 mb-2">
              <Text className="text-black">{s}</Text>
            </View>
          ))}
        </View>
      )}

      <View className="bg-white rounded-2xl border border-gray-200 p-4 mb-4 flex-row justify-between items-center">
        <View className="flex-row items-center">
          <Rocket color="#FE0100" size={20} />
          <Text className="ml-2 text-black font-bold">Boosts erhalten</Text>
        </View>
        <Text className="text-accent font-bold text-lg">{boosts.total || 0}</Text>
      </View>

      {boosts.byEvent?.length > 0 && (
        <View className="bg-white rounded-2xl border border-gray-200 p-4 mb-4">
          <Text className="text-black font-bold mb-2">Gehostete Events mit Boosts</Text>
          {boosts.byEvent.map((e) => (
            <View key={e.event_id} className="flex-row justify-between items-center py-2 border-b border-gray-100">
              <Text className="text-black flex-1 pr-2">{e.title}</Text>
              <View className="flex-row items-center">
                <Rocket color="#FE0100" size={16} />
                <Text className="ml-1 text-accent font-bold">{e.count}</Text>
              </View>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}
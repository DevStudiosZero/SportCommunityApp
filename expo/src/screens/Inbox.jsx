import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image } from 'react-native';
import { listConversations } from '../services/messages';

export default function Inbox({ navigation }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const rows = await listConversations();
        setItems(rows);
      } catch (e) {
        // ignore for now
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <View className="flex-1 bg-background p-4">
        <Text className="text-gray-600">Laden…</Text>
      </View>
    );
  }

  if (!loading && items.length === 0) {
    return (
      <View className="flex-1 bg-background p-4">
        <Text className="text-gray-600">Keine Nachrichten</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-background p-4">
      {items.map((c) => (
        <TouchableOpacity key={c.key} onPress={() => navigation.navigate('Chat', { eventId: c.event_id, withUserId: c.with_user_id, withName: c.with_profile?.full_name || 'Athlet', eventTitle: c.event?.title || 'Event' })} className="bg-white rounded-2xl border border-gray-200 p-3 mb-3">
          <View className="flex-row items-center">
            {c.with_profile?.avatar_url ? (
              <Image source={{ uri: c.with_profile.avatar_url }} style={{ width: 36, height: 36, borderRadius: 18 }} />
            ) : (
              <View className="w-[36px] h-[36px] rounded-full bg-accent items-center justify-center">
                <Text className="text-white font-bold">{(c.with_profile?.full_name || 'A').slice(0,1).toUpperCase()}</Text>
              </View>
            )}
            <View className="ml-3 flex-1">
              <Text className="text-black font-bold">{c.with_profile?.full_name || 'Athlet'}</Text>
              <Text className="text-gray-600" numberOfLines={1}>{c.last?.content}</Text>
            </View>
            <Text className="text-gray-400 text-xs">{new Date(c.last?.created_at).toLocaleDateString()}</Text>
          </View>
          <Text className="text-gray-700 mt-2">{c.event?.title || 'Event'}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}
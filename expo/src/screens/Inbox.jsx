import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, Image, FlatList, ActivityIndicator } from 'react-native';
import { listConversations } from '../services/messages';

export default function Inbox({ navigation }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [offset, setOffset] = useState(0);
  const [fetchingMore, setFetchingMore] = useState(false);
  const PAGE = 20;

  const load = useCallback(async (reset = false) => {
    if (reset) {
      setOffset(0);
      setItems([]);
    }
    const rows = await listConversations({ limit: PAGE, offset: reset ? 0 : offset });
    setItems((prev) => reset ? rows : [...prev, ...rows]);
    setOffset((prev) => prev + PAGE);
  }, [offset]);

  useEffect(() => {
    (async () => {
      try {
        await load(true);
      } catch (e) {
        // ignore
      } finally {
        setLoading(false);
      }
    })();
  }, [load]);

  const renderItem = ({ item: c }) => (
    <TouchableOpacity onPress={() => navigation.navigate('Chat', { eventId: c.event_id, withUserId: c.with_user_id, withName: c.with_profile?.full_name || 'Athlet', eventTitle: c.event?.title || 'Event' })} className="bg-white rounded-2xl border border-gray-200 p-3 mb-3">
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
  );

  const onEndReached = async () => {
    if (fetchingMore) return;
    setFetchingMore(true);
    try { await load(false); } finally { setFetchingMore(false); }
  };

  if (loading) {
    return (
      <View className="flex-1 bg-background p-4">
        <Text className="text-gray-600">Laden…</Text>
      </View>
    );
  }

  return (
    <FlatList
      className="flex-1 bg-background p-4"
      data={items}
      keyExtractor={(item) => item.key}
      renderItem={renderItem}
      onEndReachedThreshold={0.4}
      onEndReached={onEndReached}
      ListFooterComponent={fetchingMore ? <ActivityIndicator className="my-4" /> : null}
    />
  );
}
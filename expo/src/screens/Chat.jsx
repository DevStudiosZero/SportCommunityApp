import React, { useEffect, useState, useRef } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import { listMessagesForConversation, sendMessage, markConversationAsRead } from '../services/messages';
import { subscribeMessages } from '../services/realtime';
import { supabase } from '../supabaseClient';
import { useToast } from '../state/ToastContext';

function Bubble({ isOwn, name, content, created_at }) {
  return (
    <View className={`mb-2 flex-row ${isOwn ? 'justify-end' : 'justify-start'}`}>
      <View className={`max-w-[75%] px-3 py-2 rounded-2xl ${isOwn ? 'bg-accent' : 'bg-white border border-gray-200'}`}>
        {!isOwn && <Text className="text-gray-600 text-xs mb-0.5">{name || 'Athlet'}</Text>}
        <Text className={`${isOwn ? 'text-white' : 'text-black'}`}>{content}</Text>
        <Text className={`${isOwn ? 'text-white/80' : 'text-gray-400'} text-[10px] mt-1`}>{new Date(created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
      </View>
    </View>
  );
}

export default function Chat({ route }) {
  const { eventId, withUserId, withName, eventTitle } = route.params || {};
  const [list, setList] = useState([]);
  const [text, setText] = useState('');
  const [me, setMe] = useState(null);
  const [cursor, setCursor] = useState(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const { show } = useToast();
  const scrollRef = useRef(null);

  const load = async (initial = false) => {
    const { rows, nextCursor } = await listMessagesForConversation(eventId, withUserId, { limit: 30, before: initial ? null : cursor });
    if (initial) {
      setList(rows);
      setCursor(nextCursor);
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: false }), 50);
    } else {
      setList((prev) => [...rows, ...prev]);
      setCursor(nextCursor);
    }
    await markConversationAsRead(eventId, withUserId);
  };

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setMe(user);
    })();
  }, []);

  useEffect(() => {
    (async () => {
      await load(true);
    })();
    const off = subscribeMessages({ eventId, onChange: async () => {
      await load(true);
    }});
    return () => off?.();
  }, [eventId, withUserId]);

  const onSend = async () => {
    try {
      await sendMessage(eventId, text, withUserId);
      setText('');
      show('Gesendet', 'success');
      await markConversationAsRead(eventId, withUserId);
    } catch (e) {
      show(e.message || 'Fehler beim Senden', 'error');
    }
  };

  const loadMore = async () => {
    if (loadingMore || !cursor) return;
    setLoadingMore(true);
    try {
      await load(false);
    } finally {
      setLoadingMore(false);
    }
  };

  return (
    <View className="flex-1 bg-background p-4">
      <Text className="text-xl font-bold text-black mb-2">{withName || 'Chat'}</Text>
      {eventTitle ? <Text className="text-gray-600 mb-2">Event: {eventTitle}</Text> : null}

      <ScrollView ref={scrollRef} className="flex-1 mb-3" onScrollBeginDrag={() => {}}>
        <TouchableOpacity onPress={loadMore} disabled={!cursor} className={`self-center mb-3 rounded-full px-4 py-2 ${cursor ? 'bg-white border border-gray-200' : 'bg-gray-200'}`}>
          <Text className="text-black font-bold">{cursor ? 'Mehr laden' : 'Alle geladen'}</Text>
        </TouchableOpacity>
        {list.map((m) => (
          <Bubble key={m.id} isOwn={me?.id === m.from_user_id} name={m.from_display_name} content={m.content} created_at={m.created_at} />
        ))}
      </ScrollView>

      <View className="bg-white rounded-2xl border border-gray-200 p-2 flex-row items-end">
        <TextInput
          placeholder="Nachricht…"
          value={text}
          onChangeText={setText}
          multiline
          className="flex-1"
          style={{ minHeight: 40, maxHeight: 120 }}
        />
        <TouchableOpacity onPress={onSend} disabled={!text.trim()} className={`ml-2 rounded-full px-4 py-2 ${text.trim() ? 'bg-accent' : 'bg-gray-300'}`}>
          <Text className="text-white font-bold">Senden</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
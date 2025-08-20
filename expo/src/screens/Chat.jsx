import React, { useEffect, useState, useRef } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import { listMessagesForConversation, sendMessage } from '../services/messages';
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
  const { show } = useToast();
  const scrollRef = useRef(null);

  const load = async () => {
    const rows = await listMessagesForConversation(eventId, withUserId);
    setList(rows);
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 50);
  };

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setMe(user);
    })();
  }, []);

  useEffect(() => {
    load();
    const off = subscribeMessages({ eventId, onChange: () => load() });
    return () => off?.();
  }, [eventId, withUserId]);

  const onSend = async () => {
    try {
      await sendMessage(eventId, text, withUserId);
      setText('');
      show('Gesendet', 'success');
    } catch (e) {
      show(e.message || 'Fehler beim Senden', 'error');
    }
  };

  return (
    <View className="flex-1 bg-background p-4">
      <Text className="text-xl font-bold text-black mb-2">{withName || 'Chat'}</Text>
      {eventTitle ? <Text className="text-gray-600 mb-2">Event: {eventTitle}</Text> : null}
      <ScrollView ref={scrollRef} className="flex-1 mb-3">
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
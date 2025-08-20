import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, Alert, TouchableOpacity, Linking, Platform, Switch, ScrollView, Image, TextInput } from 'react-native';
import { getEventById, joinEvent, leaveEvent, setPacer, boostEvent, unboostEvent } from '../services/events';
import { subscribeParticipants, subscribeBoosts, subscribeMessages } from '../services/realtime';
import { listMessages, sendMessage } from '../services/messages';
import { useToast } from '../state/ToastContext';
import { supabase } from '../supabaseClient';

function openMap({ lat, lng, label }) {
  try {
    if (lat && lng) {
      const url = Platform.select({
        ios: `http://maps.apple.com/?ll=${lat},${lng}&q=${encodeURIComponent(label || 'Treffpunkt')}`,
        android: `geo:${lat},${lng}?q=${encodeURIComponent(label || 'Treffpunkt')}`
      });
      Linking.openURL(url);
    } else if (label) {
      const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(label)}`;
      Linking.openURL(url);
    }
  } catch (e) {
    Alert.alert('Fehler', 'Karte konnte nicht geöffnet werden');
  }
}

const ParticipantItem = ({ name, avatar, pacer, onPress }) => (
  <TouchableOpacity onPress={onPress} className="flex-row items-center mr-3 mb-2 bg-white rounded-2xl border border-gray-200 px-3 py-2">
    {avatar ? (
      <Image source={{ uri: avatar }} style={{ width: 26, height: 26, borderRadius: 13 }} />
    ) : (
      <View className="w-[26px] h-[26px] rounded-full bg-accent items-center justify-center">
        <Text className="text-white font-bold">{(name || '?').slice(0, 1).toUpperCase()}</Text>
      </View>
    )}
    <Text className="ml-2 text-black">{name || 'Athlet'}</Text>
    {pacer ? <Text className="ml-1">🚀</Text> : null}
  </TouchableOpacity>
);

const MessageBubble = ({ isOwn, name, avatar, content, created_at }) => (
  <View className={`mb-2 flex-row ${isOwn ? 'justify-end' : 'justify-start'}`}>
    {!isOwn && (
      avatar ? <Image source={{ uri: avatar }} style={{ width: 24, height: 24, borderRadius: 12, marginRight: 6 }} /> :
      <View className="w-[24px] h-[24px] rounded-full bg-accent items-center justify-center mr-1">
        <Text className="text-white text-xs font-bold">{(name || '?').slice(0, 1).toUpperCase()}</Text>
      </View>
    )}
    <View className={`max-w-[75%] px-3 py-2 rounded-2xl ${isOwn ? 'bg-accent' : 'bg-white border border-gray-200'}`}>
      {!isOwn && <Text className="text-gray-600 text-xs mb-0.5">{name || 'Athlet'}</Text>}
      <Text className={`${isOwn ? 'text-white' : 'text-black'}`}>{content}</Text>
      <Text className={`${isOwn ? 'text-white/80' : 'text-gray-400'} text-[10px] mt-1`}>{new Date(created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
    </View>
  </View>
);

export default function EventDetailScreen({ route, navigation }) {
  const { id } = route.params || {};
  const [data, setData] = useState(null);
  const [busy, setBusy] = useState(false);
  const [pacer, setPacerState] = useState(false);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [me, setMe] = useState(null);
  const { show } = useToast();

  const load = async () => {
    try {
      const res = await getEventById(id);
      setData(res);
      setPacerState(!!res.myPacer);
      const msg = await listMessages(id);
      setMessages(msg);
    } catch (e) {
      Alert.alert('Fehler', e.message);
    }
  };

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setMe(user);
    })();
  }, []);

  useEffect(() => {
    load();
    const offParts = subscribeParticipants({ eventId: id, onChange: () => load() });
    const offBoosts = subscribeBoosts({ eventId: id, onChange: () => load() });
    const offMsgs = subscribeMessages({ eventId: id, onChange: () => load() });
    return () => {
      offParts?.();
      offBoosts?.();
      offMsgs?.();
    };
  }, [id]);

  const isPast = useMemo(() => {
    if (!data?.event?.date) return false;
    return new Date(data.event.date).getTime() < Date.now();
  }, [data]);

  if (!data) {
    return (
      <View className="flex-1 bg-background p-4">
        <Text className="text-gray-600">Laden…</Text>
      </View>
    );
  }

  const { event, participants, joined, boostedByMe, boostsCount } = data;

  const toggleJoin = async () => {
    setBusy(true);
    try {
      if (joined) await leaveEvent(event.id);
      else await joinEvent(event.id, pacer);
    } catch (e) {
      Alert.alert('Fehler', e.message);
    } finally {
      setBusy(false);
    }
  };

  const togglePacer = async (value) => {
    setPacerState(value);
    try {
      if (!joined) return; // will be used on join
      await setPacer(event.id, value);
    } catch (e) {
      Alert.alert('Fehler', e.message);
    }
  };

  const toggleBoost = async () => {
    if (!isPast) {
      Alert.alert('Hinweis', 'Boosts sind erst nach dem Event möglich.');
      return;
    }
    setBusy(true);
    try {
      if (boostedByMe) await unboostEvent(event.id);
      else await boostEvent(event.id);
    } catch (e) {
      Alert.alert('Fehler', e.message);
    } finally {
      setBusy(false);
    }
  };

  const onSend = async () => {
    try {
      await sendMessage(id, text);
      setText('');
      show('Nachricht gesendet', 'success');
    } catch (e) {
      show(e.message || 'Senden fehlgeschlagen', 'error');
    }
  };

  return (
    <ScrollView className="flex-1 bg-background p-4">
      <Text className="text-2xl font-bold text-black mb-1">{event.title}</Text>
      <Text className="text-gray-700 mb-2">{new Date(event.date).toLocaleString()}</Text>
      <Text className="text-gray-700 mb-2">📍 {event.location_text}</Text>
      {event.distance_km ? (
        <Text className="text-gray-700 mb-2">Distanz: {event.distance_km} km{event.pace ? ` | Pace: ${event.pace}` : ''}</Text>
      ) : null}
      <Text className="text-gray-700 mb-2">👥 Teilnehmer: {participants.length}</Text>

      <View className="flex-row items-center justify-between bg-white rounded-2xl border border-gray-200 py-3 px-4 mb-4">
        <Text className="text-black font-bold">Ich bin Pacer 🚀</Text>
        <Switch value={pacer} onValueChange={togglePacer} />
      </View>

      {participants?.length > 0 && (
        <View className="bg-white rounded-2xl border border-gray-200 p-4 mb-4">
          <Text className="text-black font-bold mb-2">Teilnehmer</Text>
          <View className="flex-row flex-wrap">
            {participants.map((p) => (
              <ParticipantItem key={`${p.user_id}`} name={p.display_name || p.user_id?.slice(0,6)} avatar={p.avatar_url} pacer={!!p.pacer} onPress={() => navigation.navigate('UserProfile', { userId: p.user_id })} />
            ))}
          </View>
        </View>
      )}

      <View className="bg-white rounded-2xl border border-gray-200 p-4 mb-4">
        <Text className="text-black font-bold mb-2">Nachricht an Host</Text>
        <View className="bg-background rounded-2xl p-2">
          <TextInput
            placeholder="Nachricht schreiben…"
            value={text}
            onChangeText={setText}
            multiline
            numberOfLines={3}
            style={{ minHeight: 60 }}
          />
        </View>
        <View className="h-2" />
        <TouchableOpacity onPress={onSend} disabled={!text.trim()} className={`rounded-full py-3 ${text.trim() ? 'bg-accent' : 'bg-gray-300'}`}>
          <Text className="text-center text-white font-bold">Senden</Text>
        </TouchableOpacity>

        {messages?.length > 0 && (
          <View className="mt-4">
            {messages.map((m) => (
              <MessageBubble
                key={m.id}
                isOwn={me?.id === m.from_user_id}
                name={m.from_display_name}
                avatar={m.from_avatar_url}
                content={m.content}
                created_at={m.created_at}
              />
            ))}
          </View>
        )}
      </View>

      <TouchableOpacity
        onPress={() => openMap({ lat: event.meeting_lat, lng: event.meeting_lng, label: event.location_text })}
        className="bg-white rounded-2xl border border-gray-200 py-3 px-4 mb-4"
      >
        <Text className="text-black text-center font-bold">Treffpunkt-Karte öffnen</Text>
      </TouchableOpacity>

      <TouchableOpacity
        disabled={busy}
        onPress={toggleJoin}
        className={`rounded-full py-4 px-4 mb-4 ${joined ? 'bg-white border border-accent' : 'bg-accent'}`}
      >
        <Text className={`text-center font-bold ${joined ? 'text-accent' : 'text-white'}`}>{joined ? 'Nicht mehr teilnehmen' : 'Teilnehmen'}</Text>
      </TouchableOpacity>

      <TouchableOpacity
        disabled={busy}
        onPress={toggleBoost}
        className={`rounded-full py-4 px-4 ${boostedByMe ? 'bg-white border border-accent' : 'bg-accent'}`}
      >
        <Text className={`text-center font-bold ${boostedByMe ? 'text-accent' : 'text-white'}`}>{`Boost 🚀 (${boostsCount || 0})`}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
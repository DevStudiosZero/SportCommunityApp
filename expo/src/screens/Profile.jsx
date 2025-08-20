import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Switch } from 'react-native';
import { supabase } from '../supabaseClient';
import Input from '../components/Input';
import Button from '../components/Button';
import { getProfile, upsertProfile, getHostBoosts, setPushEnabled } from '../services/profile';
import { Rocket } from 'lucide-react-native';
import AvatarPicker from '../components/AvatarPicker';
import { useToast } from '../state/ToastContext';
import { ensurePushPreferenceRespected, unregisterPushNotifications } from '../services/notifications';

const SPORT_OPTIONS = ['🏃 Laufen', '🚴 Rad', '🏊 Schwimmen', '🏋️ Kraft', '🏐 Volleyball', '🎾 Padel'];

export default function Profile() {
  const [city, setCity] = useState('');
  const [sports, setSports] = useState([]);
  const [fullName, setFullName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [pushEnabled, setPushEnabledState] = useState(true);
  const [boosts, setBoosts] = useState({ total: 0, byEvent: [] });
  const { show } = useToast();

  useEffect(() => {
    (async () => {
      const p = await getProfile();
      if (p) {
        setCity(p.city || '');
        setSports(p.sports || []);
        setFullName(p.full_name || '');
        setAvatarUrl(p.avatar_url || '');
        setPushEnabledState(p.push_enabled !== false);
      }
      try {
        const b = await getHostBoosts();
        setBoosts(b);
      } catch (e) {
        // non-blocking
      }
    })();
  }, []);

  const toggleSport = (s) => {
    setSports((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));
  };

  const save = async () => {
    try {
      await upsertProfile({ city, sports, full_name: fullName, avatar_url: avatarUrl });
      show('Profil gespeichert', 'success');
    } catch (e) {
      show(e.message, 'error');
    }
  };

  const togglePush = async (value) => {
    try {
      setPushEnabledState(value);
      await setPushEnabled(value);
      if (value) {
        await ensurePushPreferenceRespected();
        show('Push-Benachrichtigungen aktiviert', 'success');
      } else {
        await unregisterPushNotifications();
        show('Push-Benachrichtigungen deaktiviert', 'success');
      }
    } catch (e) {
      show('Konnte Einstellung nicht speichern', 'error');
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    show('Abgemeldet', 'success');
  };

  return (
    <View className="flex-1 bg-background p-4">
      <Text className="text-2xl font-bold text-black mb-4">Mein Profil</Text>

      <AvatarPicker value={avatarUrl} onChange={setAvatarUrl} />

      <View className="h-4" />
      <Text className="text-black mb-2 font-bold">Name</Text>
      <Input placeholder="Dein Name" value={fullName} onChangeText={setFullName} />

      <View className="h-3" />
      <Text className="text-black mb-2 font-bold">Stadt</Text>
      <Input placeholder="z.B. Kassel" value={city} onChangeText={setCity} />

      <View className="h-4" />
      <Text className="text-black mb-2 font-bold">Push-Benachrichtigungen</Text>
      <View className="bg-white rounded-2xl border border-gray-200 p-4 mb-4 flex-row justify-between items-center">
        <Text className="text-black font-bold">Aktiviert</Text>
        <Switch value={pushEnabled} onValueChange={togglePush} />
      </View>

      <Text className="text-black mb-2 font-bold">Meine Sportarten</Text>
      <View className="flex-row flex-wrap gap-2">
        {SPORT_OPTIONS.map((s) => (
          <TouchableOpacity
            key={s}
            onPress={() => toggleSport(s)}
            className={`px-3 py-2 rounded-full ${sports.includes(s) ? 'bg-accent' : 'bg-white border border-gray-200'}`}
          >
            <Text className={`${sports.includes(s) ? 'text-white' : 'text-black'}`}>{s}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View className="bg-white rounded-2xl border border-gray-200 p-4 my-4 flex-row justify-between items-center">
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
                <Text className="ml-1 text-accent font-bold">{e.count}</Text>
              </View>
            </View>
          ))}
        </View>
      )}

      <Button title="Speichern" onPress={save} />

      <View className="h-6" />
      <TouchableOpacity onPress={logout} className="bg-accent rounded-full py-3 px-4">
        <Text className="text-white text-center font-bold">Logout</Text>
      </TouchableOpacity>
    </View>
  );
}
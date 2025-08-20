import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { supabase } from '../supabaseClient';
import Input from '../components/Input';
import Button from '../components/Button';
import { getProfile, upsertProfile, getHostBoosts } from '../services/profile';
import { Rocket } from 'lucide-react-native';

const SPORT_OPTIONS = ['🏃 Laufen', '🚴 Rad', '🏊 Schwimmen', '🏋️ Kraft', '🏐 Volleyball', '🎾 Padel'];

export default function Profile() {
  const [city, setCity] = useState('');
  const [sports, setSports] = useState([]);
  const [boosts, setBoosts] = useState({ total: 0, byEvent: [] });

  useEffect(() => {
    (async () => {
      const p = await getProfile();
      if (p) {
        setCity(p.city || '');
        setSports(p.sports || []);
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
      await upsertProfile({ city, sports });
      Alert.alert('Gespeichert', 'Profil aktualisiert');
    } catch (e) {
      Alert.alert('Fehler', e.message);
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <View className="flex-1 bg-background p-4">
      <Text className="text-2xl font-bold text-black mb-4">Mein Profil</Text>

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

      <Text className="text-black mb-2 font-bold">Stadt</Text>
      <Input placeholder="z.B. Kassel" value={city} onChangeText={setCity} />

      <View className="h-4" />
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

      <View className="h-6" />
      <Button title="Speichern" onPress={save} />

      <View className="h-10" />
      <TouchableOpacity onPress={logout} className="bg-accent rounded-full py-3 px-4">
        <Text className="text-white text-center font-bold">Logout</Text>
      </TouchableOpacity>
    </View>
  );
}
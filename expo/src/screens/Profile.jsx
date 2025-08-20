import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { supabase } from '../supabaseClient';
import Input from '../components/Input';
import Button from '../components/Button';
import { getProfile, upsertProfile } from '../services/profile';

const SPORT_OPTIONS = ['🏃 Laufen', '🚴 Rad', '🏊 Schwimmen', '🏋️ Kraft'];

export default function Profile() {
  const [city, setCity] = useState('');
  const [sports, setSports] = useState([]);

  useEffect(() => {
    (async () => {
      const p = await getProfile();
      if (p) {
        setCity(p.city || '');
        setSports(p.sports || []);
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
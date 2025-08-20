import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import Button from '../components/Button';
import Input from '../components/Input';
import { supabase } from '../supabaseClient';
import { upsertProfile } from '../services/profile';

const SPORT_OPTIONS = ['🏃 Laufen', '🚴 Rad', '🏊 Schwimmen', '🏋️ Kraft', '🏐 Volleyball', '🎾 Padel'];

export default function Onboarding() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [city, setCity] = useState('');
  const [sports, setSports] = useState([]);

  const toggleSport = (s) => {
    setSports((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));
  };

  const afterAuthSave = async () => {
    try {
      if (city || sports.length) {
        await upsertProfile({ city, sports });
      }
    } catch (e) {
      console.log('Profil speichern fehlgeschlagen', e.message);
    }
  };

  const handleAuth = async (mode) => {
    try {
      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        await afterAuthSave();
        Alert.alert('Bitte E-Mail bestätigen', 'Wir haben dir einen Bestätigungslink gesendet.');
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        await afterAuthSave();
      }
    } catch (e) {
      Alert.alert('Fehler', e.message);
    }
  };

  return (
    <View className="flex-1 bg-background p-6 justify-between">
      <View className="mt-12">
        <Text className="text-3xl font-bold text-black mb-2">Finde deine Community. Trainiere gemeinsam. Werde stärker.</Text>
        <Text className="text-gray-600">Entdecke Sportevents in deiner Nähe und connecte dich mit anderen Athleten.</Text>
      </View>

      <View>
        <Text className="text-black mb-2 font-bold">Stadt</Text>
        <Input placeholder="z.B. Kassel" value={city} onChangeText={setCity} />
        <View className="h-3" />
        <Text className="text-black mb-2 font-bold">Sportarten</Text>
        <View className="flex-row flex-wrap gap-2 mb-4">
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

        <Input placeholder="E-Mail" keyboardType="email-address" value={email} onChangeText={setEmail} />
        <View className="h-3" />
        <Input placeholder="Passwort" secureTextEntry value={password} onChangeText={setPassword} />
        <View className="h-3" />
        <Button title="Loslegen" onPress={() => handleAuth('signup')} />
        <View className="h-2" />
        <TouchableOpacity onPress={() => handleAuth('signin')}>
          <Text className="text-center text-accent font-bold">Login</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import Button from '../components/Button';
import Input from '../components/Input';
import { supabase } from '../supabaseClient';

export default function Onboarding({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleAuth = async (mode) => {
    try {
      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        Alert.alert('Bitte E-Mail bestätigen', 'Wir haben dir einen Bestätigungslink gesendet.');
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
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

      <View className="space-y-3">
        <Input placeholder="E-Mail" keyboardType="email-address" value={email} onChangeText={setEmail} />
        <Input placeholder="Passwort" secureTextEntry value={password} onChangeText={setPassword} />
        <Button title="Loslegen" onPress={() => handleAuth('signup')} />
        <TouchableOpacity onPress={() => handleAuth('signin')}>
          <Text className="text-center text-accent font-bold">Login</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
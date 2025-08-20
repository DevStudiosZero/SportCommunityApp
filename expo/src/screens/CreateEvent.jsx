import React, { useState } from 'react';
import { View, Text } from 'react-native';
import Button from '../components/Button';
import Input from '../components/Input';

export default function CreateEvent() {
  const [title, setTitle] = useState('');
  const [sport, setSport] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [location, setLocation] = useState('');

  const onCreate = () => {
    // TODO: Save to Supabase (table events)
    console.log({ title, sport, date, time, location });
  };

  return (
    <View className="flex-1 bg-background p-4">
      <Text className="text-2xl font-bold text-black mb-4">Event erstellen</Text>
      <Input placeholder="Titel" value={title} onChangeText={setTitle} />
      <View className="h-3" />
      <Input placeholder="Sportart" value={sport} onChangeText={setSport} />
      <View className="h-3" />
      <Input placeholder="Datum (TT.MM.)" value={date} onChangeText={setDate} />
      <View className="h-3" />
      <Input placeholder="Uhrzeit (HH:MM)" value={time} onChangeText={setTime} />
      <View className="h-3" />
      <Input placeholder="Treffpunkt" value={location} onChangeText={setLocation} />
      <View className="h-6" />
      <Button title="Erstellen" onPress={onCreate} />
    </View>
  );
}
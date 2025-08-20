import React, { useState, useMemo } from 'react';
import { View, Text, Alert, TouchableOpacity } from 'react-native';
import Button from '../components/Button';
import Input from '../components/Input';
import { createEvent } from '../services/events';

const LEVEL_OPTIONS = ['Anfänger', 'Fortgeschritten', 'Pro'];

export default function CreateEvent({ navigation }) {
  const [title, setTitle] = useState('');
  const [sport, setSport] = useState('Laufen');
  const [dateStr, setDateStr] = useState('');
  const [timeStr, setTimeStr] = useState('');
  const [city, setCity] = useState('');
  const [locationText, setLocationText] = useState('');
  const [distance, setDistance] = useState('');
  const [pace, setPace] = useState('');
  const [description, setDescription] = useState('');
  const [level, setLevel] = useState('');
  const [busy, setBusy] = useState(false);

  const isTennis = useMemo(() => sport.trim().toLowerCase() === 'tennis', [sport]);
  const showDistance = useMemo(() => {
    const s = sport.trim();
    return s === 'Laufen' || s === 'Rad' || s.toLowerCase() === 'laufen' || s.toLowerCase() === 'rad';
  }, [sport]);

  const onCreate = async () => {
    if (!title || !sport || !dateStr || !timeStr || !locationText) {
      Alert.alert('Fehler', 'Bitte Titel, Sportart, Datum, Uhrzeit und Treffpunkt ausfüllen.');
      return;
    }
    if (isTennis && !level) {
      Alert.alert('Fehler', 'Bitte Level wählen (für Tennis).');
      return;
    }
    setBusy(true);
    try {
      const row = await createEvent({
        title,
        sport,
        dateStr,
        timeStr,
        location_text: locationText,
        distance_km: showDistance && distance ? Number(distance) : null,
        pace: showDistance ? (pace || null) : null,
        description: description || null,
        visibility: 'public',
        city: city || null,
        level: isTennis ? level : null
      });
      Alert.alert('Erstellt', 'Event wurde erstellt.');
      navigation.navigate('EventDetail', { id: row.id });
    } catch (e) {
      Alert.alert('Fehler', e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <View className="flex-1 bg-background p-4">
      <Text className="text-2xl font-bold text-black mb-4">Event erstellen</Text>
      <Input placeholder="Titel" value={title} onChangeText={setTitle} />
      <View className="h-3" />
      <Input placeholder="Sportart (z.B. Laufen, Tennis)" value={sport} onChangeText={setSport} />

      {isTennis && (
        <>
          <View className="h-3" />
          <Text className="text-black mb-2 font-bold">Level</Text>
          <View className="flex-row flex-wrap gap-2">
            {LEVEL_OPTIONS.map((l) => (
              <TouchableOpacity
                key={l}
                onPress={() => setLevel(l)}
                className={`px-3 py-2 rounded-full ${level === l ? 'bg-accent' : 'bg-white border border-gray-200'}`}
              >
                <Text className={`${level === l ? 'text-white' : 'text-black'}`}>{l}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </>
      )}

      <View className="h-3" />
      <Input placeholder="Datum (TT.MM.)" value={dateStr} onChangeText={setDateStr} />
      <View className="h-3" />
      <Input placeholder="Uhrzeit (HH:MM)" value={timeStr} onChangeText={setTimeStr} />
      <View className="h-3" />
      <Input placeholder="Stadt" value={city} onChangeText={setCity} />
      <View className="h-3" />
      <Input placeholder="Treffpunkt (z.B. Kassel Aue)" value={locationText} onChangeText={setLocationText} />

      {showDistance && (
        <>
          <View className="h-3" />
          <Input placeholder="Distanz (km) optional" keyboardType="numeric" value={distance} onChangeText={setDistance} />
          <View className="h-3" />
          <Input placeholder="Pace (z.B. 5:00/km) optional" value={pace} onChangeText={setPace} />
        </>
      )}

      <View className="h-3" />
      <Input placeholder="Beschreibung (optional)" value={description} onChangeText={setDescription} />
      <View className="h-6" />
      <Button title={busy ? 'Erstelle…' : 'Erstellen'} onPress={onCreate} disabled={busy} />
    </View>
  );
}
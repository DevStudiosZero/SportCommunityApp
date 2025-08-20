import React, { useState, useMemo } from 'react';
import { View, Text, Alert, TouchableOpacity } from 'react-native';
import Button from '../components/Button';
import Input from '../components/Input';
import { createEvent } from '../services/events';

const LEVEL_OPTIONS = ['Anfänger', 'Fortgeschritten', 'Pro'];
const SPORT_OPTIONS = ['Laufen', 'Rad', 'Schwimmen', 'Kraft', 'Tennis', 'Volleyball', 'Padel'];

export default function CreateEvent({ navigation }) {
  const [title, setTitle] = useState('');
  const [sport, setSport] = useState('Laufen');
  const [dateStr, setDateStr] = useState('');
  const [timeStr, setTimeStr] = useState('');
  const [city, setCity] = useState('');
  const [locationText, setLocationText] = useState('');
  const [meeting, setMeeting] = useState(null); // {latitude, longitude}
  const [distance, setDistance] = useState('');
  const [pace, setPace] = useState('');
  const [description, setDescription] = useState('');
  const [level, setLevel] = useState('');
  const [pacerWanted, setPacerWanted] = useState(false);
  const [busy, setBusy] = useState(false);

  const isTennis = useMemo(() => sport.trim().toLowerCase() === 'tennis', [sport]);
  const showDistance = useMemo(() => {
    const s = sport.trim().toLowerCase();
    return s === 'laufen' || s === 'rad' || s === 'schwimmen';
  }, [sport]);

  const onPickMap = () => {
    navigation.navigate('MapPicker', {
      initial: meeting,
      onPick: (coord) => setMeeting(coord)
    });
  };

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
        level: isTennis ? level : null,
        pacer_wanted: pacerWanted,
        meeting_lat: meeting?.latitude || null,
        meeting_lng: meeting?.longitude || null
      });
      Alert.alert('Erstellt', 'Event wurde erstellt.');
      navigation.navigate('EventDetail', { id: row.id });
    } catch (e) {
      Alert.alert('Fehler', e.message);
    } finally {
      setBusy(false);
    }
  };

  const Chip = ({ active, label, onPress }) => (
    <TouchableOpacity onPress={onPress} className={`px-3 py-2 rounded-full ${active ? 'bg-accent' : 'bg-white border border-gray-200'}`}>
      <Text className={`${active ? 'text-white' : 'text-black'}`}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-background p-4">
      <Text className="text-2xl font-bold text-black mb-4">Event erstellen</Text>
      <Input placeholder="Titel" value={title} onChangeText={setTitle} />

      <View className="h-3" />
      <Text className="text-black mb-2 font-bold">Sportart</Text>
      <View className="flex-row flex-wrap gap-2">
        {SPORT_OPTIONS.map((s) => (
          <Chip key={s} label={s} active={sport === s} onPress={() => setSport(s)} />
        ))}
      </View>

      {isTennis && (
        <>
          <View className="h-3" />
          <Text className="text-black mb-2 font-bold">Level</Text>
          <View className="flex-row flex-wrap gap-2">
            {LEVEL_OPTIONS.map((l) => (
              <Chip key={l} label={l} active={level === l} onPress={() => setLevel(l)} />
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

      <View className="h-3" />
      <TouchableOpacity onPress={onPickMap} className="bg-white rounded-2xl border border-gray-200 py-3 px-4">
        <Text className="text-black font-bold">Treffpunkt auf Karte wählen</Text>
        {meeting && (
          <Text className="text-gray-600 mt-1">Lat: {meeting.latitude.toFixed(5)}, Lng: {meeting.longitude.toFixed(5)}</Text>
        )}
      </TouchableOpacity>

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
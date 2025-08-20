import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import Input from '../components/Input';
import Button from '../components/Button';
import { useFilters } from '../state/FiltersContext';

const SPORT_OPTIONS = ['Laufen', 'Rad', 'Schwimmen', 'Kraft', 'Tennis', 'Volleyball', 'Padel'];
const LEVEL_OPTIONS = ['Anfänger', 'Fortgeschritten', 'Pro'];

function toISODateOrNull(s) {
  if (!s) return null;
  const dt = new Date(s);
  if (isNaN(dt.getTime())) return null;
  return dt.toISOString();
}

export default function Filters({ navigation }) {
  const { filters, applyFilters, resetFilters } = useFilters();
  const [city, setCity] = useState(filters.city || '');
  const [sports, setSports] = useState(filters.sports || []);
  const [levels, setLevels] = useState(filters.levels || []);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [minDistance, setMinDistance] = useState(filters.minDistance?.toString() || '');
  const [maxDistance, setMaxDistance] = useState(filters.maxDistance?.toString() || '');
  const [pacerOffered, setPacerOffered] = useState(!!filters.pacerOffered);
  const [pacerWanted, setPacerWanted] = useState(!!filters.pacerWanted);

  useEffect(() => {
    if (filters.dateFrom) setDateFrom(new Date(filters.dateFrom).toISOString().slice(0, 10));
    if (filters.dateTo) setDateTo(new Date(filters.dateTo).toISOString().slice(0, 10));
  }, []);

  const toggle = (arr, setArr, value) => {
    setArr((prev) => (prev.includes(value) ? prev.filter((x) => x !== value) : [...prev, value]));
  };

  const showDistance = sports.length === 0 || sports.includes('Laufen') || sports.includes('Rad') || sports.includes('Schwimmen');
  const showLevels = sports.includes('Tennis');

  const apply = () => {
    const next = {
      city: city || '',
      sports,
      levels: showLevels ? levels : [],
      dateFrom: toISODateOrNull(dateFrom),
      dateTo: toISODateOrNull(dateTo),
      minDistance: showDistance && minDistance ? Number(minDistance) : null,
      maxDistance: showDistance && maxDistance ? Number(maxDistance) : null,
      pacerOffered,
      pacerWanted
    };
    if (next.minDistance && next.maxDistance && next.minDistance > next.maxDistance) {
      Alert.alert('Fehler', 'Min. Distanz darf nicht größer als Max. Distanz sein.');
      return;
    }
    applyFilters(next);
    navigation.goBack();
  };

  const clear = () => {
    resetFilters();
    navigation.goBack();
  };

  const FilterChip = ({ active, label, onPress }) => (
    <TouchableOpacity onPress={onPress} className={`px-3 py-2 rounded-full ${active ? 'bg-accent' : 'bg-white border border-gray-200'}`}>
      <Text className={`${active ? 'text-white' : 'text-black'}`}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-background p-4">
      <Text className="text-2xl font-bold text-black mb-4">Filter</Text>

      <Text className="text-black mb-2 font-bold">Stadt</Text>
      <Input placeholder="z.B. Kassel" value={city} onChangeText={setCity} />

      <View className="h-4" />
      <Text className="text-black mb-2 font-bold">Sportarten</Text>
      <View className="flex-row flex-wrap gap-2">
        {SPORT_OPTIONS.map((s) => (
          <TouchableOpacity
            key={s}
            onPress={() => toggle(sports, setSports, s)}
            className={`px-3 py-2 rounded-full ${sports.includes(s) ? 'bg-accent' : 'bg-white border border-gray-200'}`}
          >
            <Text className={`${sports.includes(s) ? 'text-white' : 'text-black'}`}>{s}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {sports.includes('Tennis') && (
        <>
          <View className="h-4" />
          <Text className="text-black mb-2 font-bold">Level (z.B. bei Tennis)</Text>
          <View className="flex-row flex-wrap gap-2">
            {LEVEL_OPTIONS.map((l) => (
              <TouchableOpacity
                key={l}
                onPress={() => toggle(levels, setLevels, l)}
                className={`px-3 py-2 rounded-full ${levels.includes(l) ? 'bg-accent' : 'bg-white border border-gray-200'}`}
              >
                <Text className={`${levels.includes(l) ? 'text-white' : 'text-black'}`}>{l}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </>
      )}

      {showDistance && (
        <>
          <View className="h-4" />
          <Text className="text-black mb-2 font-bold">Distanz (km)</Text>
          <View className="flex-row gap-3">
            <View className="flex-1">
              <Input placeholder="min" keyboardType="numeric" value={minDistance} onChangeText={setMinDistance} />
            </View>
            <View className="flex-1">
              <Input placeholder="max" keyboardType="numeric" value={maxDistance} onChangeText={setMaxDistance} />
            </View>
          </View>
        </>
      )}

      <View className="h-4" />
      <Text className="text-black mb-2 font-bold">Pacer</Text>
      <View className="flex-row flex-wrap gap-2">
        <FilterChip active={pacerOffered} label="Pacer angeboten 🚀" onPress={() => setPacerOffered(!pacerOffered)} />
        <FilterChip active={pacerWanted} label="Pacer gesucht" onPress={() => setPacerWanted(!pacerWanted)} />
      </View>

      <View className="h-4" />
      <Text className="text-black mb-2 font-bold">Datum</Text>
      <View className="flex-row gap-3">
        <View className="flex-1">
          <Input placeholder="von (YYYY-MM-DD)" value={dateFrom} onChangeText={setDateFrom} />
        </View>
        <View className="flex-1">
          <Input placeholder="bis (YYYY-MM-DD)" value={dateTo} onChangeText={setDateTo} />
        </View>
      </View>

      <View className="h-6" />
      <Button title="Anwenden" onPress={apply} />
      <View className="h-3" />
      <TouchableOpacity onPress={clear} className="bg-white rounded-full py-3 border border-gray-200">
        <Text className="text-center text-black font-bold">Zurücksetzen</Text>
      </TouchableOpacity>
    </View>
  );
}
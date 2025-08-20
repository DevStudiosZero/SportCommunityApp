import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';

export default function MapPicker({ navigation, route }) {
  const initial = route.params?.initial || null;
  const [region, setRegion] = useState(null);
  const [marker, setMarker] = useState(initial || null);

  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setRegion({ latitude: 52.52, longitude: 13.405, latitudeDelta: 0.2, longitudeDelta: 0.2 });
          return;
        }
        const loc = await Location.getCurrentPositionAsync({});
        setRegion({
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        });
      } catch (e) {
        setRegion({ latitude: 52.52, longitude: 13.405, latitudeDelta: 0.2, longitudeDelta: 0.2 });
      }
    })();
  }, []);

  const onLongPress = (e) => {
    const { latitude, longitude } = e.nativeEvent.coordinate;
    setMarker({ latitude, longitude });
  };

  const onSave = () => {
    if (!marker) {
      Alert.alert('Hinweis', 'Bitte wähle einen Punkt auf der Karte (Long Press).');
      return;
    }
    navigation.goBack();
    route.params?.onPick?.(marker);
  };

  if (!region) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <Text className="text-black">Karte lädt…</Text>
      </View>
    );
  }

  return (
    <View className="flex-1">
      <MapView style={{ flex: 1 }} initialRegion={region} onLongPress={onLongPress}>
        {marker && <Marker coordinate={marker} />}
      </MapView>
      <View className="absolute bottom-6 left-4 right-4">
        <TouchableOpacity onPress={onSave} className="bg-accent rounded-full py-4">
          <Text className="text-white text-center font-bold">Treffpunkt übernehmen</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
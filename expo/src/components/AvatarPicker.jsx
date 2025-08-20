import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { uploadAvatar } from '../services/profile';
import { useToast } from '../state/ToastContext';

export default function AvatarPicker({ value, onChange }) {
  const [uploading, setUploading] = useState(false);
  const { show } = useToast();

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      show('Zugriff auf die Fotobibliothek verweigert', 'error');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8
    });
    if (result.canceled) return;
    const asset = result.assets[0];
    setUploading(true);
    try {
      const { url } = await uploadAvatar(asset.uri);
      onChange?.(url);
      show('Avatar aktualisiert', 'success');
    } catch (e) {
      show(e.message || 'Upload fehlgeschlagen', 'error');
    } finally {
      setUploading(false);
    }
  };

  return (
    <View className="flex-row items-center">
      {value ? (
        <Image source={{ uri: value }} style={{ width: 64, height: 64, borderRadius: 32 }} />
      ) : (
        <View className="w-[64px] h-[64px] rounded-full bg-accent items-center justify-center">
          <Text className="text-white font-bold text-xl">🙂</Text>
        </View>
      )}
      <TouchableOpacity onPress={pickImage} className="ml-3 bg-accent rounded-full px-4 py-2">
        {uploading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text className="text-white font-bold">Avatar wählen</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}
import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Animated, PanResponder, Dimensions, TouchableOpacity, Image } from 'react-native';
import { supabase } from '../supabaseClient';
import { useToast } from '../state/ToastContext';

const { width } = Dimensions.get('window');
const SWIPE_THRESHOLD = 0.25 * width;

function Card({ profile }) {
  return (
    <View className="bg-white rounded-[20px] shadow-card p-4 w-full h-[420px]">
      <View className="items-center mb-3">
        {profile?.avatar_url ? (
          <Image source={{ uri: profile.avatar_url }} style={{ width: 120, height: 120, borderRadius: 60 }} />
        ) : (
          <View className="w-[120px] h-[120px] rounded-full bg-accent items-center justify-center">
            <Text className="text-white text-4xl font-bold">{(profile?.full_name || 'A').slice(0,1).toUpperCase()}</Text>
          </View>
        )}
      </View>
      <Text className="text-2xl font-bold text-black text-center">{profile.full_name || 'Athlet'}</Text>
      {profile.city ? <Text className="text-gray-600 text-center">{profile.city}</Text> : null}
      {Array.isArray(profile.sports) && profile.sports.length > 0 && (
        <View className="flex-row flex-wrap justify-center mt-3">
          {profile.sports.map((s) => (
            <View key={s} className="px-3 py-2 rounded-full bg-background border border-gray-200 mr-2 mb-2">
              <Text className="text-black">{s}</Text>
            </View>
          ))}
        </View>
      )}
      <Text className="text-gray-600 mt-3 text-center">Swipe links/rechts, Hoch für Profil</Text>
    </View>
  );
}

export default function Matching({ navigation }) {
  const [profiles, setProfiles] = useState([]);
  const [index, setIndex] = useState(0);
  const position = useRef(new Animated.ValueXY()).current;
  const rotate = position.x.interpolate({ inputRange: [-width / 2, 0, width / 2], outputRange: ['-15deg', '0deg', '15deg'] });
  const { show } = useToast();

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      const { data } = await supabase.from('profiles').select('id, full_name, city, sports, avatar_url').neq('id', user?.id).limit(25);
      setProfiles(data || []);
    })();
  }, []);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gesture) => {
        position.setValue({ x: gesture.dx, y: gesture.dy });
      },
      onPanResponderRelease: (_, gesture) => {
        if (gesture.dy < -120) {
          // Open profile
          const p = profiles[index];
          navigation.navigate('UserProfile', { userId: p.id });
          resetPosition();
          return;
        }
        if (gesture.dx > SWIPE_THRESHOLD) {
          forceSwipe('right');
        } else if (gesture.dx < -SWIPE_THRESHOLD) {
          forceSwipe('left');
        } else {
          resetPosition();
        }
      }
    })
  ).current;

  const forceSwipe = (direction) => {
    Animated.timing(position, {
      toValue: { x: direction === 'right' ? width : -width, y: 0 },
      duration: 200,
      useNativeDriver: false,
    }).start(() => onSwipeComplete(direction));
  };

  const onSwipeComplete = (direction) => {
    const p = profiles[index];
    if (direction === 'right') show(`Match mit ${p.full_name || 'Athlet'}!`, 'success');
    setIndex((prev) => prev + 1);
    position.setValue({ x: 0, y: 0 });
  };

  const resetPosition = () => {
    Animated.spring(position, { toValue: { x: 0, y: 0 }, useNativeDriver: false }).start();
  };

  const renderCards = () => {
    if (profiles.length === 0) {
      return <Text className="text-gray-600">Keine Kandidaten</Text>;
    }
    if (index >= profiles.length) {
      return <Text className="text-gray-600">Keine weiteren Kandidaten</Text>;
    }

    return profiles
      .map((p, i) => {
        if (i < index) return null;
        if (i === index) {
          return (
            <Animated.View key={p.id} {...panResponder.panHandlers} style={{ transform: [{ translateX: position.x }, { translateY: position.y }, { rotate }] }}>
              <Card profile={p} />
            </Animated.View>
          );
        }
        return (
          <View key={p.id} style={{ position: 'absolute', top: 0, left: 0, right: 0 }}>
            <Card profile={p} />
          </View>
        );
      })
      .reverse();
  };

  return (
    <View className="flex-1 bg-background p-4 items-center justify-center">
      <View style={{ width: '100%', height: 440 }}>
        {renderCards()}
      </View>
      <View className="flex-row mt-4">
        <TouchableOpacity onPress={() => forceSwipe('left')} className="bg-white border border-gray-200 rounded-full px-6 py-3 mr-3">
          <Text className="text-black font-bold">Skip</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => forceSwipe('right')} className="bg-accent rounded-full px-6 py-3">
          <Text className="text-white font-bold">Match</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
import React from 'react';
import { TouchableOpacity, Text } from 'react-native';

export default function Button({ title, onPress, style, textStyle, disabled }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      className={`w-full py-4 rounded-full bg-accent ${disabled ? 'opacity-50' : ''}`}
      style={style}
    >
      <Text className="text-white text-center font-bold text-base" style={textStyle}>
        {title}
      </Text>
    </TouchableOpacity>
  );
}
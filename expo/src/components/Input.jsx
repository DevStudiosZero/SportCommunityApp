import React from 'react';
import { TextInput } from 'react-native';

export default function Input(props) {
  return (
    <TextInput
      className="w-full px-4 py-3 bg-white rounded-2xl border border-gray-200"
      placeholderTextColor="#777"
      {...props}
    />
  );
}
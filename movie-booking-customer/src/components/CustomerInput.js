import React from 'react';
import { View, TextInput, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function CustomerInput({ 
  value, 
  onChangeText, 
  placeholder, 
  secureTextEntry, 
  keyboardType, 
  autoCapitalize, 
  label,
  icon
}) {
  return (
    <View className="mb-5">
      {label && (
        <Text className="text-[10px] font-black text-gray-500 mb-2 uppercase tracking-[2px] ml-1">
          {label}
        </Text>
      )}
      <View className="flex-row items-center bg-[#141420] rounded-2xl border border-[#1E1E2E] px-4 h-14 focus:border-[#00D4FF]">
        {icon && <Ionicons name={icon} size={20} color="#555" className="mr-3" />}
        <TextInput
          className="flex-1 text-white text-base font-medium"
          placeholder={placeholder}
          placeholderTextColor="#4b5563"
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
        />
      </View>
    </View>
  );
}

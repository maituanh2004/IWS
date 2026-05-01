import React from 'react';
import { View, TextInput, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useUI } from '../context/UIContext';

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
  const { colors, theme } = useUI();

  return (
    <View className="mb-5">
      {label && (
        <Text className={`text-[10px] font-black ${colors.textSecondary} mb-2 uppercase tracking-[2px] ml-1`}>
          {label}
        </Text>
      )}
      <View className={`flex-row items-center ${theme === 'dark' ? 'bg-[#141420]' : 'bg-gray-100'} rounded-2xl border ${colors.border} px-4 h-14 focus:border-[#00D4FF]`}>
        {icon && <Ionicons name={icon} size={20} color="#555" className="mr-3" />}
        <TextInput
          className={`flex-1 ${colors.text} text-base font-medium`}
          placeholder={placeholder}
          placeholderTextColor="#888"
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

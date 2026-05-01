import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

import { useUI } from '../context/UIContext';

export default function Header({ title, showBack = true, rightElement, subTitle }) {
  const navigation = useNavigation();
  const { colors } = useUI();

  return (
    <View className={`flex-row items-center justify-between px-4 py-4 ${colors.headerBg} border-b ${colors.border}`}>
      <View className="w-10">
        {showBack && (
          <TouchableOpacity 
            onPress={() => navigation.goBack()}
            className="w-9 h-9 items-center justify-center rounded-full bg-white/5"
          >
            <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
          </TouchableOpacity>
        )}
      </View>

      <View className="flex-1 items-center">
        <Text className={`${colors.text} text-lg font-extrabold`} numberOfLines={1}>
          {title}
        </Text>
        {subTitle && (
          <Text className="text-gray-500 text-xs mt-0.5">{subTitle}</Text>
        )}
      </View>

      <View className="w-10 items-end">
        {rightElement}
      </View>
    </View>
  );
}

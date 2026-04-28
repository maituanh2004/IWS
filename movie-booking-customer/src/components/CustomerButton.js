import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function CustomerButton({ onPress, title, loading, variant = 'primary', disabled, className = '' }) {
  const isPrimary = variant === 'primary';
  
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      className={`rounded-2xl overflow-hidden mb-4 ${className} ${disabled ? 'opacity-50' : ''}`}
    >
      {isPrimary ? (
        <LinearGradient
          colors={['#00D4FF', '#00AACC']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          className="h-14 items-center justify-center"
        >
          {loading ? (
            <ActivityIndicator color="#0A0A0F" />
          ) : (
            <Text className="text-[#0A0A0F] text-base font-black uppercase tracking-widest italic">{title}</Text>
          )}
        </LinearGradient>
      ) : (
        <View className="h-14 items-center justify-center border border-[#1E1E2E] bg-transparent">
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text className="text-white text-base font-bold">{title}</Text>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
}

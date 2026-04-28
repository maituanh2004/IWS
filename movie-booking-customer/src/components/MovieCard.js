import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export default function MovieCard({ movie, onPress, width = '31%' }) {
  return (
    <TouchableOpacity
      style={{ width }}
      onPress={onPress}
      activeOpacity={0.8}
      className="mb-4"
    >
      <View className="aspect-[0.65] rounded-xl overflow-hidden relative mb-2">
        {movie.poster ? (
          <Image source={{ uri: movie.poster }} className="w-full h-full" resizeMode="cover" />
        ) : (
          <LinearGradient
            colors={movie.gradientColors || ['#1E1E2E', '#0A0A0F']}
            className="flex-1 items-center justify-center"
          >
            <Ionicons name="film-outline" size={32} color="rgba(255,255,255,0.2)" />
          </LinearGradient>
        )}

        {/* Rating Badge */}
        <View className="absolute top-2 left-2 flex-row items-center bg-black/70 px-2 py-1 rounded-lg">
          <Ionicons name="star" size={10} color="#F4C430" />
          <Text className="text-white text-[10px] font-bold ml-1">{movie.rating}</Text>
        </View>
      </View>

      <Text className="text-white text-xs font-bold" numberOfLines={1}>
        {movie.title}
      </Text>
      <Text className="text-gray-500 text-[10px]" numberOfLines={1}>
        {movie.genre}
      </Text>
    </TouchableOpacity>
  );
}

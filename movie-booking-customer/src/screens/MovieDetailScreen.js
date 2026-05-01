/**
 * MovieDetailScreen.js
 * Requires: npx expo install expo-linear-gradient
 */

import React from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useUI } from '../context/UIContext';
import ScreenWrapper from '../components/ScreenWrapper';

const { width: SCREEN_W } = Dimensions.get('window');

export default function MovieDetailScreen({ route, navigation }) {
  const { movie } = route.params;
  const { t, colors, theme } = useUI();

  const bgColor = theme === 'dark' ? '#0A0A0F' : '#F8F9FA';
  const textColor = theme === 'dark' ? '#FFFFFF' : '#1A1A2E';
  const subTextColor = theme === 'dark' ? '#9ca3af' : '#6b7280';
  const overlayColors = theme === 'dark'
    ? ['transparent', 'rgba(10,10,15,0.6)', '#0A0A0F']
    : ['transparent', 'rgba(248,249,250,0.6)', '#F8F9FA'];

  return (
    <ScreenWrapper>
      <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
        {/* Poster Backdrop */}
        <View className="h-[480px] relative">
          {movie.poster ? (
            <Image source={{ uri: movie.poster }} className="w-full h-full" resizeMode="cover" />
          ) : (
            <LinearGradient colors={['#2C0A0A', '#1A0505']} className="w-full h-full" />
          )}
          
          <LinearGradient
            colors={overlayColors}
            className="absolute inset-0"
          />

          {/* Top Actions */}
          <View className="absolute top-12 left-4 right-4 flex-row justify-between">
            <TouchableOpacity 
              onPress={() => navigation.goBack()}
              className="w-10 h-10 rounded-full bg-black/40 items-center justify-center border border-white/20"
            >
              <Ionicons name="arrow-back" size={24} color="#FFF" />
            </TouchableOpacity>
          </View>

          {/* Movie Title Overlay */}
          <View className="absolute bottom-6 left-5 right-5">
            <View className="flex-row items-center gap-2.5 mb-2">
              <View className="bg-[#00D4FF] px-2 py-0.5 rounded-md">
                <Text className="text-[#0A0A0F] text-[10px] font-black italic">TRENDING</Text>
              </View>
              <View className="bg-[#F4C430] px-2 py-0.5 rounded-md">
                <Text className="text-[#0A0A0F] text-[10px] font-black italic">IMAX</Text>
              </View>
              <Text className="text-gray-300 text-xs font-bold tracking-widest">{
                Array.isArray(movie.genre)
                ? movie.genre.join(', ')
                : movie.genre?.toUpperCase()}</Text>
            </View>
            <Text style={{ color: textColor }} className="text-4xl font-black italic mb-2">{movie.title}</Text>
            
            <View className="flex-row items-center gap-5">
              <View className="flex-row items-center gap-1.5">
                <Ionicons name="star" size={16} color="#F4C430" />
                <Text style={{ color: textColor }} className="text-sm font-black">{movie.rating || '9.0'}</Text>
              </View>
              <View className="flex-row items-center gap-1.5">
                <Ionicons name="time-outline" size={16} color={subTextColor} />
                <Text style={{ color: subTextColor }} className="text-sm font-bold">{movie.duration || '150'} min</Text>
              </View>
              <View className="flex-row items-center gap-1.5">
                <Ionicons name="calendar-outline" size={16} color={subTextColor} />
                <Text style={{ color: subTextColor }} className="text-sm font-bold">{movie.releaseDate ? new Date(movie.releaseDate).getFullYear() : '2025'}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Description */}
        <View style={{ backgroundColor: bgColor }} className="px-5 pt-2 pb-32">
          <Text style={{ color: textColor }} className="text-lg font-black italic mb-3 tracking-widest uppercase">{t('synopsis') || 'SYNOPSIS'}</Text>
          <Text style={{ color: subTextColor }} className="text-base leading-6 font-medium">
            {movie.description || "Movie description is being updated. Stay tuned for this masterpiece at CINEVIET."}
          </Text>
        </View>
      </ScrollView>

      {/* Floating CTA */}
      <View style={{ backgroundColor: bgColor + 'E6' }} className="absolute bottom-0 left-0 right-0 px-6 pb-9 pt-4 border-t border-[#1E1E2E]">
        <TouchableOpacity
          className="rounded-2xl overflow-hidden shadow-xl shadow-[#00D4FF]/30"
          onPress={() => navigation.navigate('ShowtimeList', { movie })}
        >
          <LinearGradient
            colors={['#00D4FF', '#00AACC']}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            className="h-14 items-center justify-center"
          >
            <View className="flex-row items-center gap-3">
              <Ionicons name="ticket-outline" size={22} color="#0A0A0F" />
              <Text className="text-[#0A0A0F] text-base font-black italic tracking-widest">{t('book_now') || 'BOOK NOW'}</Text>
            </View>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </ScreenWrapper>
  );
}

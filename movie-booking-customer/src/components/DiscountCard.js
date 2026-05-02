import React from 'react';
import { View, Text, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useUI } from '../context/UIContext';

export default function DiscountCard({ movie, showtime, seats, bookingCode, cinemaName }) {
  const { t, colors } = useUI();
  const time = showtime ? new Date(showtime.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
  const date = showtime ? new Date(showtime.startTime).toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: '2-digit' }) : '';

  return (
    <View className="w-full mb-5 relative">
      {/* Top Part */}
      <View className="bg-white rounded-t-3xl p-5 pb-4">
        <View className="flex-row gap-4 mb-4">
          <View className="w-22 h-28 rounded-xl overflow-hidden bg-gray-100">
            {movie?.poster ? (
              <Image source={{ uri: movie.poster }} className="w-full h-full" resizeMode="cover" />
            ) : (
              <LinearGradient colors={['#3A1A00', '#8B3A00']} className="flex-1 items-center justify-center">
                <Text className="text-3xl">🎬</Text>
              </LinearGradient>
            )}
          </View>

          <View className="flex-1 justify-center gap-1">
            <Text className="text-[#0A0A0F] text-lg font-extrabold leading-6" numberOfLines={2}>{movie?.title}</Text>
            <Text className="text-gray-500 text-sm">{t('room')} {showtime?.room || '?'} • {cinemaName}</Text>
            <View className="flex-row gap-1.5 mt-1">
              <View className="bg-[#F4C430] px-2 py-0.5 rounded-md">
                <Text className="text-[#0A0A0F] text-[11px] font-extrabold">IMAX 3D</Text>
              </View>
              <View className="bg-[#2A2A3A] px-2 py-0.5 rounded-md">
                <Text className="text-white text-[11px] font-bold">T13</Text>
              </View>
            </View>
          </View>
        </View>

        <View className="h-[1px] bg-gray-100 mb-4" />

        <View className="flex-row gap-8 mb-4">
          <View className="gap-1">
            <Text className="text-gray-400 text-[10px] font-bold tracking-widest">{t('date')}</Text>
            <Text className="text-[#0A0A0F] text-xl font-extrabold">{date}</Text>
          </View>
          <View className="gap-1">
            <Text className="text-gray-400 text-[10px] font-bold tracking-widest">{t('time')}</Text>
            <Text className="text-[#0A0A0F] text-xl font-extrabold">{time}</Text>
          </View>
        </View>

        <View className="gap-1">
          <Text className="text-gray-400 text-[10px] font-bold tracking-widest">{t('seats')}</Text>
          <Text className="text-[#0A0A0F] text-2xl font-extrabold">{seats?.join(', ')}</Text>
        </View>
      </View>

      {/* Tear Line */}
      <View className="flex-row items-center h-9 relative">
        <View className={`w-4.5 h-9 ${colors.background} rounded-r-full absolute left-0 z-10`} />
        <View className="flex-1 flex-row items-center justify-center gap-1 px-8">
          {Array.from({ length: 20 }).map((_, i) => (
            <View key={i} className="w-2 h-[1.5px] bg-gray-400 rounded-full" />
          ))}
        </View>
        <View className="absolute left-1/2 -translate-x-2 z-20">
          <Ionicons name="cut-outline" size={18} color="#AAA" />
        </View>
        <View className={`w-4.5 h-9 ${colors.background} rounded-l-full absolute right-0 z-10`} />
      </View>

      {/* Bottom Part */}
      <View className="bg-[#E8E8EE] rounded-b-3xl py-6 items-center justify-center">
        <Text className="text-gray-400 text-sm font-semibold">
          {t('ticket_display_note')}
        </Text>
      </View>
      
      {/* Corner decorations */}
      <View className={`absolute -top-px -left-px w-5 h-5 rounded-tl-3xl ${colors.background}`} />
      <View className={`absolute -top-px -right-px w-5 h-5 rounded-tr-3xl ${colors.background}`} />
      <View className={`absolute -bottom-px -left-px w-5 h-5 rounded-bl-3xl ${colors.background}`} />
      <View className={`absolute -bottom-px -right-px w-5 h-5 rounded-br-3xl ${colors.background}`} />
    </View>
  );
}

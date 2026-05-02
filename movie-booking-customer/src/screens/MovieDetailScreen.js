import React from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Share,
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
  const cardColor = theme === 'dark' ? '#141420' : '#FFFFFF';
  const textColor = theme === 'dark' ? '#FFFFFF' : '#1A1A2E';
  const subTextColor = theme === 'dark' ? '#9ca3af' : '#6b7280';
  const borderColor = theme === 'dark' ? '#1E1E2E' : '#E5E7EB';
  const overlayColors = theme === 'dark'
    ? ['transparent', 'rgba(10,10,15,0.4)', '#0A0A0F']
    : ['transparent', 'rgba(248,249,250,0.4)', '#F8F9FA'];

  const onShare = async () => {
    try {
      await Share.share({
        message: `${t('share')}: ${movie.title}\n${movie.description || ''}`,
      });
    } catch (error) {
      console.error('Error sharing:', error.message);
    }
  };

  return (
    <ScreenWrapper>
      <ScrollView showsVerticalScrollIndicator={false} className="flex-1" style={{ backgroundColor: bgColor }}>
        {/* Poster Backdrop */}
        <View className="h-[400px] relative">
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
        </View>

        {/* Content Section */}
        <View className="px-5 -mt-24 pb-32">
          {/* Header Card */}
          <View className="flex-row gap-4 mb-8">
            {/* Small Poster Overlay */}
            <View className="w-32 h-48 rounded-2xl overflow-hidden shadow-2xl shadow-black/50 border-2 border-white/10">
              {movie.poster ? (
                <Image source={{ uri: movie.poster }} className="w-full h-full" />
              ) : (
                <View className="w-full h-full bg-[#1E1E2E] items-center justify-center">
                  <Ionicons name="film-outline" size={40} color="#3F3F4F" />
                </View>
              )}
            </View>

            {/* Title & Quick Info */}
            <View className="flex-1 justify-end pb-2">
              <View className="flex-row items-center gap-1.5 mb-1.5">
                <View className="bg-[#00D4FF] px-1.5 py-0.5 rounded">
                  <Text className="text-[#0A0A0F] text-[9px] font-black italic">PREMIUM</Text>
                </View>
                <Text style={{ color: colors.accent }} className="text-xs font-bold tracking-widest uppercase">
                  {Array.isArray(movie.genre) ? movie.genre[0] : movie.genre}
                </Text>
              </View>
              <Text style={{ color: textColor }} className="text-2xl font-black italic mb-2 leading-tight">{movie.title}</Text>

              <View className="flex-row items-center gap-4">
                <View className="flex-row items-center gap-1">
                  <Ionicons name="star" size={14} color="#F4C430" />
                  <Text style={{ color: textColor }} className="text-xs font-black">{movie.rating || '9.0'}</Text>
                </View>
                <View className="flex-row items-center gap-1">
                  <Ionicons name="time-outline" size={14} color={subTextColor} />
                  <Text style={{ color: subTextColor }} className="text-xs font-bold">{movie.duration || '120'}m</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Info Grid */}
          <View style={{ backgroundColor: cardColor, borderColor: borderColor }} className="p-4 rounded-3xl border mb-6 flex-row flex-wrap">
            <View className="w-1/2 mb-4">
              <Text style={{ color: subTextColor }} className="text-[10px] font-bold tracking-widest uppercase mb-1">{t('director')}</Text>
              <Text style={{ color: textColor }} className="text-sm font-black italic">{t('director_placeholder')}</Text>
            </View>
            <View className="w-1/2 mb-4">
              <Text style={{ color: subTextColor }} className="text-[10px] font-bold tracking-widest uppercase mb-1">{t('format')}</Text>
              <Text style={{ color: textColor }} className="text-sm font-black italic">2D / 3D / IMAX</Text>
            </View>
            <View className="w-1/2">
              <Text style={{ color: subTextColor }} className="text-[10px] font-bold tracking-widest uppercase mb-1">{t('producer')}</Text>
              <Text style={{ color: textColor }} className="text-sm font-black italic">{t('producer_placeholder')}</Text>
            </View>
            <View className="w-1/2 justify-end">
              <TouchableOpacity onPress={onShare} className="flex-row items-center gap-2">
                <View className="w-6 h-6 rounded-full items-center justify-center" style={{ backgroundColor: colors.primary + '20' }}>
                  <Ionicons name="share-social" size={14} color={colors.primary} />
                </View>
                <Text style={{ color: colors.primary }} className="text-sm font-black italic">{t('share')}</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Synopsis */}
          <View className="mb-6">
            <Text style={{ color: textColor }} className="text-lg font-black italic mb-2 tracking-widest uppercase">{t('synopsis')}</Text>
            <Text style={{ color: subTextColor }} className="text-sm leading-6 font-medium text-justify">
              {movie.description || t('movie_desc_placeholder')}
            </Text>
          </View>

          {/* Cast Text Section */}
          <View className="mb-6">
            <Text style={{ color: textColor }} className="text-lg font-black italic mb-2 tracking-widest uppercase">{t('cast')}</Text>
            <Text style={{ color: subTextColor }} className="text-sm leading-6 font-medium italic">
              {t('cast_placeholder')}
            </Text>
          </View>
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

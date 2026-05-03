import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  Dimensions,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import ScreenWrapper from '../components/ScreenWrapper';
import * as api from '../services/api';
import { useUI } from '../context/UIContext';

const { width } = Dimensions.get('window');

const formatVND = (n) => (n ? n.toLocaleString('vi-VN') + 'đ' : '0đ');

export default function PaymentSuccessScreen({ route, navigation }) {
  const { t } = useUI();
  const [loading, setLoading] = useState(false);
  const [details, setDetails] = useState({
    bookingId: route.params?.bookingGroupId || '',
    movieTitle: route.params?.movieTitle || '',
    seats: route.params?.seats || [],
    totalPrice: route.params?.totalPrice || 0,
    cinemaName: route.params?.cinemaName || 'CineViet',
    showtime: route.params?.showtime || null,
  });
  console.log("ROUTE PARAMS:", route.params);

  const { status, bookingGroupId } = route.params ?? {};

  const scaleAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const ring1 = useRef(new Animated.Value(1)).current;
  const ring2 = useRef(new Animated.Value(1)).current;
  const ring3 = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (status === 'FAILED' || status === 'fail') {
      navigation.replace('PaymentFail', {bookingGroupId});
      return;
    }

    if (!bookingGroupId) {
      Alert.alert("Lỗi", "Thiếu bookingGroupId");
      navigation.replace("MovieList");
      return;
    }

    fetchBookingDetails();
  }, []);

  useEffect(() => {
    // fallback để không bị invisible
    fadeAnim.setValue(1);
    scaleAnim.setValue(1);
    slideAnim.setValue(0);

    // animate nhẹ sau đó
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

  }, []);

  const fetchBookingDetails = async (retry = 0) => {
    try {
      if (retry === 0) setLoading(true);

      const res = await api.getBookingByGroupId(bookingGroupId);
      const group = res.data.data;

      console.log("FETCH GROUP:", group);

      if (!group) {
        if (retry < 5) {
          setTimeout(() => fetchBookingDetails(retry + 1), 1500);
          return;
        }

        Alert.alert("Lỗi", "Không lấy được booking");
        return;
      }

      setDetails({
        bookingId: group.bookingGroupId,
        movieTitle: group.showtime?.movie?.title || 'Unknown Movie',
        seats: group.seats || [],
        totalPrice: group.totalPrice || 0,
        cinemaName: 'CineViet',
        showtime: group.showtime,
      });

    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const bookingCode = details.bookingId
    ? `#${details.bookingId.slice(-8).toUpperCase()}`
    : '#' + Math.random().toString(36).substr(2, 8).toUpperCase();

  const startTime = details.showtime?.startTime
    ? new Date(details.showtime.startTime)
    : null;

  if (loading) {
    return (
      <ScreenWrapper>
        <View className="flex-1 bg-[#0A0A0F] justify-center items-center gap-4">
          <ActivityIndicator size="large" color="#00D4FF" />
          <Text className="text-gray-500 font-bold tracking-widest">{t('loading_booking')}</Text>
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      {/* Background glow */}
      <View className="absolute inset-0">
        <LinearGradient
          colors={['#0A0A0F', '#071A10', '#0A0A0F']}
          className="flex-1"
        />
      </View>

      <View className="flex-1 justify-center items-center px-6">
        {/* Animated success icon */}
        <Animated.View style={{ transform: [{ scale: scaleAnim }] }} className="items-center mb-8">
          {/* Rings */}
          <Animated.View
            style={{
              position: 'absolute',
              width: 160,
              height: 160,
              borderRadius: 80,
              borderWidth: 1,
              borderColor: 'rgba(0,212,255,0.15)',
              transform: [{ scale: ring1 }],
            }}
          />
          <Animated.View
            style={{
              position: 'absolute',
              width: 140,
              height: 140,
              borderRadius: 70,
              borderWidth: 1,
              borderColor: 'rgba(0,212,255,0.25)',
              transform: [{ scale: ring2 }],
            }}
          />
          <Animated.View
            style={{
              position: 'absolute',
              width: 120,
              height: 120,
              borderRadius: 60,
              borderWidth: 1,
              borderColor: 'rgba(0,212,255,0.4)',
              transform: [{ scale: ring3 }],
            }}
          />

          {/* Main circle */}
          <LinearGradient
            colors={['#00D4FF', '#00AACC']}
            className="w-24 h-24 rounded-full items-center justify-center shadow-2xl"
            style={{ shadowColor: '#00D4FF', shadowOpacity: 0.6, shadowRadius: 30, elevation: 20 }}
          >
            <Ionicons name="checkmark" size={52} color="#0A0A0F" />
          </LinearGradient>
        </Animated.View>

        {/* Title */}
        <Animated.View
          style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}
          className="items-center w-full"
        >
          <Text className="text-[#00D4FF] text-xs font-black tracking-[6px] uppercase mb-2">
            {t('payment_complete')}
          </Text>
          <Text className="text-white text-4xl font-black italic tracking-tight mb-1">
            {t('booking') || 'BOOKING'}
          </Text>
          <Text className="text-white text-4xl font-black italic tracking-tight mb-6">
            {t('confirmed_badge') === 'confirmed_badge' ? 'CONFIRMED!' : t('confirmed_badge')}
          </Text>

          {/* Booking code card */}
          <View
            className="w-full bg-[#141420] rounded-3xl p-6 border border-[#1E1E2E] mb-4"
            style={{ borderColor: 'rgba(0,212,255,0.15)' }}
          >
            {/* Booking code */}
            <View className="items-center mb-5">
              <Text className="text-gray-500 text-[10px] font-black tracking-[4px] uppercase mb-2">
                {t('booking_code')}
              </Text>
              <View className="bg-[#00D4FF]/10 px-6 py-3 rounded-2xl border border-[#00D4FF]/30">
                <Text className="text-[#00D4FF] text-2xl font-black tracking-widest">
                  {bookingCode}
                </Text>
              </View>
            </View>

            {/* Divider */}
            <View className="flex-row items-center gap-2 mb-5">
              <View className="flex-1 h-[1px] bg-[#1E1E2E]" />
              <Ionicons name="ticket-outline" size={14} color="#555" />
              <View className="flex-1 h-[1px] bg-[#1E1E2E]" />
            </View>

            {/* Movie info */}
            <View className="gap-3">
              <View className="flex-row justify-between items-start">
                <Text className="text-gray-500 text-xs font-bold uppercase tracking-widest">{t('movie') || 'Movie'}</Text>
                <Text className="text-white text-sm font-bold text-right flex-1 ml-4" numberOfLines={2}>
                  {details.movieTitle || '—'}
                </Text>
              </View>

              {details.cinemaName ? (
                <View className="flex-row justify-between items-center">
                  <Text className="text-gray-500 text-xs font-bold uppercase tracking-widest">{t('cinema')}</Text>
                  <Text className="text-white text-sm font-bold">{details.cinemaName}</Text>
                </View>
              ) : null}

              {startTime ? (
                <View className="flex-row justify-between items-center">
                  <Text className="text-gray-500 text-xs font-bold uppercase tracking-widest">{t('date_time')}</Text>
                  <Text className="text-white text-sm font-bold">
                    {startTime.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                    {'  '}
                    {startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </View>
              ) : null}

              {Array.isArray(details.seats) && details.seats.length > 0 ? (
                <View className="flex-row justify-between items-center">
                  <Text className="text-gray-500 text-xs font-bold uppercase tracking-widest">{t('seats')}</Text>
                  <Text className="text-white text-sm font-bold">{details.seats.join(', ')}</Text>
                </View>
              ) : null}

              <View className="h-[1px] bg-[#1E1E2E] my-1" />

              <View className="flex-row justify-between items-center">
                <Text className="text-gray-500 text-xs font-bold uppercase tracking-widest">{t('total_paid')}</Text>
                <Text className="text-[#00D4FF] text-xl font-black">{formatVND(details.totalPrice)}</Text>
              </View>
            </View>
          </View>

          {/* Info note */}
          <View className="flex-row items-center gap-2 mb-8 px-2">
            <Ionicons name="mail-outline" size={14} color="#555" />
            <Text className="text-gray-600 text-xs text-center flex-1 leading-5">
              {t('ticket_email_note')}
            </Text>
          </View>

          {/* Buttons */}
          <TouchableOpacity
            className="w-full rounded-2xl overflow-hidden mb-3 shadow-lg"
            style={{ shadowColor: '#00D4FF', shadowOpacity: 0.3, shadowRadius: 12, elevation: 8 }}
            onPress={() => navigation.navigate('DiscountHistory')}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={['#00D4FF', '#00AACC']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              className="h-14 items-center justify-center"
            >
              <View className="flex-row items-center gap-2.5">
                <Ionicons name="ticket-outline" size={20} color="#0A0A0F" />
                <Text className="text-[#0A0A0F] text-base font-black tracking-wider">
                  {t('view_my_tickets')}
                </Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            className="w-full h-14 rounded-2xl items-center justify-center border border-[#1E1E2E]"
            onPress={() => navigation.navigate('MovieList')}
            activeOpacity={0.7}
          >
            <View className="flex-row items-center gap-2">
              <Ionicons name="film-outline" size={18} color="#AAA" />
              <Text className="text-gray-400 text-sm font-bold">
                {t('browse_more')}
              </Text>
            </View>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </ScreenWrapper>
  );
}

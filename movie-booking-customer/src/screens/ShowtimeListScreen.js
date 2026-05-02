import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
  Dimensions,
  ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useUI } from '../context/UIContext';
import * as api from '../services/api';
import ScreenWrapper from '../components/ScreenWrapper';

const { width: SCREEN_W } = Dimensions.get('window');

const DAY_COLORS = {
  0: '#FF6B5A',
  1: '#00D4FF',
  2: '#A855F7',
  3: '#00D4FF',
  4: '#F4C430',
  5: '#4CAF50',
  6: '#FF6B5A',
};

export default function ShowtimeListScreen({ route, navigation }) {
  const { movie } = route.params;
  const { t, colors, theme } = useUI();
  const [showtimes, setShowtimes] = useState([]);
  const [loading, setLoading] = useState(true);

  const bgColor = theme === 'dark' ? '#0A0A0F' : '#F8F9FA';
  const cardBg = theme === 'dark' ? ['#141420', '#0F0F1C'] : ['#FFFFFF', '#F0F0F5'];
  const textColor = theme === 'dark' ? '#FFFFFF' : '#1A1A2E';
  const subTextColor = theme === 'dark' ? '#6b7280' : '#9ca3af';
  const borderColor = theme === 'dark' ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.08)';
  const generateDates = (days = 7) => {
    const dates = [];
    const today = new Date();

    for (let i = 0; i < days; i++) {
      const d = new Date();
      d.setDate(today.getDate() + i);
      dates.push(d.toDateString());
    }

    return dates;
  };

  const uniqueDates = generateDates(7); // 7 ngày tới
  const [selectedDate, setSelectedDate] = useState(null);

  useEffect(() => {
    loadShowtimes();
  }, [movie._id]);

  useEffect(() => {
    if (showtimes.length > 0 && !selectedDate) {
      setSelectedDate(new Date(showtimes[0].startTime).toDateString());
    }
  }, [showtimes]);
  
  const filteredShowtimes = showtimes.filter(st => {
    return new Date(st.startTime).toDateString() === selectedDate;
  });

  const loadShowtimes = async () => {
    try {
      const response = await api.getShowtimesByMovie(movie._id);
      setShowtimes(response.data.data);
    } catch (error) {
      console.error('Error loading showtimes:', error?.response?.data || error.message);
      Alert.alert('Error', `Failed to load showtimes: ${error?.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const renderShowtime = ({ item }) => {
    const startTime = new Date(item.startTime);
    const price = item.basePrice || 0;
    const day = startTime.getDay();
    const accentColor = DAY_COLORS[day];
    const hour = startTime.getHours();
    const timeIcon = hour < 12 ? 'sunny-outline' : hour < 17 ? 'partly-sunny-outline' : 'moon-outline';

    return (
      <TouchableOpacity
        activeOpacity={0.88}
        onPress={() => navigation.navigate('SeatSelection', { showtime: item })}
        style={{ width: (SCREEN_W - 44) / 2, marginBottom: 12 }}
      >
        <View
          style={{
            borderRadius: 16,
            overflow: 'hidden',
            borderWidth: 1,
            borderColor: borderColor,
            flex: 1,
          }}
        >
          <LinearGradient colors={cardBg} style={{ flex: 1 }}>
            {/* Top accent bar */}
            <View style={{ height: 3, backgroundColor: accentColor, opacity: 0.7 }} />

            <View style={{ padding: 12, gap: 8 }}>
              {/* Time + Room row */}
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <Text style={{ color: accentColor, fontSize: 20, fontWeight: '900' }}>
                  {startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
                <View style={{ backgroundColor: theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 }}>
                  <Text style={{ color: subTextColor, fontSize: 8, fontWeight: '900' }}>{item.room}</Text>
                </View>
              </View>

              {/* Price + Date */}
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 }}>
                <Text style={{ color: textColor, fontSize: 13, fontWeight: '800' }}>
                  {item.basePrice?.toLocaleString('vi-VN')}đ
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: accentColor + '20', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 10 }}>
                  <Ionicons name={timeIcon} size={8} color={accentColor} />
                  <Text style={{ color: accentColor, fontSize: 8, fontWeight: '800' }}>
                    {startTime.getDate()}/{startTime.getMonth() + 1}
                  </Text>
                </View>
              </View>
            </View>
          </LinearGradient>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <ScreenWrapper>
      {/* Custom Movie Header */}
      <View style={{ backgroundColor: bgColor }}>
        <View style={{ flexDirection: 'row', alignItems: 'flex-end', paddingHorizontal: 16, paddingTop: 52, paddingBottom: 20, gap: 14 }}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={{ position: 'absolute', top: 52, left: 16, width: 38, height: 38, borderRadius: 19, backgroundColor: theme === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)', borderWidth: 1, borderColor: theme === 'dark' ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.1)', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}
          >
            <Ionicons name="arrow-back" size={20} color={textColor} />
          </TouchableOpacity>

          {/* Poster thumb */}
          <View className="shadow-lg shadow-black/20" style={{ width: 84, height: 118, borderRadius: 16, overflow: 'hidden', backgroundColor: theme === 'dark' ? '#1E1E2E' : '#E0E0E0', marginLeft: 44, borderWidth: 1, borderColor: borderColor }}>
            {movie.poster ? (
              <Image source={{ uri: movie.poster }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
            ) : (
              <LinearGradient colors={theme === 'dark' ? ['#1A1A2E', '#16213E'] : ['#E8E8F0', '#D0D0E0']} style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ fontSize: 24 }}>🎬</Text>
              </LinearGradient>
            )}
          </View>

          {/* Movie meta */}
          <View style={{ flex: 1, paddingBottom: 4, gap: 6 }}>
            <Text style={{ color: '#00D4FF', fontSize: 10, fontWeight: '900', letterSpacing: 2, textTransform: 'uppercase' }}>
              SHOWTIMES
            </Text>
            <Text style={{ color: textColor, fontSize: 18, fontWeight: '900' }} numberOfLines={2}>
              {movie.title}
            </Text>
          </View>
        </View>

        {/* Section title */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingBottom: 14 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <View style={{ width: 3, height: 16, backgroundColor: '#00D4FF', borderRadius: 2 }} />
            <Text style={{ color: textColor, fontSize: 15, fontWeight: '800' }}>{t('Select showtime') || 'Available Slots'}</Text>
          </View>
        </View>

        <View style={{ height: 1, backgroundColor: theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }} />
      </View>

      {/* List */}
      <View style={{ flex: 1, backgroundColor: bgColor }}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ paddingHorizontal: 12, marginTop: 8, marginBottom: 8, maxHeight: 60 }}
        >
          {uniqueDates.map((dateStr) => {
            const date = new Date(dateStr);
            const isActive = selectedDate === dateStr;

            return (
              <TouchableOpacity
                key={dateStr}
                onPress={() => setSelectedDate(dateStr)}
                style={{
                  marginRight: 8,
                  paddingVertical: 6,
                  borderRadius: 14,
                  backgroundColor: isActive ? '#00D4FF' : 'rgba(255,255,255,0.08)',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: 44,
                  minWidth: 75,
                  paddingHorizontal: 20
                }}
              >
              <Text style={{
                color: isActive ? '#000' : '#999',
                fontWeight: '700',
                fontSize: 10,
                textAlign: 'center'
              }}>
                {date.toLocaleDateString('vi-VN', {
                  weekday: 'short'
                })}
              </Text>

              <Text style={{
                color: isActive ? '#000' : '#bbb',
                fontWeight: '900',
                fontSize: 12,
                textAlign: 'center'
              }}>
                {date.getDate()}/{date.getMonth() + 1}
              </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
        {loading ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" color="#00D4FF" />
          </View>
          ) : filteredShowtimes.length === 0 ? (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 40 }}>
              <Text style={{ color: subTextColor, fontSize: 14, fontWeight: '800' }}>
                No showtimes available
              </Text>
            </View>
          ) : (
          <FlatList
            data={filteredShowtimes}
            renderItem={renderShowtime}
            keyExtractor={(item) => item._id}
            numColumns={2}
            columnWrapperStyle={{ justifyContent: 'space-between', paddingHorizontal: 16 }}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingTop: 16, paddingBottom: 48, flexGrow: 1 }}
          />
        )}
      </View>
    </ScreenWrapper>
  );
}

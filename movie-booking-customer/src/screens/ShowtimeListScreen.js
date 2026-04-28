import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as api from '../services/api';
import ScreenWrapper from '../components/ScreenWrapper';
import Header from '../components/Header';

export default function ShowtimeListScreen({ route, navigation }) {
  const { movie } = route.params;
  const [showtimes, setShowtimes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadShowtimes();
  }, []);

  const loadShowtimes = async () => {
    try {
      const response = await api.getShowtimesByMovie(movie._id);
      setShowtimes(response.data.data);
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể tải lịch chiếu');
    } finally {
      setLoading(false);
    }
  };

  const renderShowtime = ({ item }) => {
    const startTime = new Date(item.startTime);

    return (
      <TouchableOpacity
        className="flex-row bg-[#141420] rounded-2xl p-4.5 mb-3.5 border border-[#1E1E2E] justify-between items-center"
        onPress={() => navigation.navigate('SeatSelection', { showtime: item })}
      >
        <View className="flex-1 gap-1">
          <View className="flex-row items-center gap-2 mb-1">
            <Ionicons name="calendar-outline" size={14} color="#AAA" />
            <Text className="text-gray-400 text-sm font-semibold">
              {startTime.toLocaleDateString('vi-VN', { weekday: 'short', day: '2-digit', month: '2-digit' })}
            </Text>
          </View>
          <Text className="text-2xl font-black text-[#00D4FF]">
            {startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>

        <View className="items-end gap-1">
          <View className="bg-[#1E1E2E] px-2.5 py-1 rounded-md border border-[#2A2A3E] mb-1">
            <Text className="text-gray-300 text-xs font-bold uppercase tracking-widest">PHÒNG {item.room}</Text>
          </View>
          <Text className="text-lg font-black text-white">{item.price.toLocaleString('vi-VN')}đ</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <ScreenWrapper>
      <Header title="Lịch Chiếu" subTitle={movie.title} />

      <View className="flex-1 px-4 pt-4">
        {loading ? (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color="#00D4FF" />
          </View>
        ) : showtimes.length === 0 ? (
          <View className="flex-1 justify-center items-center gap-4">
            <Text className="text-5xl opacity-40">📅</Text>
            <Text className="text-gray-500 text-base font-bold">Hiện không có lịch chiếu nào</Text>
          </View>
        ) : (
          <FlatList
            data={showtimes}
            renderItem={renderShowtime}
            keyExtractor={(item) => item._id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 40 }}
          />
        )}
      </View>
    </ScreenWrapper>
  );
}

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../context/AuthContext';
import * as api from '../services/api';
import ScreenWrapper from '../components/ScreenWrapper';
import Header from '../components/Header';
import BottomNav from '../components/BottomNav';
import TicketCard from '../components/TicketCard';

const TABS = [
  { id: 'all',      label: 'Tất Cả' },
  { id: 'confirmed', label: 'Sắp Tới' },
  { id: 'watched',  label: 'Đã Xem' },
  { id: 'cancelled',label: 'Đã Hủy' },
];

const STATUS_CONFIG = {
  confirmed: { label: 'SẮP TỚI', color: '#00D4FF', bg: '#00D4FF15' },
  watched:   { label: 'ĐÃ XEM',  color: '#A855F7', bg: '#A855F715' },
  cancelled: { label: 'ĐÃ HỦY',  color: '#FF4444', bg: '#FF444415' },
};

const formatVND = (n) => n?.toLocaleString('vi-VN') + 'đ';

export default function BookingHistoryScreen({ navigation }) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('confirmed');
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    setLoading(true);
    try {
      const res = await api.getUserBookings(user?.id);
      if (res.data.success) {
        setBookings(res.data.data);
      }
    } catch (error) {
      console.error('Failed to load bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const filtered = bookings.filter((b) =>
    activeTab === 'all' ? true : b.status === activeTab
  );

  const renderCard = ({ item }) => {
    const isUpcoming = item.status === 'confirmed';
    const cfg = STATUS_CONFIG[item.status] || STATUS_CONFIG.confirmed;

    if (isUpcoming) {
      return (
        <View className="px-4 mb-4">
           <TicketCard 
            movie={item.showtime?.movie} 
            showtime={item.showtime} 
            seats={item.seats} 
            bookingCode={`#${item._id.slice(-8).toUpperCase()}`}
            cinemaName={`Rạp ${item.showtime?.room}`}
          />
        </View>
      );
    }

    return (
      <View className={`bg-[#141420] rounded-2xl mx-4 mb-4 p-4 border-l-4 border-[${cfg.color}] flex-row gap-4 items-center`}>
        <View className="w-16 h-22 rounded-lg overflow-hidden bg-gray-800">
          {item.showtime?.movie?.poster ? (
            <Image source={{ uri: item.showtime.movie.poster }} className="w-full h-full" />
          ) : (
            <View className="flex-1 items-center justify-center bg-gray-700">
               <Text className="text-xl">🎬</Text>
            </View>
          )}
        </View>

        <View className="flex-1 gap-1">
          <View className={`self-start px-2 py-0.5 rounded-md`} style={{ backgroundColor: cfg.bg }}>
            <Text className="text-[10px] font-bold" style={{ color: cfg.color }}>{cfg.label}</Text>
          </View>
          <Text className="text-white text-base font-bold" numberOfLines={1}>{item.showtime?.movie?.title}</Text>
          <Text className="text-gray-500 text-[11px]">{new Date(item.showtime?.startTime).toLocaleDateString('vi-VN')} • {formatVND(item.totalPrice)}</Text>
          
          <TouchableOpacity 
            className="flex-row items-center gap-1.5 mt-2"
            onPress={() => navigation.navigate('Movies')}
          >
            <Ionicons name="refresh-outline" size={14} color="#00D4FF" />
            <Text className="text-[#00D4FF] text-xs font-bold">Đặt lại</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <ScreenWrapper>
      <Header title="Vé Của Tôi" showBack={false} />

      {/* Tab Bar */}
      <View className="py-4">
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="px-4">
          {TABS.map((tab) => {
            const isActive = tab.id === activeTab;
            return (
              <TouchableOpacity
                key={tab.id}
                onPress={() => setActiveTab(tab.id)}
                className={`px-5 py-2.5 rounded-full mr-3 border ${isActive ? 'bg-[#00D4FF] border-[#00D4FF]' : 'bg-[#141420] border-[#2A2A3E]'}`}
              >
                <Text className={`text-sm font-bold ${isActive ? 'text-[#0A0A0F]' : 'text-gray-500'}`}>{tab.label}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#00D4FF" />
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item._id}
          renderItem={renderCard}
          contentContainerStyle={{ paddingBottom: 100 }}
          ListEmptyComponent={
            <View className="flex-1 items-center justify-center pt-20 px-8 gap-3">
              <Text className="text-5xl">🎟️</Text>
              <Text className="text-white text-xl font-bold">Chưa có vé nào</Text>
              <Text className="text-gray-500 text-sm text-center leading-5">Đặt vé ngay để trải nghiệm điện ảnh đỉnh cao!</Text>
              <TouchableOpacity
                className="mt-4 w-full"
                onPress={() => navigation.navigate('MovieList')}
              >
                <LinearGradient
                  colors={['#00D4FF', '#6C3483']}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                  className="h-13 items-center justify-center rounded-xl"
                >
                  <Text className="text-white text-sm font-black italic tracking-widest">🎬 KHÁM PHÁ PHIM NGAY</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          }
        />
      )}

      <BottomNav />
    </ScreenWrapper>
  );
}

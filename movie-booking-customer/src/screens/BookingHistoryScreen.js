import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import * as api from '../services/api';
import ScreenWrapper from '../components/ScreenWrapper';
import Header from '../components/Header';
import BottomNav from '../components/BottomNav';
import TicketCard from '../components/TicketCard';

// ✅ IMPORT BOOKING UTILS
import {
  formatCurrency,
  formatDate,
  formatTime
} from '../utils/bookingUtils';

// ✅ TABS
const TABS = [
  { id: 'all', label: 'Tất Cả' },
  { id: 'confirmed', label: 'Sắp Tới' },
  { id: 'watched', label: 'Đã Xem' },
  { id: 'cancelled', label: 'Đã Hủy' },
];

const STATUS_CONFIG = {
  confirmed: { label: 'SẮP TỚI', color: '#00D4FF', bg: '#00D4FF15' },
  watched: { label: 'ĐÃ XEM', color: '#A855F7', bg: '#A855F715' },
  cancelled: { label: 'ĐÃ HỦY', color: '#FF4444', bg: '#FF444415' },
};

export default function BookingHistoryScreen({ navigation }) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('confirmed');
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?._id) {
      loadBookings();
    }
  }, [user?._id]);

  const loadBookings = async () => {
    setLoading(true);
    try {
        const res = await api.getMyBookings();

        if (res.data.success) {

        const mapped = res.data.data.map(group => {
        const startTime = new Date(group.showtime?.startTime);
        const isPast = startTime < new Date();

        let status = 'confirmed';

        if (group.paymentStatus === 'FAILED') {
            status = 'cancelled';
        } else if (isPast) {
            status = 'watched';
        }

        return {
            ...group,
            status,
            seats: group.seats || [],
            totalPrice: group.totalPrice
        };
        });

        // ✅ sort newest first
        const sorted = mapped.sort(
          (a, b) => new Date(b.showtime.startTime) - new Date(a.showtime.startTime)
        );

        setBookings(sorted);
      }

    } catch (error) {
      console.error('Failed to load bookings:', error);
      Alert.alert('Lỗi', 'Không thể tải lịch sử đặt vé');
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

    // 🎟 UPCOMING (ticket style)
    if (isUpcoming) {
      return (
        <TouchableOpacity
          className="px-4 mb-4"
          onPress={() =>
            navigation.navigate('BookingDetail', {
              bookingGroupId: item.bookingGroupId
            })
          }
        >
          <TicketCard
            movie={item.showtime?.movie}
            showtime={item.showtime}
            seats={item.seats}
            bookingCode={`#${item.bookingGroupId.slice(-8).toUpperCase()}`}
            cinemaName={`Phòng ${item.showtime?.room}`}
          />
        </TouchableOpacity>
      );
    }

    // 📦 HISTORY ITEM
    return (
      <View
        style={{ borderLeftColor: cfg.color }}
        className="bg-[#141420] rounded-2xl mx-4 mb-4 p-4 border-l-4 flex-row gap-4 items-center"
      >
        <View className="w-16 h-22 rounded-lg overflow-hidden bg-gray-800">
          {item.showtime?.movie?.poster ? (
            <Image source={{ uri: item.showtime.movie.poster }} className="w-full h-full" />
          ) : (
            <View className="flex-1 items-center justify-center bg-gray-700">
              <Text>🎬</Text>
            </View>
          )}
        </View>

        <View className="flex-1 gap-1">

          <View style={{ backgroundColor: cfg.bg }} className="self-start px-2 py-0.5 rounded-md">
            <Text style={{ color: cfg.color }} className="text-[10px] font-bold">
              {cfg.label}
            </Text>
          </View>

          <Text className="text-white text-base font-bold" numberOfLines={1}>
            {item.showtime?.movie?.title}
          </Text>

          <Text className="text-gray-500 text-[11px]">
            {formatDate(item.showtime?.startTime)} • {formatTime(item.showtime?.startTime)}
          </Text>

          <Text className="text-gray-400 text-[11px]">
            Ghế: {item.seats.join(', ')}
          </Text>

          <Text className="text-[#00D4FF] text-[12px] font-bold">
            {formatCurrency(item.totalPrice)}
          </Text>

          <TouchableOpacity
            className="flex-row items-center gap-1.5 mt-2"
            onPress={() => navigation.navigate('MovieList')}
          >
            <Ionicons name="refresh-outline" size={14} color="#00D4FF" />
            <Text className="text-[#00D4FF] text-xs font-bold">Đặt lại</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // 🧠 EMPTY STATE
  if (!loading && filtered.length === 0) {
    return (
      <ScreenWrapper>
        <Header title="Vé Của Tôi" />
        <View className="flex-1 items-center justify-center">
          <Text className="text-gray-500">Bạn chưa có vé nào</Text>
        </View>
        <BottomNav />
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      <Header title="Vé Của Tôi" showBack={false} />

      {/* Tabs */}
      <View className="py-4">
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="px-4">
          {TABS.map((tab) => {
            const isActive = tab.id === activeTab;
            return (
              <TouchableOpacity
                key={tab.id}
                onPress={() => setActiveTab(tab.id)}
                className={`px-5 py-2.5 rounded-full mr-3 border ${
                  isActive ? 'bg-[#00D4FF] border-[#00D4FF]' : 'bg-[#141420] border-[#2A2A3E]'
                }`}
              >
                <Text className={`text-sm font-bold ${isActive ? 'text-[#0A0A0F]' : 'text-gray-500'}`}>
                  {tab.label}
                </Text>
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
          keyExtractor={(item) => item.bookingGroupId}
          renderItem={renderCard}
          contentContainerStyle={{ paddingBottom: 100 }}
        />
      )}

      <BottomNav />
    </ScreenWrapper>
  );
}
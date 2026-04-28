import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as api from '../services/api';
import ScreenWrapper from '../components/ScreenWrapper';
import Header from '../components/Header';

const { width: SCREEN_W } = Dimensions.get('window');

const formatVND = (n) =>
  n ? n.toLocaleString('vi-VN') + 'đ' : '0đ';

export default function SeatSelectionScreen({ route, navigation }) {
  const { showtime: initialShowtime } = route.params || {};
  
  const [showtime, setShowtime] = useState(initialShowtime);
  const [bookedSeats, setBookedSeats] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [initialShowtime?._id]);

  const loadData = async () => {
    if (!initialShowtime?._id) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const [stRes, seatsRes] = await Promise.all([
        api.getShowtime(initialShowtime._id),
        api.getAvailableSeats(initialShowtime._id)
      ]);
      
      if (stRes.data.success) setShowtime(stRes.data.data);
      if (seatsRes.data.success) setBookedSeats(seatsRes.data.data.bookedSeats || []);
      
    } catch (error) {
      console.error('Failed to load seat data:', error);
      Alert.alert('Lỗi', 'Không thể tải sơ đồ ghế ngồi. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const layout = useMemo(() => {
    if (!showtime) return { rows: 0, cols: 0, capacity: 0 };
    
    // Match admin capacity logic
    let capacity = showtime.totalSeats || 80;
    const roomNum = parseInt(showtime.room);
    if (roomNum >= 1 && roomNum <= 5) capacity = 80;
    else if (roomNum >= 6 && roomNum <= 10) capacity = 100;
    
    const cols = 10;
    const rows = Math.ceil(capacity / cols);
    const startVipRow = Math.floor((rows - 4) / 2);
    const endVipRow = startVipRow + 3;
    return { capacity, cols, rows, startVipRow, endVipRow };
  }, [showtime]);

  const basePrice = showtime?.price || 100000;
  const PRICE_REGULAR = basePrice;
  const PRICE_VIP     = Math.round(basePrice * 1.25 / 1000) * 1000;
  const PRICE_COUPLE  = Math.round(basePrice * 1.8 / 1000) * 1000;

  const getSeatType = (r, c) => {
    if (r === layout.rows - 1) return 'couple';
    if (r >= layout.startVipRow && r <= layout.endVipRow && c >= 2 && c <= layout.cols - 3) return 'vip';
    return 'regular';
  };

  const getSeatPrice = (seatId) => {
    if (seatId.includes('-')) return PRICE_COUPLE;
    const rowLabel = seatId[0];
    const r = rowLabel.charCodeAt(0) - 65;
    const c = parseInt(seatId.slice(1)) - 1;
    if (getSeatType(r, c) === 'vip') return PRICE_VIP;
    return PRICE_REGULAR;
  };

  const toggleSeat = (seatId) => {
    if (bookedSeats.includes(seatId)) return;
    setSelectedSeats((prev) =>
      prev.includes(seatId)
        ? prev.filter((s) => s !== seatId)
        : [...prev, seatId]
    );
  };

  const totalPrice = selectedSeats.reduce((sum, seatId) => sum + getSeatPrice(seatId), 0);

  const handleContinue = () => {
    if (selectedSeats.length === 0) {
      Alert.alert('Thông báo', 'Vui lòng chọn ít nhất 1 ghế');
      return;
    }
    navigation.navigate('BookingConfirm', {
      showtime,
      movie: showtime.movie,
      cinema: { name: `Rạp ${showtime.room}` },
      time: new Date(showtime.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      date: new Date(showtime.startTime).getDate(),
      seats: selectedSeats,
      totalPrice,
    });
  };

  const Seat = ({ seatId, type, label }) => {
    const isBooked = bookedSeats.includes(seatId);
    const isSelected = selectedSeats.includes(seatId);
    const isVip = type === 'vip';
    const isCouple = type === 'couple';

    if (isCouple) {
      return (
        <TouchableOpacity
          className={`h-[${SEAT_SIZE}px] rounded-lg border-1.2 items-center justify-center ${isSelected ? 'bg-[#A855F7] border-[#A855F7]' : isBooked ? 'bg-[#ff3d3d]/30 border-[#ff3d3d]/20' : 'bg-[#0A0A0F] border-[#A855F7]'}`}
          style={{ width: COUPLE_W }}
          onPress={() => toggleSeat(seatId)}
          disabled={isBooked}
          activeOpacity={0.7}
        >
           {isSelected && <Text className="text-[#0A0A0F] text-[10px] font-black">C</Text>}
        </TouchableOpacity>
      );
    }

    return (
      <TouchableOpacity
        className={`w-[${SEAT_SIZE}px] h-[${SEAT_SIZE}px] rounded-md items-center justify-center ${isSelected ? 'bg-[#00D4FF]' : isBooked ? 'bg-[#ff3d3d]/30' : isVip ? 'bg-[#0A0A0F] border-1.2 border-[#F4C430]' : 'bg-[#2A2A3A]'}`}
        style={{ width: SEAT_SIZE, height: SEAT_SIZE }}
        onPress={() => toggleSeat(seatId)}
        disabled={isBooked}
        activeOpacity={0.7}
      >
        {isSelected && (
          <Text className="text-[#0A0A0F] text-[10px] font-black">{label}</Text>
        )}
      </TouchableOpacity>
    );
  };

  const renderGrid = () => {
    if (!showtime) return null;
    const grid = [];
    for (let r = 0; r < layout.rows; r++) {
      const rowLabel = String.fromCharCode(65 + r);
      const rowSeats = [];
      const isLastRow = r === layout.rows - 1;

      if (isLastRow) {
        for (let c = 0; c < layout.cols / 2; c++) {
          const seatId = `${rowLabel}${c * 2 + 1}-${c * 2 + 2}`;
          rowSeats.push(<Seat key={seatId} seatId={seatId} type="couple" />);
          if (c < (layout.cols / 2) - 1) rowSeats.push(<View key={`aisle-c-${c}`} className="w-2" />);
        }
      } else {
        for (let c = 0; c < layout.cols; c++) {
          const seatIndex = r * layout.cols + c;
          if (seatIndex >= layout.capacity) break;
          const seatId = `${rowLabel}${c + 1}`;
          rowSeats.push(<Seat key={seatId} seatId={seatId} type={getSeatType(r, c)} label={c + 1} />);
          if (c === 1 || c === 7) rowSeats.push(<View key={`aisle-${r}-${c}`} className="w-2" />);
        }
      }

      grid.push(
        <View key={rowLabel} className="flex-row items-center gap-[6px]">
          <Text className="text-[#444] text-[10px] font-bold w-3.5 text-center">{rowLabel}</Text>
          {rowSeats}
          <Text className="text-[#444] text-[10px] font-bold w-3.5 text-center">{rowLabel}</Text>
        </View>
      );
    }
    return grid;
  };

  const SEAT_GAP = 6;
  const SEAT_SIZE = (SCREEN_W - 32 - 12 - (SEAT_GAP * 11)) / 10;
  const COUPLE_W = SEAT_SIZE * 2 + SEAT_GAP;

  if (loading && !showtime) {
    return (
      <View className="flex-1 bg-[#0A0A0F] justify-center items-center">
        <ActivityIndicator size="large" color="#00D4FF" />
        <Text className="text-gray-500 mt-2.5">Đang tải sơ đồ ghế...</Text>
      </View>
    );
  }

  return (
    <ScreenWrapper>
      <Header 
        title="Chọn Ghế" 
        subTitle={`Phòng ${showtime?.room || '?'}`} 
        rightElement={
          <TouchableOpacity onPress={loadData}>
            <Ionicons name="refresh-outline" size={20} color="#00D4FF" />
          </TouchableOpacity>
        }
      />

      <ScrollView showsVerticalScrollIndicator={false} className="px-4 pt-4">
        {/* Movie Info Card */}
        <View className="bg-[#141420] rounded-2xl p-3.5 mb-6 border border-[#1E1E2E]">
          <View className="flex-row items-center mb-2.5">
            <Ionicons name="film" size={20} color="#00D4FF" className="mr-2.5" />
            <Text className="text-white text-[15px] font-bold flex-1" numberOfLines={1}>{showtime?.movie?.title}</Text>
          </View>
          <View className="flex-row flex-wrap gap-3.5">
            <View className="flex-row items-center gap-1">
              <Ionicons name="calendar-outline" size={14} color="#AAA" />
              <Text className="text-gray-400 text-[12px] font-medium">{showtime ? new Date(showtime.startTime).toLocaleDateString('vi-VN') : ''}</Text>
            </View>
            <View className="flex-row items-center gap-1">
              <Ionicons name="time-outline" size={14} color="#AAA" />
              <Text className="text-gray-400 text-[12px] font-medium">{showtime ? new Date(showtime.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</Text>
            </View>
            <View className="flex-row items-center gap-1">
              <Ionicons name="cash-outline" size={14} color="#4CAF50" />
              <Text className="text-[#4CAF50] text-[12px] font-medium">{formatVND(basePrice)}</Text>
            </View>
          </View>
        </View>

        {/* Screen Indicator */}
        <View className="items-center mb-8">
          <View className="w-[80%] h-1 bg-[#00D4FF] rounded-full shadow-lg shadow-[#00D4FF]/50" />
          <Text className="text-[#00D4FF] text-[10px] font-bold tracking-[6px] mt-1.5 uppercase">MÀN HÌNH</Text>
        </View>

        {/* Seat Grid */}
        <View className="items-center gap-[6px] mb-7">
          {renderGrid()}
        </View>

        {/* Legend */}
        <View className="mb-3">
          <View className="flex-row justify-between items-center">
            <View className="flex-row items-center gap-1.5">
              <View className="w-4 h-4 rounded-sm bg-[#2A2A3A]" />
              <Text className="text-gray-500 text-[11px]">Thường</Text>
            </View>
            <View className="flex-row items-center gap-1.5">
              <View className="w-4 h-4 rounded-sm bg-[#0A0A0F] border border-[#F4C430]" />
              <Text className="text-gray-500 text-[11px]">VIP</Text>
            </View>
            <View className="flex-row items-center gap-1.5">
              <View className="w-4 h-4 rounded-sm bg-[#00D4FF]" />
              <Text className="text-gray-500 text-[11px]">Đang chọn</Text>
            </View>
            <View className="flex-row items-center gap-1.5">
              <View className="w-4 h-4 rounded-sm bg-[#ff3d3d]/30" />
              <Text className="text-gray-500 text-[11px]">Đã bán</Text>
            </View>
          </View>
          <View className="flex-row justify-center mt-3">
            <View className="flex-row items-center gap-1.5">
              <View className="w-7 h-4 rounded-sm bg-[#0A0A0F] border border-[#A855F7]" />
              <Text className="text-gray-500 text-[11px]">Couple</Text>
            </View>
          </View>
        </View>

        <View className="h-40" />
      </ScrollView>

      {/* Sticky Bottom */}
      <View className="absolute bottom-0 left-0 right-0 bg-[#0A0A0F]/98 border-t border-[#1E1E2E] px-4 pt-3.5 pb-9">
        <View className="flex-row items-center gap-4">
          <View className="flex-1">
            <View className="flex-row items-center mb-0.5">
              <Text className="text-gray-600 text-[12px]">Ghế đã chọn: </Text>
              <Text className="text-white text-[13px] font-bold flex-1" numberOfLines={1}>
                {selectedSeats.length > 0 ? selectedSeats.join(', ') : 'Chưa chọn'}
              </Text>
            </View>
            <Text className="text-[#00D4FF] text-2xl font-black">{formatVND(totalPrice)}</Text>
          </View>

          <TouchableOpacity
            onPress={handleContinue}
            activeOpacity={0.85}
            className="flex-1 rounded-2xl overflow-hidden shadow-lg shadow-[#00D4FF]/20"
          >
            <LinearGradient
              colors={['#00D4FF', '#00AACC']}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              className="h-13 items-center justify-center"
            >
              <Text className="text-[#0A0A0F] text-base font-black tracking-widest">TIẾP TỤC</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </ScreenWrapper>
  );
}

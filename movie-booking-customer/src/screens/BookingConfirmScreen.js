import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as api from '../services/api';
import ScreenWrapper from '../components/ScreenWrapper';
import Header from '../components/Header';
import TicketCard from '../components/TicketCard';
import { Modal } from 'react-native';

const formatVND = (n) => n.toLocaleString('vi-VN') + 'đ';

export default function BookingConfirmScreen({ route, navigation }) {
  const {
    movie = { title: 'Avengers: Doomsday', poster: null },
    cinema = { name: 'CGV Vincom Bà Triệu' },
    time = '14:00',
    date = 18,
    seats = ['A4', 'A5', 'A6'],
    totalPrice = 360000,
    showtime
  } = route.params ?? {};

  const [loading, setLoading] = useState(false);
  const [vouchers, setVouchers] = useState([]);
  const [selectedVoucher, setSelectedVoucher] = useState(null);
  const [isVoucherModalVisible, setIsVoucherModalVisible] = useState(false);

  useEffect(() => {
    fetchVouchers();
  }, []);

  const fetchVouchers = async () => {
    try {
      const res = await api.getDiscounts();
      if (res.data.success) {
        setVouchers(res.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch vouchers:', error);
    }
  };

  const PROMO_DISCOUNT = selectedVoucher ? (totalPrice * selectedVoucher.discountPercentage) / 100 : 0;
  const finalTotal = totalPrice - PROMO_DISCOUNT;
  const BOOKING_CODE = '#' + Math.random().toString(36).substr(2, 9).toUpperCase();

  const handlePayment = async () => {
    setLoading(true);
    try {
      if (!showtime?._id) throw new Error('Showtime ID is missing');
      const response = await api.createBooking(showtime._id, seats);
      
      if (response.data.success) {
        Alert.alert(
          '🎉 Đặt vé thành công!',
          `Vé của bạn đã được xác nhận.\nMã đặt vé: ${response.data.data._id.slice(-8).toUpperCase()}`,
          [{ text: 'Xem vé', onPress: () => navigation.navigate('BookingHistory') }]
        );
      } else {
        throw new Error(response.data.error || 'Thanh toán thất bại');
      }
    } catch (e) {
      Alert.alert('Lỗi', e.message || 'Thanh toán thất bại. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenWrapper>
      <Header title="Xác Nhận Đặt Vé" />

      <ScrollView showsVerticalScrollIndicator={false} className="px-4 pt-5">
        <TicketCard 
          movie={movie} 
          showtime={showtime} 
          seats={seats} 
          bookingCode={BOOKING_CODE} 
          cinemaName={cinema.name}
        />

        {/* Order Summary */}
        <View className="bg-[#141420] rounded-2xl p-4.5 mb-3 border border-[#1E1E2E] gap-3">
          <Text className="text-white text-lg font-extrabold mb-1">Tóm tắt đơn hàng</Text>
          
          <View className="flex-row justify-between items-center">
            <Text className="text-gray-400 text-sm">Vé phim ({seats.length}x)</Text>
            <Text className="text-gray-200 text-sm font-semibold">{formatVND(totalPrice)}</Text>
          </View>

          {selectedVoucher && (
            <View className="flex-row justify-between items-center">
              <View className="flex-row items-center gap-1.5">
                <Ionicons name="pricetag" size={14} color="#00D4FF" />
                <Text className="text-[#00D4FF] text-sm font-semibold">Ưu đãi ({selectedVoucher.code})</Text>
              </View>
              <Text className="text-[#4CAF50] text-sm font-bold">-{formatVND(PROMO_DISCOUNT)}</Text>
            </View>
          )}

          <View className="h-[1px] bg-[#1E1E2E] my-0.5" />

          <View className="flex-row justify-between items-center">
            <Text className="text-white text-base font-bold">Tổng cộng</Text>
            <Text className="text-[#00D4FF] text-xl font-black">{formatVND(finalTotal)}</Text>
          </View>
        </View>

        {/* Voucher Picker */}
        <TouchableOpacity 
          className="bg-[#141420] rounded-2xl p-4.5 mb-3 border border-[#1E1E2E] flex-row justify-between items-center"
          onPress={() => setIsVoucherModalVisible(true)}
        >
          <View className="flex-row items-center gap-3">
            <Ionicons name="gift-outline" size={20} color="#00D4FF" />
            <Text className="text-gray-200 text-sm font-medium">
              {selectedVoucher ? `Đã áp dụng: ${selectedVoucher.code}` : 'Chọn ưu đãi / mã giảm giá'}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#555" />
        </TouchableOpacity>

        {/* Payment Method */}
        <View className="bg-[#141420] rounded-2xl px-4.5 py-3.5 flex-row items-center justify-between mb-3.5 border border-[#1E1E2E]">
          <View className="flex-row items-center gap-3">
            <View className="bg-[#1A2A6C] px-2 py-1 rounded-md">
              <Text className="text-white text-[13px] font-black italic tracking-wider">VISA</Text>
            </View>
            <Text className="text-gray-200 text-sm font-medium">Visa •••• 4242</Text>
          </View>
          <TouchableOpacity>
            <Text className="text-[#00D4FF] text-sm font-semibold">Thay đổi</Text>
          </TouchableOpacity>
        </View>

        <Text className="text-gray-600 text-xs text-center leading-5 px-2 mb-2">
          Bằng việc thanh toán, bạn đồng ý với Điều khoản dịch vụ và Chính sách hoàn tiền của CINEVIET.
        </Text>

        <View className="h-24" />
      </ScrollView>

      {/* Voucher Modal */}
      <Modal
        visible={isVoucherModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsVoucherModalVisible(false)}
      >
        <View className="flex-1 bg-black/60 justify-end">
          <View className="bg-[#0A0A0F] rounded-t-[32px] p-6 max-h-[80%]">
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-white text-xl font-black italic">ƯU ĐÃI CỦA BẠN</Text>
              <TouchableOpacity onPress={() => setIsVoucherModalVisible(false)}>
                <Ionicons name="close" size={24} color="#FFF" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {vouchers.map((v) => (
                <TouchableOpacity
                  key={v._id}
                  className={`mb-3 p-4 rounded-2xl border ${selectedVoucher?._id === v._id ? 'bg-[#00D4FF]/10 border-[#00D4FF]' : 'bg-[#141420] border-[#1E1E2E]'}`}
                  onPress={() => {
                    setSelectedVoucher(v);
                    setIsVoucherModalVisible(false);
                  }}
                >
                  <View className="flex-row justify-between items-center mb-2">
                    <Text className="text-white font-black italic">{v.code}</Text>
                    <Text className="text-[#00D4FF] font-black">-{v.discountPercentage}%</Text>
                  </View>
                  <Text className="text-gray-500 text-xs leading-5">{v.description || 'Áp dụng cho mọi suất chiếu.'}</Text>
                </TouchableOpacity>
              ))}

              <TouchableOpacity
                className="mt-4 py-4 rounded-2xl border border-dashed border-gray-700 items-center"
                onPress={() => {
                  setSelectedVoucher(null);
                  setIsVoucherModalVisible(false);
                }}
              >
                <Text className="text-gray-500 font-bold">Không dùng ưu đãi</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Sticky Bottom */}
      <View className="absolute bottom-0 left-0 right-0 px-4 pb-7 pt-3 bg-[#0A0A0F]/97 border-t border-[#1E1E2E]">
        <TouchableOpacity
          className="rounded-2xl overflow-hidden shadow-lg shadow-[#00D4FF]/20"
          onPress={handlePayment}
          disabled={loading}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={['#00D4FF', '#00AACC']}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            className="h-14 items-center justify-center"
          >
            {loading ? (
              <ActivityIndicator color="#0A0A0F" />
            ) : (
              <View className="flex-row items-center gap-2.5">
                <Ionicons name="card-outline" size={20} color="#0A0A0F" />
                <Text className="text-[#0A0A0F] text-base font-black tracking-wider">THANH TOÁN {formatVND(finalTotal)}</Text>
              </View>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </ScreenWrapper>
  );
}

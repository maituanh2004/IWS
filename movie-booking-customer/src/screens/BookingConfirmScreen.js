import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Modal, 
  AppState
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as api from '../services/api';
import ScreenWrapper from '../components/ScreenWrapper';
import Header from '../components/Header';
import TicketCard from '../components/TicketCard';
import { formatCurrency } from '../utils/bookingUtils';
import * as Linking from 'expo-linking';


export default function BookingConfirmScreen({ route, navigation }) {

  const { showtime, seats } = route.params;
  const movie = showtime?.movie;
  const [bookingGroupId, setBookingGroupId] = useState(null);
  const [hasOpenedVNPay, setHasOpenedVNPay] = useState(false);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(null);
  const [discounts, setDiscounts] = useState([]);
  const [selectedDiscount, setSelectedDiscount] = useState(null);
  const [isDiscountModalVisible, setIsDiscountModalVisible] = useState(false);
  const [hasNavigated, setHasNavigated] = useState(false);

  useEffect(() => {
    fetchDiscounts();
  }, []);

  useEffect(() => {
    if (showtime?._id) {
      loadPreview();
    }
  }, [selectedDiscount, showtime]);

  const loadPreview = async () => {
    try {
      if (!showtime?._id) return;

      const res = await api.previewBooking({
        showtimeId: showtime._id,
        seats,
        discountCode: selectedDiscount?.code || null
      });

      if (res.data.success) {
        setPreview(res.data.data);
      }
    } catch (err) {
      console.error('Preview error:', err);
      Alert.alert('Lỗi', 'Không thể tính giá vé');
    }
  };

  const fetchDiscounts = async () => {
    try {
      const res = await api.getDiscounts();
      if (res.data.success) {
        setDiscounts(res.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch discounts:', error);
    }
  };
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', async nextState => {
      if (
        appState.current.match(/inactive|background/) &&
        nextState === 'active'
      ) {
        console.log('App resumed → check payment');

        if (hasOpenedVNPay) {
          setTimeout(async () => {
            await checkPaymentStatus();
          }, 1500);
        }
      }

      appState.current = nextState;
    });

    return () => subscription.remove();
  }, [bookingGroupId, hasOpenedVNPay]);

  const originalPrice = preview?.originalPrice || 0;

  const finalTotal = preview?.finalPrice || 0;

  const discountValue =
    preview?.discount
      ? originalPrice - finalTotal
      : 0;

  const handlePayment = async () => {
    setLoading(true);

    try {
      if (!showtime?._id) throw new Error('Showtime ID is missing');

      // 1. tạo booking
      const bookingRes = await api.createBooking({
        showtimeId: showtime._id,
        seats,
        discountCode: selectedDiscount?.code || null
      });

      if (!bookingRes.data.success) {
        throw new Error(bookingRes.data.message);
      }

      const bookingGroupId = bookingRes.data.data.bookingGroupId;

      // 2. tạo payment (VNPay)
      const paymentRes = await api.createPayment({
        bookingGroupId
      });

      if (!paymentRes.data.success) {
        throw new Error('Không tạo được thanh toán');
      }

      const paymentUrl = paymentRes.data.paymentUrl;

      // 3. redirect sang VNPay
      await Linking.openURL(paymentUrl);
      setBookingGroupId(bookingGroupId);
      setHasOpenedVNPay(true);

    } catch (e) {
      console.log('PAYMENT ERROR:', e?.response?.data || e.message);
      Alert.alert('Lỗi', e?.response?.data?.message || e.message);
    } finally {
      setLoading(false);
    }
  };

  const checkPaymentStatus = async () => {
    try {
      if (!bookingGroupId) return;

      const res = await api.getBookingByGroupId(bookingGroupId);

      console.log("CHECK PAYMENT RESPONSE:", res.data);

      const booking = res.data.data;

      if (!booking) {
        console.log("Booking chưa sẵn sàng");
        return;
      }

      const paymentStatus = booking.paymentStatus;

      console.log("PAYMENT STATUS:", paymentStatus);

      if (paymentStatus === "SUCCESS" && !hasNavigated) {
        setHasNavigated(true);
        navigation.replace("BookingDetail", { bookingGroupId });
        return;
      }

      if (paymentStatus === "FAILED" && !hasNavigated) {
        setHasNavigated(true);
        navigation.replace("PaymentFail");
        return;
      }

      // PENDING hoặc status khác thì đứng yên
      console.log("Payment still pending...");
    } catch (err) {
      console.log("CHECK PAYMENT ERROR STATUS:", err?.response?.status);
      console.log("CHECK PAYMENT ERROR DATA:", err?.response?.data);
      console.log("CHECK PAYMENT ERROR MESSAGE:", err?.message);

      // ❌ KHÔNG navigation PaymentFail trong catch
      // Vì lỗi mạng / 401 / 404 / timeout không chắc chắn là thanh toán thất bại
      return;
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
        />

        {/* Order Summary */}
        <View className="bg-[#141420] rounded-2xl p-4.5 mb-3 border border-[#1E1E2E] gap-3">
          <Text className="text-white text-lg font-extrabold mb-1">Tóm tắt đơn hàng</Text>
          
          <View className="flex-row justify-between items-center">
            <Text className="text-gray-400 text-sm">Vé phim ({seats.length}x)</Text>
            <Text className="text-gray-200 text-sm font-semibold">{formatCurrency(originalPrice)}</Text>
          </View>

          {preview?.discount && (
            <View className="flex-row justify-between items-center">
              <View className="flex-row items-center gap-1.5">
                <Ionicons name="pricetag" size={14} color="#00D4FF" />
                <Text className="text-[#00D4FF] text-sm font-semibold">Ưu đãi ({preview.discount.code})</Text>
              </View>
              <Text className="text-[#4CAF50] text-sm font-bold">-{formatCurrency(discountValue)}</Text>
            </View>
          )}

          <View className="h-[1px] bg-[#1E1E2E] my-0.5" />

          <View className="flex-row justify-between items-center">
            <Text className="text-white text-base font-bold">Tổng cộng</Text>
            <Text className="text-[#00D4FF] text-xl font-black">{formatCurrency(finalTotal)}</Text>
          </View>
        </View>

        {/* Discount Picker */}
        <TouchableOpacity 
          className="bg-[#141420] rounded-2xl p-4.5 mb-3 border border-[#1E1E2E] flex-row justify-between items-center"
          onPress={() => setIsDiscountModalVisible(true)}
        >
          <View className="flex-row items-center gap-3">
            <Ionicons name="gift-outline" size={20} color="#00D4FF" />
            <Text className="text-gray-200 text-sm font-medium">
              {selectedDiscount ? `Đã áp dụng: ${selectedDiscount.code}` : 'Chọn ưu đãi / mã giảm giá'}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#555" />
        </TouchableOpacity>

        <Text className="text-gray-600 text-xs text-center leading-5 px-2 mb-2">
          Bằng việc thanh toán, bạn đồng ý với Điều khoản dịch vụ và Chính sách hoàn tiền của CINEVIET.
        </Text>

        <View className="h-24" />
      </ScrollView>

      {/* Discount Modal */}
      <Modal
        visible={isDiscountModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsDiscountModalVisible(false)}
      >
        <View className="flex-1 bg-black/60 justify-end">
          <View className="bg-[#0A0A0F] rounded-t-[32px] p-6 max-h-[80%]">
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-white text-xl font-black italic">ƯU ĐÃI CỦA BẠN</Text>
              <TouchableOpacity onPress={() => setIsDiscountModalVisible(false)}>
                <Ionicons name="close" size={24} color="#FFF" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {discounts.map((v) => (
                <TouchableOpacity
                  key={v._id}
                  className={`mb-3 p-4 rounded-2xl border ${selectedDiscount?._id === v._id ? 'bg-[#00D4FF]/10 border-[#00D4FF]' : 'bg-[#141420] border-[#1E1E2E]'}`}
                  onPress={() => {
                    setSelectedDiscount(v);
                    setIsDiscountModalVisible(false);
                  }}
                >
                  <View className="flex-row justify-between items-center mb-2">
                    <Text className="text-white font-black italic">{v.code}</Text>
                    <Text className="text-[#00D4FF] font-black">-{v.percentage}%</Text>
                  </View>
                  <Text className="text-gray-500 text-xs leading-5">{v.description || 'Áp dụng cho mọi suất chiếu.'}</Text>
                </TouchableOpacity>
              ))}

              <TouchableOpacity
                className="mt-4 py-4 rounded-2xl border border-dashed border-gray-700 items-center"
                onPress={() => {
                  setSelectedDiscount(null);
                  setIsDiscountModalVisible(false);
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
          disabled={loading || !preview}
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
                <Text className="text-[#0A0A0F] text-base font-black tracking-wider">THANH TOÁN {formatCurrency(finalTotal)}</Text>
              </View>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </ScreenWrapper>
  );
}

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
import * as Linking from 'expo-linking';
import * as api from '../services/api';
import ScreenWrapper from '../components/ScreenWrapper';
import Header from '../components/Header';
import DiscountCard from '../components/DiscountCard';
import { formatCurrency } from '../utils/bookingUtils';

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

      const payload = {
        showtimeId: showtime._id,
        seats,
        ...(selectedDiscount ? { discountCode: selectedDiscount.code } : {})
      };

      console.log("PREVIEW PAYLOAD:", payload);

      const res = await api.previewBooking(payload);

      if (res.data.success) {
        setPreview(res.data.data);
      }

    } catch (err) {
      console.log("PREVIEW ERROR STATUS:", err?.response?.status);
      console.log("PREVIEW ERROR DATA:", err?.response?.data);

      Alert.alert(
        'Không áp dụng được mã giảm giá',
        err?.response?.data?.message || 'Vui lòng chọn mã khác'
      );

      // 🔥 reset discount nếu fail
      setSelectedDiscount(null);
      setPreview(null);
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
  }, [bookingGroupId, hasOpenedVNPay, hasNavigated]);

  useEffect(() => {
    setHasNavigated(false);
  }, []);

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

      let currentBookingGroupId = bookingGroupId;

      // ✅ CHỈ tạo booking nếu CHƯA có
      if (!currentBookingGroupId) {
        const bookingRes = await api.createBooking({
          showtimeId: showtime._id,
          seats,
          ...(selectedDiscount ? { discountCode: selectedDiscount.code } : {})
        });

        if (!bookingRes.data.success) {
          throw new Error(bookingRes.data.message);
        }

        currentBookingGroupId = bookingRes.data.data.bookingGroupId;

        // lưu lại để dùng retry
        setBookingGroupId(currentBookingGroupId);
      }

      // ✅ luôn dùng booking cũ để payment
      const paymentRes = await api.createPayment({
        bookingGroupId: currentBookingGroupId
      });

      if (!paymentRes.data.success) {
        throw new Error('Không tạo được thanh toán');
      }

      const paymentUrl = paymentRes.data.paymentUrl;

      await Linking.openURL(paymentUrl);
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
      <Header title="Confirm Booking" />

      <ScrollView showsVerticalScrollIndicator={false} className="px-4 pt-5">
        <DiscountCard
          movie={movie}
          showtime={showtime}
          seats={seats}
        />

        {/* Order Summary */}
        <View className="bg-[#141420] rounded-2xl p-5 mb-3 border border-[#1E1E2E]">
          <View className="flex-row items-center gap-2 mb-4">
            <View className="w-1 h-5 bg-[#00D4FF] rounded-full" />
            <Text className="text-white text-lg font-extrabold">Order Summary</Text>
          </View>

          <View className="flex-row justify-between items-center mb-3">
            <View className="flex-row items-center gap-2">
              <Ionicons name="ticket-outline" size={14} color="#888" />
              <Text className="text-gray-400 text-sm">Tickets ({seats.length}x)</Text>
            </View>
            <Text className="text-gray-200 text-sm font-semibold">{formatCurrency(originalPrice)}</Text>
          </View>

          {preview?.discount && (
            <View className="flex-row justify-between items-center mb-3">
              <View className="flex-row items-center gap-2">
                <Ionicons name="pricetag" size={14} color="#00D4FF" />
                <Text className="text-[#00D4FF] text-sm font-semibold">
                  Promo ({preview.discount.code})
                </Text>
              </View>
              <Text className="text-[#4CAF50] text-sm font-bold">-{formatCurrency(discountValue)}</Text>
            </View>
          )}

          <View className="h-[1px] bg-[#1E1E2E] my-2" />

          <View className="flex-row justify-between items-center">

            <Text className="text-white text-base font-bold">Total</Text>
            <View>
              {selectedDiscount && (
                <Text className="text-gray-600 text-xs line-through text-right">
                  {formatCurrency(originalPrice)}
                </Text>
              )}
              <Text className="text-[#00D4FF] text-2xl font-black">{formatCurrency(finalTotal)}</Text>
            </View>
          </View>
        </View>

        {/* Discount Picker */}
        <TouchableOpacity
          className="bg-[#141420] rounded-2xl p-4 mb-3 border border-[#1E1E2E] flex-row justify-between items-center"
          onPress={() => setIsDiscountModalVisible(true)}
        >
          <View className="flex-row items-center gap-3">
            <View className="w-9 h-9 rounded-full bg-[#00D4FF]/10 items-center justify-center">
              <Ionicons name="gift-outline" size={18} color="#00D4FF" />
            </View>
            <View>
              <Text className="text-gray-200 text-sm font-semibold">
                {selectedDiscount ? `Applied: ${selectedDiscount.code}` : 'Apply Promo Code'}
              </Text>
              <Text className="text-gray-600 text-xs">
                {selectedDiscount
                  ? `-${selectedDiscount.percentage}% discount`
                  : 'Tap to view available offers'}
              </Text>
            </View>
          </View>
          <View className="flex-row items-center gap-1">
            {selectedDiscount && (
              <View className="bg-[#4CAF50]/20 px-2 py-0.5 rounded-md mr-1">
                <Text className="text-[#4CAF50] text-[10px] font-black">SAVED</Text>
              </View>
            )}
            <Ionicons name="chevron-forward" size={18} color="#555" />
          </View>
        </TouchableOpacity>

        <Text className="text-gray-600 text-xs text-center leading-5 px-4 mb-2">
          By confirming, you agree to CINEVIET's Terms of Service and Refund Policy.
        </Text>

        <View className="h-28" />
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
              <View>
                <Text className="text-white text-xl font-black italic">YOUR OFFERS</Text>
                <Text className="text-gray-600 text-xs mt-0.5">{discounts.length} offers available</Text>
              </View>
              <TouchableOpacity
                onPress={() => setIsDiscountModalVisible(false)}
                className="w-9 h-9 rounded-full bg-[#1E1E2E] items-center justify-center"
              >
                <Ionicons name="close" size={18} color="#FFF" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>

              {discounts.length === 0 ? (
                <View className="items-center py-8 gap-2">
                  <Ionicons name="gift-outline" size={40} color="#333" />
                  <Text className="text-gray-600 text-sm font-bold">No offers available</Text>
                </View>
              ) : (
                discounts.map((v) => (
                  <TouchableOpacity
                    key={v._id}
                    className={`mb-3 p-4 rounded-2xl border ${selectedDiscount?._id === v._id ? 'bg-[#00D4FF]/10 border-[#00D4FF]' : 'bg-[#141420] border-[#1E1E2E]'}`}
                    onPress={() => {
                      setSelectedDiscount(v);
                      setIsDiscountModalVisible(false);
                    }}
                  >
                    <View className="flex-row justify-between items-center mb-1.5">
                      <View className="flex-row items-center gap-2">
                        <Ionicons name="pricetag-outline" size={14} color={selectedDiscount?._id === v._id ? '#00D4FF' : '#888'} />
                        <Text className="text-white font-black italic tracking-wider">{v.code}</Text>
                      </View>
                      <View className="bg-[#00D4FF]/15 px-2.5 py-1 rounded-lg">
                        <Text className="text-[#00D4FF] font-black text-sm">-{v.percentage}%</Text>
                      </View>
                    </View>
                    <Text className="text-gray-500 text-xs leading-5 ml-6">
                      {v.description || 'Applicable to all screenings.'}
                    </Text>
                    {selectedDiscount?._id === v._id && (
                      <View className="flex-row items-center gap-1 mt-2 ml-6">
                        <Ionicons name="checkmark-circle" size={12} color="#00D4FF" />
                        <Text className="text-[#00D4FF] text-[10px] font-bold">Applied</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                ))
              )}

              <TouchableOpacity
                className="mt-2 py-4 rounded-2xl border border-dashed border-gray-700 items-center"
                onPress={() => {
                  setSelectedDiscount(null);
                  setIsDiscountModalVisible(false);
                }}
              >
                <Text className="text-gray-500 font-bold">No discount</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Sticky Bottom */}
      <View className="absolute bottom-0 left-0 right-0 px-4 pb-7 pt-3 bg-[#0A0A0F]/97 border-t border-[#1E1E2E]">
        {/* Price preview */}
        <View className="flex-row justify-between items-center mb-3 px-1">
          <Text className="text-gray-500 text-sm">Total amount</Text>
          <Text className="text-white text-lg font-black">{formatCurrency(finalTotal)}</Text>
        </View>

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

                <Text className="text-[#0A0A0F] text-base font-black tracking-wider">
                  PAY NOW · {formatCurrency(finalTotal)}
                </Text>
              </View>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </ScreenWrapper>
  );
}

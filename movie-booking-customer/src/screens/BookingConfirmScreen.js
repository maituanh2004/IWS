import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Linking from 'expo-linking';
import * as api from '../services/api';
import ScreenWrapper from '../components/ScreenWrapper';
import Header from '../components/Header';
import VoucherCard from '../components/VoucherCard';

const formatVND = (n) => n.toLocaleString('vi-VN') + 'đ';

export default function BookingConfirmScreen({ route, navigation }) {
  const {
    movie = { title: 'Avengers: Doomsday', poster: null },
    cinema = { name: 'CineViet Cinema' },
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

  const handlePayment = async () => {
    setLoading(true);
    try {
      if (!showtime?._id) throw new Error('Showtime ID is missing');
      const response = await api.createBooking(showtime._id, seats, selectedVoucher?.code);

      if (response.data.success) {
        const { bookingGroupId } = response.data.data;
        
        // 💳 Call payment API to get VNPAY URL
        const paymentRes = await api.createPayment(bookingGroupId);
        
        if (paymentRes.data.success && paymentRes.data.paymentUrl) {
          // 🚀 Redirect to VNPAY
          Linking.openURL(paymentRes.data.paymentUrl);
        } else {
          throw new Error('Could not generate payment URL');
        }
      } else {
        throw new Error(response.data.message || response.data.error || 'Booking failed');
      }
    } catch (e) {
      console.error('Payment Flow Error:', e);
      const errorMessage = e.response?.data?.message || e.response?.data?.error || e.message || 'Payment processing failed';
      const statusCode = e.response?.status?.toString() || '500';
      
      navigation.navigate('SystemError', { 
        errorType: statusCode === '404' ? '404' : '500',
        message: errorMessage
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenWrapper>
      <Header title="Confirm Booking" />

      <ScrollView showsVerticalScrollIndicator={false} className="px-4 pt-5">
        <VoucherCard
          movie={movie}
          showtime={showtime}
          seats={seats}
          bookingCode={'#PREVIEW'}
          cinemaName={cinema.name}
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
            <Text className="text-gray-200 text-sm font-semibold">{formatVND(totalPrice)}</Text>
          </View>

          {selectedVoucher && (
            <View className="flex-row justify-between items-center mb-3">
              <View className="flex-row items-center gap-2">
                <Ionicons name="pricetag" size={14} color="#00D4FF" />
                <Text className="text-[#00D4FF] text-sm font-semibold">
                  Promo ({selectedVoucher.code})
                </Text>
              </View>
              <Text className="text-[#4CAF50] text-sm font-bold">-{formatVND(PROMO_DISCOUNT)}</Text>
            </View>
          )}

          <View className="h-[1px] bg-[#1E1E2E] my-2" />

          <View className="flex-row justify-between items-center">
            <Text className="text-white text-base font-bold">Total</Text>
            <View>
              {selectedVoucher && (
                <Text className="text-gray-600 text-xs line-through text-right">
                  {formatVND(totalPrice)}
                </Text>
              )}
              <Text className="text-[#00D4FF] text-2xl font-black">{formatVND(finalTotal)}</Text>
            </View>
          </View>
        </View>

        {/* Voucher Picker */}
        <TouchableOpacity
          className="bg-[#141420] rounded-2xl p-4 mb-3 border border-[#1E1E2E] flex-row justify-between items-center"
          onPress={() => setIsVoucherModalVisible(true)}
        >
          <View className="flex-row items-center gap-3">
            <View className="w-9 h-9 rounded-full bg-[#00D4FF]/10 items-center justify-center">
              <Ionicons name="gift-outline" size={18} color="#00D4FF" />
            </View>
            <View>
              <Text className="text-gray-200 text-sm font-semibold">
                {selectedVoucher ? `Applied: ${selectedVoucher.code}` : 'Apply Promo Code'}
              </Text>
              <Text className="text-gray-600 text-xs">
                {selectedVoucher
                  ? `-${selectedVoucher.discountPercentage}% discount`
                  : 'Tap to view available offers'}
              </Text>
            </View>
          </View>
          <View className="flex-row items-center gap-1">
            {selectedVoucher && (
              <View className="bg-[#4CAF50]/20 px-2 py-0.5 rounded-md mr-1">
                <Text className="text-[#4CAF50] text-[10px] font-black">SAVED</Text>
              </View>
            )}
            <Ionicons name="chevron-forward" size={18} color="#555" />
          </View>
        </TouchableOpacity>

        {/* Payment Method */}
        <View className="bg-[#141420] rounded-2xl px-4 py-3.5 flex-row items-center justify-between mb-3 border border-[#1E1E2E]">
          <View className="flex-row items-center gap-3">
            <View className="w-9 h-9 rounded-full bg-[#1A2A6C]/50 items-center justify-center">
              <Text className="text-white text-[10px] font-black italic">VISA</Text>
            </View>
            <View>
              <Text className="text-gray-200 text-sm font-semibold">Visa •••• 4242</Text>
              <Text className="text-gray-600 text-xs">Default payment method</Text>
            </View>
          </View>
          <TouchableOpacity>
            <Text className="text-[#00D4FF] text-sm font-semibold">Change</Text>
          </TouchableOpacity>
        </View>

        <Text className="text-gray-600 text-xs text-center leading-5 px-4 mb-2">
          By confirming, you agree to CINEVIET's Terms of Service and Refund Policy.
        </Text>

        <View className="h-28" />
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
              <View>
                <Text className="text-white text-xl font-black italic">YOUR OFFERS</Text>
                <Text className="text-gray-600 text-xs mt-0.5">{vouchers.length} offers available</Text>
              </View>
              <TouchableOpacity
                onPress={() => setIsVoucherModalVisible(false)}
                className="w-9 h-9 rounded-full bg-[#1E1E2E] items-center justify-center"
              >
                <Ionicons name="close" size={18} color="#FFF" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {vouchers.length === 0 ? (
                <View className="items-center py-8 gap-2">
                  <Ionicons name="gift-outline" size={40} color="#333" />
                  <Text className="text-gray-600 text-sm font-bold">No offers available</Text>
                </View>
              ) : (
                vouchers.map((v) => (
                  <TouchableOpacity
                    key={v._id}
                    className={`mb-3 p-4 rounded-2xl border ${selectedVoucher?._id === v._id ? 'bg-[#00D4FF]/10 border-[#00D4FF]' : 'bg-[#141420] border-[#1E1E2E]'}`}
                    onPress={() => {
                      setSelectedVoucher(v);
                      setIsVoucherModalVisible(false);
                    }}
                  >
                    <View className="flex-row justify-between items-center mb-1.5">
                      <View className="flex-row items-center gap-2">
                        <Ionicons name="pricetag-outline" size={14} color={selectedVoucher?._id === v._id ? '#00D4FF' : '#888'} />
                        <Text className="text-white font-black italic tracking-wider">{v.code}</Text>
                      </View>
                      <View className="bg-[#00D4FF]/15 px-2.5 py-1 rounded-lg">
                        <Text className="text-[#00D4FF] font-black text-sm">-{v.discountPercentage}%</Text>
                      </View>
                    </View>
                    <Text className="text-gray-500 text-xs leading-5 ml-6">
                      {v.description || 'Applicable to all screenings.'}
                    </Text>
                    {selectedVoucher?._id === v._id && (
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
                  setSelectedVoucher(null);
                  setIsVoucherModalVisible(false);
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
          <Text className="text-white text-lg font-black">{formatVND(finalTotal)}</Text>
        </View>

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
                <Text className="text-[#0A0A0F] text-base font-black tracking-wider">
                  PAY NOW · {formatVND(finalTotal)}
                </Text>
              </View>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </ScreenWrapper>
  );
}

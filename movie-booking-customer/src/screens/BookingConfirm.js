import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  StatusBar,
  Dimensions,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as api from '../services/api';

const { width: SCREEN_W } = Dimensions.get('window');
const TICKET_W = SCREEN_W - 32;
const NOTCH_R  = 18; // radius of ticket tear notch

const formatVND = (n) => n.toLocaleString('vi-VN') + 'đ';

export default function BookingConfirmScreen({ route, navigation }) {
  const {
    movie    = { title: 'Avengers: Doomsday', poster: null },
    cinema   = { name: 'CGV Vincom Bà Triệu' },
    time     = '14:00',
    date     = 18,
    seats    = ['A4', 'A5', 'A6'],
    totalPrice = 360000,
  } = route.params ?? {};

  const [loading, setLoading]       = useState(false);
  const [promoApplied]              = useState(true); // demo: promo applied
  const PROMO_DISCOUNT               = 30000;
  const finalTotal                   = promoApplied ? totalPrice - PROMO_DISCOUNT : totalPrice;
  const BOOKING_CODE                 = '#CVN-20250418-8821';

  // ── Payment ──────────────────────────────────────────────────────────────
  const handlePayment = async () => {
    setLoading(true);
    try {
      // Replace with real API call when available
      // await api.createBooking({ ... });
      await new Promise((r) => setTimeout(r, 1200)); // simulated delay
      Alert.alert(
        '🎉 Đặt vé thành công!',
        `Vé của bạn đã được xác nhận.\nMã: ${BOOKING_CODE}`,
        [{ text: 'Xem vé', onPress: () => navigation.navigate('BookingHistory') }]
      );
    } catch (e) {
      Alert.alert('Lỗi', 'Thanh toán thất bại. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  // ── Helpers ───────────────────────────────────────────────────────────────
  const cinemaShort = (cinema?.name ?? '').replace('Cinema', '').replace('Vincom', 'Vincom').split(' ').slice(0, 3).join(' ');

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="#0A0A0F" />

      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Xác Nhận Đặt Vé</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >

        {/* ════════════════════════════════════════
            TICKET CARD
        ════════════════════════════════════════ */}
        <View style={styles.ticketOuter}>

          {/* ── Top half (white) ── */}
          <View style={styles.ticketTop}>

            {/* Movie row */}
            <View style={styles.movieRow}>
              {/* Poster thumbnail */}
              <View style={styles.posterThumb}>
                {movie.poster ? (
                  <Image source={{ uri: movie.poster }} style={styles.posterImg} />
                ) : (
                  <LinearGradient
                    colors={['#3A1A00', '#8B3A00']}
                    style={styles.posterImg}
                  >
                    <Text style={styles.posterPlaceholderText}>🎬</Text>
                  </LinearGradient>
                )}
              </View>

              {/* Movie info */}
              <View style={styles.movieInfo}>
                <Text style={styles.movieTitle} numberOfLines={2}>
                  {movie.title}
                </Text>
                <Text style={styles.movieSub}>
                  Phòng 5 IMAX • {cinemaShort}
                </Text>
                {/* Format & age badges */}
                <View style={styles.badgeRow}>
                  <View style={styles.badgeImax}>
                    <Text style={styles.badgeImaxText}>IMAX 3D</Text>
                  </View>
                  <View style={styles.badgeAge}>
                    <Text style={styles.badgeAgeText}>T13</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Divider */}
            <View style={styles.infoSeparator} />

            {/* Date / Time */}
            <View style={styles.infoGrid}>
              <View style={styles.infoCol}>
                <Text style={styles.infoLabel}>NGÀY CHIẾU</Text>
                <Text style={styles.infoValue}>Thứ 6, 18/04</Text>
              </View>
              <View style={styles.infoCol}>
                <Text style={styles.infoLabel}>GIỜ CHIẾU</Text>
                <Text style={styles.infoValue}>{time}</Text>
              </View>
            </View>

            {/* Seats */}
            <View style={styles.seatsBlock}>
              <Text style={styles.infoLabel}>GHẾ NGỒI</Text>
              <Text style={styles.seatsValue}>{seats.join(', ')}</Text>
            </View>
          </View>

          {/* ── Tear divider ── */}
          <View style={styles.tearRow}>
            {/* Left notch */}
            <View style={styles.notchLeft} />
            {/* Dashed line */}
            <View style={styles.dashedLine}>
              {Array.from({ length: 22 }).map((_, i) => (
                <View key={i} style={styles.dash} />
              ))}
            </View>
            {/* Scissors icon */}
            <View style={styles.scissorWrapper}>
              <Ionicons name="cut-outline" size={18} color="#AAAAAA" />
            </View>
            {/* Right notch */}
            <View style={styles.notchRight} />
          </View>

          {/* ── Bottom half (light gray) ── */}
          <View style={styles.ticketBottom}>
            {/* QR Code */}
            <View style={styles.qrWrapper}>
              <View style={styles.qrBox}>
                {/* QR pattern placeholder using grid */}
                <View style={styles.qrInner}>
                  {Array.from({ length: 6 }).map((_, row) => (
                    <View key={row} style={styles.qrRow}>
                      {Array.from({ length: 6 }).map((_, col) => (
                        <View
                          key={col}
                          style={[
                            styles.qrCell,
                            (row + col) % 2 === 0 && styles.qrCellDark,
                            // Corner markers
                            ((row < 2 && col < 2) || (row < 2 && col > 3) || (row > 3 && col < 2))
                              && styles.qrCellCorner,
                          ]}
                        />
                      ))}
                    </View>
                  ))}
                </View>
              </View>
            </View>

            {/* Booking code */}
            <Text style={styles.bookingCode}>{BOOKING_CODE}</Text>
          </View>

          {/* Corner clips (bottom of ticket card) */}
          <View style={styles.cornerBL} />
          <View style={styles.cornerBR} />
          <View style={styles.cornerTL} />
          <View style={styles.cornerTR} />
        </View>
        {/* end ticket */}

        {/* ════════════════════════════════════════
            ORDER SUMMARY
        ════════════════════════════════════════ */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Tóm tắt đơn hàng</Text>

          {/* Ticket price */}
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Vé phim ({seats.length}x)</Text>
            <Text style={styles.summaryValue}>{formatVND(totalPrice)}</Text>
          </View>

          {/* Promo */}
          {promoApplied && (
            <View style={styles.summaryRow}>
              <View style={styles.promoLabelRow}>
                <Ionicons name="pricetag" size={14} color="#F4C430" />
                <Text style={styles.promoLabel}>Promo code applied</Text>
              </View>
              <Text style={styles.promoValue}>-{formatVND(PROMO_DISCOUNT)}</Text>
            </View>
          )}

          {/* Divider */}
          <View style={styles.summaryDivider} />

          {/* Total */}
          <View style={styles.summaryRow}>
            <Text style={styles.totalLabel}>Tổng cộng</Text>
            <Text style={styles.totalValue}>{formatVND(finalTotal)}</Text>
          </View>
        </View>

        {/* ════════════════════════════════════════
            PAYMENT METHOD
        ════════════════════════════════════════ */}
        <View style={styles.paymentCard}>
          <View style={styles.paymentLeft}>
            {/* VISA badge */}
            <View style={styles.visaBadge}>
              <Text style={styles.visaText}>VISA</Text>
            </View>
            <Text style={styles.paymentCardText}>Visa •••• 4242</Text>
          </View>
          <TouchableOpacity>
            <Text style={styles.changeText}>Thay đổi</Text>
          </TouchableOpacity>
        </View>

        {/* Disclaimer */}
        <Text style={styles.disclaimer}>
          Bằng việc thanh toán, bạn đồng ý với Điều khoản dịch vụ và Chính
          sách hoàn tiền của CINEVIET.
        </Text>

        {/* Bottom space for sticky CTA */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* ════════════════════════════════════════
          STICKY PAYMENT CTA
      ════════════════════════════════════════ */}
      <View style={styles.ctaBar}>
        <TouchableOpacity
          style={styles.ctaWrapper}
          onPress={handlePayment}
          disabled={loading}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={['#00D4FF', '#00AACC']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.ctaBtn}
          >
            {loading ? (
              <ActivityIndicator color="#0A0A0F" />
            ) : (
              <View style={styles.ctaInner}>
                <Ionicons name="card-outline" size={20} color="#0A0A0F" />
                <Text style={styles.ctaText}>
                  THANH TOÁN {formatVND(finalTotal)}
                </Text>
              </View>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#0A0A0F',
  },

  // ── Header ──────────────────────────────────────────────────────────────────
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 52,
    paddingBottom: 14,
    paddingHorizontal: 16,
    backgroundColor: '#0A0A0F',
    borderBottomWidth: 0.5,
    borderBottomColor: '#1E1E2E',
  },
  backBtn: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },

  // ── Scroll ──────────────────────────────────────────────────────────────────
  scroll: {
    paddingHorizontal: 16,
    paddingTop: 20,
  },

  // ════════════════════════════════════════════════════════
  // TICKET
  // ════════════════════════════════════════════════════════
  ticketOuter: {
    width: TICKET_W,
    alignSelf: 'center',
    marginBottom: 20,
    // clip the corner notches
    position: 'relative',
  },

  // ── Top half ────────────────────────────────────────────
  ticketTop: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 18,
  },

  // Movie row
  movieRow: {
    flexDirection: 'row',
    gap: 14,
    marginBottom: 16,
  },
  posterThumb: {
    width: 88,
    height: 110,
    borderRadius: 10,
    overflow: 'hidden',
  },
  posterImg: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  posterPlaceholderText: {
    fontSize: 32,
  },
  movieInfo: {
    flex: 1,
    justifyContent: 'center',
    gap: 5,
  },
  movieTitle: {
    color: '#0A0A0F',
    fontSize: 18,
    fontWeight: '800',
    lineHeight: 22,
  },
  movieSub: {
    color: '#666',
    fontSize: 13,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 4,
  },
  badgeImax: {
    backgroundColor: '#F4C430',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeImaxText: {
    color: '#0A0A0F',
    fontSize: 11,
    fontWeight: '800',
  },
  badgeAge: {
    backgroundColor: '#2A2A3A',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeAgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },

  // Info separator
  infoSeparator: {
    height: 1,
    backgroundColor: '#EEEEEE',
    marginVertical: 14,
  },

  // Date / Time grid
  infoGrid: {
    flexDirection: 'row',
    gap: 32,
    marginBottom: 14,
  },
  infoCol: {
    gap: 4,
  },
  infoLabel: {
    color: '#AAAAAA',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
  },
  infoValue: {
    color: '#0A0A0F',
    fontSize: 20,
    fontWeight: '800',
  },

  // Seats
  seatsBlock: {
    gap: 4,
  },
  seatsValue: {
    color: '#0A0A0F',
    fontSize: 22,
    fontWeight: '800',
  },

  // ── Tear divider ─────────────────────────────────────────
  tearRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0A0A0F',
    height: NOTCH_R * 2,
    position: 'relative',
  },
  notchLeft: {
    width: NOTCH_R,
    height: NOTCH_R * 2,
    borderTopRightRadius: NOTCH_R,
    borderBottomRightRadius: NOTCH_R,
    backgroundColor: '#FFFFFF',
    position: 'absolute',
    left: 0,
    zIndex: 2,
  },
  notchRight: {
    width: NOTCH_R,
    height: NOTCH_R * 2,
    borderTopLeftRadius: NOTCH_R,
    borderBottomLeftRadius: NOTCH_R,
    backgroundColor: '#FFFFFF',
    position: 'absolute',
    right: 0,
    zIndex: 2,
  },
  dashedLine: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingHorizontal: NOTCH_R + 8,
  },
  dash: {
    width: 8,
    height: 1.5,
    backgroundColor: '#555',
    borderRadius: 1,
  },
  scissorWrapper: {
    position: 'absolute',
    left: '50%',
    transform: [{ translateX: -9 }],
    zIndex: 3,
  },

  // ── Bottom half ──────────────────────────────────────────
  ticketBottom: {
    backgroundColor: '#E8E8EE',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    paddingVertical: 24,
    alignItems: 'center',
    gap: 14,
  },
  qrWrapper: {
    padding: 6,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
  },
  qrBox: {
    width: 130,
    height: 130,
    backgroundColor: '#FFFFFF',
    padding: 8,
  },
  qrInner: {
    flex: 1,
    gap: 2,
  },
  qrRow: {
    flex: 1,
    flexDirection: 'row',
    gap: 2,
  },
  qrCell: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 1,
  },
  qrCellDark: {
    backgroundColor: '#1A1A1A',
  },
  qrCellCorner: {
    backgroundColor: '#0A0A0F',
    borderRadius: 2,
  },
  bookingCode: {
    color: '#0A0A0F',
    fontSize: 15,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
    letterSpacing: 0.5,
  },

  // Corner clips (decorative)
  cornerTL: {
    position: 'absolute', top: -1, left: -1,
    width: 20, height: 20,
    borderTopLeftRadius: 20,
    backgroundColor: '#0A0A0F',
  },
  cornerTR: {
    position: 'absolute', top: -1, right: -1,
    width: 20, height: 20,
    borderTopRightRadius: 20,
    backgroundColor: '#0A0A0F',
  },
  cornerBL: {
    position: 'absolute', bottom: -1, left: -1,
    width: 20, height: 20,
    borderBottomLeftRadius: 20,
    backgroundColor: '#0A0A0F',
  },
  cornerBR: {
    position: 'absolute', bottom: -1, right: -1,
    width: 20, height: 20,
    borderBottomRightRadius: 20,
    backgroundColor: '#0A0A0F',
  },

  // ════════════════════════════════════════════════════════
  // ORDER SUMMARY
  // ════════════════════════════════════════════════════════
  summaryCard: {
    backgroundColor: '#141420',
    borderRadius: 16,
    padding: 18,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#1E1E2E',
    gap: 12,
  },
  summaryTitle: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 4,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    color: '#AAAAAA',
    fontSize: 14,
  },
  summaryValue: {
    color: '#DDDDDD',
    fontSize: 14,
    fontWeight: '600',
  },
  promoLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  promoLabel: {
    color: '#F4C430',
    fontSize: 14,
    fontWeight: '600',
  },
  promoValue: {
    color: '#4CAF50',
    fontSize: 14,
    fontWeight: '700',
  },
  summaryDivider: {
    height: 1,
    backgroundColor: '#1E1E2E',
    marginVertical: 2,
  },
  totalLabel: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  totalValue: {
    color: '#00D4FF',
    fontSize: 20,
    fontWeight: '900',
  },

  // ════════════════════════════════════════════════════════
  // PAYMENT METHOD
  // ════════════════════════════════════════════════════════
  paymentCard: {
    backgroundColor: '#141420',
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#1E1E2E',
  },
  paymentLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  visaBadge: {
    backgroundColor: '#1A2A6C',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  visaText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 1,
    fontStyle: 'italic',
  },
  paymentCardText: {
    color: '#DDDDDD',
    fontSize: 14,
    fontWeight: '500',
  },
  changeText: {
    color: '#00D4FF',
    fontSize: 14,
    fontWeight: '600',
  },

  // Disclaimer
  disclaimer: {
    color: '#555',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 8,
    marginBottom: 8,
  },

  // ════════════════════════════════════════════════════════
  // STICKY CTA
  // ════════════════════════════════════════════════════════
  ctaBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingBottom: 28,
    paddingTop: 12,
    backgroundColor: 'rgba(10,10,15,0.97)',
    borderTopWidth: 0.5,
    borderTopColor: '#1E1E2E',
  },
  ctaWrapper: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#00D4FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  ctaBtn: {
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ctaInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  ctaText: {
    color: '#0A0A0F',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
});
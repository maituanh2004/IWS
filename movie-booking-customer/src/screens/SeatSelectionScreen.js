import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  StatusBar,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as api from '../services/api';
import { useAuth } from '../context/AuthContext';

const { width: SCREEN_W } = Dimensions.get('window');

// ─── Seat Config ──────────────────────────────────────────────────────────────

// 7 regular rows (A-G), 9 seats each
// Center VIP: rows D, E (middle 5 seats)
// Last row H: 4 couple seats
const ROW_CONFIG = [
  { row: 'A', type: 'regular', cols: 9 },
  { row: 'B', type: 'regular', cols: 9 },
  { row: 'C', type: 'regular', cols: 9 },
  { row: 'D', type: 'vip',     cols: 9, vipRange: [3, 7] }, // VIP: D4-D8
  { row: 'E', type: 'vip',     cols: 9, vipRange: [3, 7] }, // VIP: E4-E8
  { row: 'F', type: 'regular', cols: 9 },
  { row: 'G', type: 'regular', cols: 9 },
  { row: 'H', type: 'couple',  coupleSeats: 4 }, // Hàng ghế đôi
];

// Pre-booked seats for demo (can be empty or keep for demo)
const DEMO_BOOKED = ['A1', 'A2', 'B3', 'D5', 'E6', 'H1C', 'H3C'];

const PRICE_REGULAR = 120000;
const PRICE_VIP     = 150000;
const PRICE_COUPLE  = 200000; // per couple unit

// ─── Helpers ──────────────────────────────────────────────────────────────────
const formatVND = (n) =>
  n.toLocaleString('vi-VN') + 'đ';

// ─── Component ────────────────────────────────────────────────────────────────
export default function SeatSelectionScreen({ route, navigation }) {
  const { movie, cinema, time, date } = route.params ?? {
    movie:  { title: 'Avengers: Doomsday' },
    cinema: { name: 'CGV Vincom Bà Triệu' },
    time:   '14:00',
    date:   18,
  };

  const { user } = useAuth();

  const [bookedSeats, setBookedSeats]   = useState(DEMO_BOOKED);
  const [selectedSeats, setSelectedSeats] = useState([]); // No pre-selected seats
  const [loading, setLoading]           = useState(false);

  // ── Toggle seat ──────────────────────────────────────────────────────────
  const toggleSeat = (seatId, type) => {
    if (bookedSeats.includes(seatId)) return;

    setSelectedSeats((prev) =>
      prev.includes(seatId)
        ? prev.filter((s) => s !== seatId)
        : [...prev, seatId]
    );
  };

  // ── Price calculation ─────────────────────────────────────────────────────
  const totalPrice = selectedSeats.reduce((sum, seatId) => {
    const row = seatId[0];
    const cfg = ROW_CONFIG.find((r) => r.row === row);
    if (!cfg) return sum + PRICE_REGULAR;
    if (cfg.type === 'couple') return sum + PRICE_COUPLE;
    // VIP seats: only center seats in D/E
    if (cfg.type === 'vip' && cfg.vipRange) {
      const col = parseInt(seatId.slice(1), 10);
      if (col >= cfg.vipRange[0] && col <= cfg.vipRange[1]) return sum + PRICE_VIP;
      return sum + PRICE_REGULAR;
    }
    return sum + PRICE_REGULAR;
  }, 0);

  // ── Handle booking ────────────────────────────────────────────────────────
  const handleContinue = () => {
    if (selectedSeats.length === 0) {
      Alert.alert('Thông báo', 'Vui lòng chọn ít nhất 1 ghế');
      return;
    }
    navigation.navigate('BookingConfirm', {
      movie,
      cinema,
      time,
      date,
      seats: selectedSeats,
      totalPrice,
    });
  };


  // Seat cell for regular/vip
  const SeatCell = ({ seatId, type, colNum, isVip }) => {
    const isBooked   = bookedSeats.includes(seatId);
    const isSelected = selectedSeats.includes(seatId);

    let seatStyle    = [styles.seat];
    let textStyle    = [styles.seatText];
    let shadowStyle  = {};

    if (isSelected) {
      seatStyle.push(styles.seatSelected);
      shadowStyle = styles.seatSelectedShadow;
      textStyle.push(styles.seatTextSelected);
    } else if (isBooked) {
      seatStyle.push(styles.seatBooked);
    } else if (isVip) {
      seatStyle.push(styles.seatVip);
    } else {
      seatStyle.push(styles.seatRegular);
    }

    return (
      <TouchableOpacity
        style={[...seatStyle, shadowStyle]}
        onPress={() => toggleSeat(seatId, isVip ? 'vip' : type)}
        disabled={isBooked}
        activeOpacity={0.7}
      >
        {isSelected && (
          <Text style={textStyle}>{colNum}</Text>
        )}
      </TouchableOpacity>
    );
  };


  // Couple seat cell
  const CoupleSeatCell = ({ seatId }) => {
    const isBooked   = bookedSeats.includes(seatId);
    const isSelected = selectedSeats.includes(seatId);

    return (
      <TouchableOpacity
        style={[
          styles.coupleSeat,
          isSelected && styles.coupleSeatSelected,
          isBooked && styles.seatBooked,
        ]}
        onPress={() => toggleSeat(seatId, 'couple')}
        disabled={isBooked}
        activeOpacity={0.7}
      />
    );
  };


  // Render seat grid
  const renderGrid = () =>
    ROW_CONFIG.map((rowCfg) => {
      const cells = [];

      if (rowCfg.type === 'couple') {
        // Couple seats: H1C, H2C, H3C, H4C
        for (let k = 1; k <= rowCfg.coupleSeats; k++) {
          const seatId = `${rowCfg.row}${k}C`;
          cells.push(<CoupleSeatCell key={seatId} seatId={seatId} />);
          if (k < rowCfg.coupleSeats) cells.push(<View key={`aisle-couple-${k}`} style={styles.aisle} />);
        }
      } else {
        for (let c = 1; c <= rowCfg.cols; c++) {
          let isVip = false;
          if (rowCfg.type === 'vip' && rowCfg.vipRange) {
            if (c >= rowCfg.vipRange[0] && c <= rowCfg.vipRange[1]) isVip = true;
          }
          const seatId = `${rowCfg.row}${c}`;
          cells.push(
            <SeatCell
              key={seatId}
              seatId={seatId}
              type={rowCfg.type}
              colNum={c}
              isVip={isVip}
            />
          );
          // Optional: add aisle after 3rd and 6th seat for visual
          if (c === 3 || c === 6) cells.push(<View key={`aisle-${rowCfg.row}-${c}`} style={styles.aisle} />);
        }
      }

      return (
        <View key={rowCfg.row} style={styles.seatRow}>
          {cells}
        </View>
      );
    });

  // ── Loading ───────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00D4FF" />
      </View>
    );
  }

  // ── UI ────────────────────────────────────────────────────────────────────
  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="#0A0A0F" />

      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Chọn Ghế</Text>
          <Text style={styles.headerSub}>{cinema?.name ?? 'CGV Vincom Bà Triệu'}</Text>
        </View>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        {/* ── Movie Info Card ── */}
        <View style={styles.movieInfoCard}>
          <View style={styles.movieInfoTop}>
            <Ionicons name="film" size={22} color="#00D4FF" style={{ marginRight: 10 }} />
            <Text style={styles.movieInfoTitle}>{movie?.title ?? 'Avengers: Doomsday'}</Text>
          </View>
          <View style={styles.movieInfoBottom}>
            <View style={styles.movieInfoItem}>
              <Ionicons name="calendar-outline" size={14} color="#AAAAAA" />
              <Text style={styles.movieInfoText}>T6, 18/04</Text>
            </View>
            <View style={styles.movieInfoItem}>
              <Ionicons name="time-outline" size={14} color="#AAAAAA" />
              <Text style={styles.movieInfoText}>{time ?? '14:00'}</Text>
            </View>
            <View style={styles.movieInfoItem}>
              <Ionicons name="tablet-landscape-outline" size={14} color="#00D4FF" />
              <Text style={[styles.movieInfoText, { color: '#00D4FF' }]}>Phòng 5 - IMAX</Text>
            </View>
          </View>
        </View>

        {/* ── Screen Indicator ── */}
        <View style={styles.screenWrapper}>
          <View style={styles.screenArc} />
          <Text style={styles.screenLabel}>MÀN HÌNH</Text>
        </View>

        {/* ── Seat Grid ── */}
        <View style={styles.grid}>
          {renderGrid()}
        </View>

        {/* ── Legend ── */}
        <View style={styles.legendContainer}>
          <View style={styles.legendRow}>
            {/* Thường */}
            <View style={styles.legendItem}>
              <View style={[styles.legendSwatch, styles.seatRegular]} />
              <Text style={styles.legendText}>Thường</Text>
            </View>
            {/* Đang chọn */}
            <View style={styles.legendItem}>
              <View style={[styles.legendSwatch, styles.seatSelected]} />
              <Text style={styles.legendText}>Đang chọn</Text>
            </View>
            {/* Đã bán */}
            <View style={styles.legendItem}>
              <View style={[styles.legendSwatch, styles.seatBooked]} />
              <Text style={styles.legendText}>Đã bán</Text>
            </View>
            {/* VIP */}
            <View style={styles.legendItem}>
              <View style={[styles.legendSwatch, styles.seatVip]} />
              <Text style={styles.legendText}>VIP</Text>
            </View>
          </View>
          {/* Couple */}
          <View style={[styles.legendRow, { justifyContent: 'center', marginTop: 10 }]}>
            <View style={styles.legendItem}>
              <View style={[styles.legendSwatchCouple]} />
              <Text style={styles.legendText}>Couple</Text>
            </View>
          </View>
        </View>

        {/* Bottom space for sticky bar */}
        <View style={{ height: 160 }} />
      </ScrollView>

      {/* ── Sticky Bottom Summary + CTA ── */}
      <View style={styles.stickyBottom}>
        {/* Summary */}
        <View style={styles.summaryRow}>
          <View>
            <View style={styles.seatsChosen}>
              <Text style={styles.seatsChosenLabel}>Đã chọn: </Text>
              <Text style={styles.seatsChosenValue}>
                {selectedSeats.length > 0
                  ? selectedSeats.join(', ')
                  : 'Chưa chọn ghế'}
              </Text>
            </View>
            <Text style={styles.totalPrice}>
              {selectedSeats.length > 0 ? formatVND(totalPrice) : '0đ'}
            </Text>
          </View>
        </View>

        {/* CTA Button */}
        <TouchableOpacity
          onPress={handleContinue}
          activeOpacity={0.85}
          style={styles.ctaWrapper}
        >
          <LinearGradient
            colors={['#00D4FF', '#00AACC']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.ctaBtn}
          >
            <Text style={styles.ctaText}>TIẾP TỤC</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const SEAT_SIZE   = 38;
const SEAT_GAP    = 6;
const COUPLE_W    = 82;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#0A0A0F',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#0A0A0F',
    justifyContent: 'center',
    alignItems: 'center',
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
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },
  headerSub: {
    color: '#777',
    fontSize: 12,
    marginTop: 2,
  },

  // ── Scroll ──────────────────────────────────────────────────────────────────
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },

  // ── Movie Info Card ──────────────────────────────────────────────────────────
  movieInfoCard: {
    backgroundColor: '#141420',
    borderRadius: 16,
    padding: 16,
    marginBottom: 28,
    borderWidth: 1,
    borderColor: '#1E1E2E',
  },
  movieInfoTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  movieInfoTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    flex: 1,
  },
  movieInfoBottom: {
    flexDirection: 'row',
    gap: 16,
    flexWrap: 'wrap',
  },
  movieInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  movieInfoText: {
    color: '#AAAAAA',
    fontSize: 13,
    fontWeight: '500',
  },

  // ── Screen Arc ───────────────────────────────────────────────────────────────
  screenWrapper: {
    alignItems: 'center',
    marginBottom: 28,
    position: 'relative',
  },
  screenArc: {
    width: SCREEN_W - 80,
    height: 28,
    borderTopLeftRadius: (SCREEN_W - 80) / 2,
    borderTopRightRadius: (SCREEN_W - 80) / 2,
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderRightWidth: 2,
    borderColor: '#00D4FF',
    // Cyan glow
    shadowColor: '#00D4FF',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 6,
    marginBottom: 6,
  },
  screenLabel: {
    color: '#00D4FF',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 3,
  },

  // ── Grid ─────────────────────────────────────────────────────────────────────
  grid: {
    alignItems: 'center',
    gap: SEAT_GAP,
    marginBottom: 28,
  },
  seatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SEAT_GAP,
  },
  aisle: {
    width: 16,
  },

  // ── Seat Types ────────────────────────────────────────────────────────────────
  seat: {
    width: SEAT_SIZE,
    height: SEAT_SIZE,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  seatRegular: {
    backgroundColor: '#2A2A3A',
  },
  seatBooked: {
    backgroundColor: '#ff3d3d',
    opacity: 0.5,
  },
  seatSelected: {
    backgroundColor: '#00D4FF',
    shadowColor: '#00D4FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 8,
    elevation: 8,
  },
  seatSelectedShadow: {
    shadowColor: '#00D4FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 10,
    elevation: 8,
  },
  seatVip: {
    backgroundColor: '#0A0A0F',
    borderWidth: 1.5,
    borderColor: '#F4C430',
  },
  seatText: {
    color: '#AAAAAA',
    fontSize: 11,
    fontWeight: '600',
  },
  seatTextSelected: {
    color: '#0A0A0F',
    fontSize: 13,
    fontWeight: '800',
  },

  // Couple seat
  coupleSeat: {
    width: COUPLE_W,
    height: SEAT_SIZE,
    borderRadius: 10,
    backgroundColor: '#0A0A0F',
    borderWidth: 1.5,
    borderColor: '#9B59B6',
  },
  coupleSeatSelected: {
    backgroundColor: '#9B59B630',
    borderColor: '#9B59B6',
  },

  // ── Legend ────────────────────────────────────────────────────────────────────
  legendContainer: {
    paddingHorizontal: 8,
    marginBottom: 8,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendSwatch: {
    width: 24,
    height: 24,
    borderRadius: 6,
  },
  legendSwatchCouple: {
    width: 48,
    height: 24,
    borderRadius: 8,
    backgroundColor: '#0A0A0F',
    borderWidth: 1.5,
    borderColor: '#9B59B6',
  },
  legendText: {
    color: '#AAAAAA',
    fontSize: 12,
    fontWeight: '500',
  },

  // ── Sticky Bottom ─────────────────────────────────────────────────────────────
  stickyBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(10,10,15,0.97)',
    borderTopWidth: 0.5,
    borderTopColor: '#1E1E2E',
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 30,
    gap: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  seatsChosen: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  seatsChosenLabel: {
    color: '#777',
    fontSize: 14,
  },
  seatsChosenValue: {
    color: '#00D4FF',
    fontSize: 14,
    fontWeight: '700',
  },
  totalPrice: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: '900',
  },

  // CTA
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
  ctaText: {
    color: '#0A0A0F',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 2,
  },
});
/**
 * MovieDetailScreen.js
 * Requires: npx expo install expo-linear-gradient
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Dimensions,
  Share,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width: SCREEN_W } = Dimensions.get('window');

// ─── Static data ─────────────────────────────────────────────────────────────
const DATES = [
  { day: 'T4', date: 16 },
  { day: 'T5', date: 17 },
  { day: 'T6', date: 18 },
  { day: 'T7', date: 19 },
  { day: 'CN', date: 20 },
  { day: 'T2', date: 21 },
];

const CINEMAS = [
  {
    id: 'cgv',
    name: 'CGV Vincom Bà Triệu',
    distance: '2.1 km',
    times: ['10:30', '14:00', '17:15', '20:45'],
  },
  {
    id: 'lotte',
    name: 'Lotte Cinema Landmark',
    distance: '3.8 km',
    times: ['11:00', '15:30', '19:20'],
  },
];

export default function MovieDetailScreen({ route, navigation }) {
  const { movie } = route.params ?? {
    movie: {
      title: 'Avengers: Doomsday',
      genre: 'Hành Động, Khoa Học Viễn Tưởng',
      rating: 9.2,
      duration: 150,
      ageRating: 'T16',
      description:
        'Một kỷ nguyên mới của Vũ trụ Điện ảnh Marvel bắt đầu khi một mối đe dọa đa vũ trụ không thể tưởng tượng được trỗi dậy. Các anh hùng còn lại phải hợp lực để ngăn chặn sự hủy diệt.',
    },
  };

  const [selectedDate,   setSelectedDate]   = useState(18);
  const [selectedCinema, setSelectedCinema] = useState('cgv');
  const [selectedTime,   setSelectedTime]   = useState('14:00');
  const [expanded,       setExpanded]       = useState(false);

  const genres = (movie.genre || 'Hành Động').split(',').map((g) => g.trim());
  const selectedCinemaObj = CINEMAS.find((c) => c.id === selectedCinema);
  // Short cinema name for CTA: "CGV Vincom"
  const cinemaShort = selectedCinemaObj?.name.split(' ').slice(0, 2).join(' ') ?? '';

  const DESC =
    movie.description ||
    'Một kỷ nguyên mới của Vũ trụ Điện ảnh Marvel bắt đầu khi một mối đe dọa đa vũ trụ không thể tưởng tượng được trỗi dậy. Các anh hùng còn lại phải hợp lực...';

  const handleShare = async () => {
    try {
      await Share.share({ message: `Xem "${movie.title}" trên CINEVIET!` });
    } catch {}
  };

  const handleBooking = () => {
    navigation.navigate('SeatSelection', {
      movie,
      cinema: selectedCinemaObj,
      time: selectedTime,
      date: selectedDate,
    });
  };

  return (
    <View style={styles.root}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

      {/* ─── Hero gradient (purple wave) ─────────────────────────────────── */}
      <View style={styles.heroWrapper} pointerEvents="none">
        <LinearGradient
          colors={['#5C1060', '#3A0A3A', '#1A051A', '#0A0A0F']}
          locations={[0, 0.45, 0.75, 1]}
          style={styles.heroGradient}
          start={{ x: 0.4, y: 0 }}
          end={{ x: 0.6, y: 1 }}
        />
        {/* Organic wavy bottom overlay */}
        <View style={styles.heroWaveContainer}>
          <View style={styles.heroWaveLeft}  />
          <View style={styles.heroWaveRight} />
          <View style={styles.heroWaveFill}  />
        </View>
      </View>

      {/* ─── Floating header ─────────────────────────────────────────────── */}
      <View style={styles.floatingHeader}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.headerBtn} onPress={handleShare}>
          <Ionicons name="share-social-outline" size={22} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* ─── Scrollable content ──────────────────────────────────────────── */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero spacer */}
        <View style={styles.heroSpacer} />

        {/* ── Movie title ── */}
        <View style={styles.infoSection}>
          <Text style={styles.titleLine1}>
            {movie.title?.includes(':')
              ? movie.title.split(':')[0] + ':'
              : movie.title}
          </Text>
          {movie.title?.includes(':') && (
            <Text style={styles.titleLine2}>
              {movie.title.split(':')[1]?.trim()}
            </Text>
          )}

          {/* Genre tags */}
          <View style={styles.genreRow}>
            {genres.map((g) => (
              <View key={g} style={styles.genreTag}>
                <Text style={styles.genreTagText}>{g}</Text>
              </View>
            ))}
          </View>

          {/* Age rating */}
          <View style={styles.ageRow}>
            <View style={styles.ageBadge}>
              <Ionicons name="warning" size={11} color="#FF6B35" />
              <Text style={styles.ageText}>{movie.ageRating ?? 'T16'}</Text>
            </View>
          </View>

          {/* Rating + Duration */}
          <View style={styles.metaRow}>
            <Ionicons name="star" size={16} color="#F4C430" />
            <Text style={styles.metaText}>{movie.rating}/10</Text>
            <View style={styles.metaDot} />
            <Ionicons name="time-outline" size={16} color="#888" />
            <Text style={styles.metaText}>{movie.duration} phút</Text>
          </View>

          {/* Description */}
          <Text
            style={styles.desc}
            numberOfLines={expanded ? undefined : 3}
          >
            {DESC}
          </Text>
          <TouchableOpacity onPress={() => setExpanded(!expanded)} hitSlop={{ top: 8, bottom: 8 }}>
            <Text style={styles.seeMore}>
              {expanded ? 'Thu gọn' : 'Xem thêm'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* ── Chọn Ngày ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Chọn Ngày</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.dateRow}
          >
            {DATES.map((d) => {
              const active = d.date === selectedDate;
              return (
                <TouchableOpacity
                  key={d.date}
                  style={[styles.datePill, active && styles.datePillActive]}
                  onPress={() => setSelectedDate(d.date)}
                  activeOpacity={0.75}
                >
                  <Text style={[styles.dateDayText, active && styles.dateDayTextActive]}>
                    {d.day}
                  </Text>
                  <Text style={[styles.dateNumText, active && styles.dateNumTextActive]}>
                    {d.date}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* ── Chọn Rạp & Suất Chiếu ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Chọn Rạp & Suất Chiếu</Text>

          {CINEMAS.map((cinema) => (
            <View key={cinema.id} style={styles.cinemaCard}>
              <Text style={styles.cinemaName}>{cinema.name}</Text>
              <View style={styles.cinemaDistRow}>
                <Ionicons name="location-outline" size={12} color="#666" />
                <Text style={styles.cinemaDist}>{cinema.distance}</Text>
              </View>

              <View style={styles.timesGrid}>
                {cinema.times.map((t) => {
                  const active = selectedCinema === cinema.id && selectedTime === t;
                  return (
                    <TouchableOpacity
                      key={t}
                      style={[styles.timePill, active && styles.timePillActive]}
                      onPress={() => {
                        setSelectedCinema(cinema.id);
                        setSelectedTime(t);
                      }}
                      activeOpacity={0.75}
                    >
                      <Text style={[styles.timeText, active && styles.timeTextActive]}>
                        {t}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          ))}
        </View>

        {/* Spacer for sticky bar */}
        <View style={{ height: 90 }} />
      </ScrollView>

      {/* ─── Sticky CTA ──────────────────────────────────────────────────── */}
      <View style={styles.ctaBar}>
        <TouchableOpacity
          style={styles.ctaWrapper}
          onPress={handleBooking}
          activeOpacity={0.88}
        >
          <LinearGradient
            colors={['#00D4FF', '#00B8E0']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.ctaBtn}
          >
            <Ionicons name="ticket-outline" size={20} color="#0A0A0F" />
            <Text style={styles.ctaText}>
              CHỌN GHẾ – {selectedTime} | {cinemaShort}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const HERO_H      = 260;
const DATE_W      = 62;
const DATE_H      = 74;

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0A0A0F' },

  // ── Hero gradient ─────────────────────────────────────────────────────────
  heroWrapper: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    height: HERO_H,
    overflow: 'hidden',
  },
  heroGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  // Wave effect: two overlapping arcs that create the organic curve
  heroWaveContainer: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    height: 80,
  },
  heroWaveFill: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    height: 50,
    backgroundColor: '#0A0A0F',
  },
  heroWaveLeft: {
    position: 'absolute',
    bottom: 20, left: -40,
    width: SCREEN_W * 0.65,
    height: 70,
    backgroundColor: '#0A0A0F',
    borderTopRightRadius: SCREEN_W * 0.5,
  },
  heroWaveRight: {
    position: 'absolute',
    bottom: 0, right: -40,
    width: SCREEN_W * 0.65,
    height: 70,
    backgroundColor: '#0A0A0F',
    borderTopLeftRadius: SCREEN_W * 0.5,
  },

  // ── Floating header ───────────────────────────────────────────────────────
  floatingHeader: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 52,
    paddingHorizontal: 16,
    zIndex: 20,
  },
  headerBtn: {
    width: 36, height: 36,
    justifyContent: 'center', alignItems: 'center',
  },

  // ── Scroll ────────────────────────────────────────────────────────────────
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 20 },
  heroSpacer: { height: HERO_H - 40 },

  // ── Info section ──────────────────────────────────────────────────────────
  infoSection: {
    paddingHorizontal: 20,
    paddingBottom: 8,
  },

  // Title
  titleLine1: {
    color: '#FFFFFF',
    fontSize: 36,
    fontWeight: '900',
    lineHeight: 40,
  },
  titleLine2: {
    color: '#FFFFFF',
    fontSize: 36,
    fontWeight: '900',
    lineHeight: 42,
    marginBottom: 16,
  },

  // Genre tags
  genreRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  genreTag: {
    borderWidth: 1,
    borderColor: '#3A3A3A',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  genreTagText: { color: '#CCCCCC', fontSize: 13, fontWeight: '500' },

  // Age rating
  ageRow: { marginBottom: 14 },
  ageBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderWidth: 1.5,
    borderColor: '#FF6B35',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  ageText: { color: '#FF6B35', fontSize: 13, fontWeight: '700' },

  // Meta row
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 16,
  },
  metaText: { color: '#DDDDDD', fontSize: 15, fontWeight: '600' },
  metaDot: {
    width: 4, height: 4,
    borderRadius: 2,
    backgroundColor: '#444',
    marginHorizontal: 4,
  },

  // Description
  desc: {
    color: '#888',
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 4,
  },
  seeMore: {
    color: '#00D4FF',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },

  // ── Section ───────────────────────────────────────────────────────────────
  section: {
    paddingHorizontal: 20,
    marginTop: 24,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 16,
  },

  // ── Date pills ────────────────────────────────────────────────────────────
  dateRow: { gap: 10, paddingRight: 4 },
  datePill: {
    width: DATE_W,
    height: DATE_H,
    borderRadius: 14,
    backgroundColor: '#141420',
    borderWidth: 1,
    borderColor: '#2A2A3E',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  datePillActive: {
    backgroundColor: '#00D4FF',
    borderColor: '#00D4FF',
    shadowColor: '#00D4FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.55,
    shadowRadius: 10,
    elevation: 6,
  },
  dateDayText: {
    color: '#666',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  dateDayTextActive: { color: '#0A0A0F' },
  dateNumText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '800',
    lineHeight: 28,
  },
  dateNumTextActive: { color: '#0A0A0F' },

  // ── Cinema cards ──────────────────────────────────────────────────────────
  cinemaCard: {
    backgroundColor: '#141420',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#1E1E2E',
  },
  cinemaName: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  cinemaDistRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginBottom: 14,
  },
  cinemaDist: { color: '#666', fontSize: 12 },

  // Times
  timesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  timePill: {
    paddingHorizontal: 20,
    paddingVertical: 9,
    borderRadius: 10,
    backgroundColor: '#1E1E2E',
    borderWidth: 1,
    borderColor: '#2A2A3E',
  },
  timePillActive: {
    backgroundColor: '#00D4FF',
    borderColor: '#00D4FF',
    shadowColor: '#00D4FF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.45,
    shadowRadius: 6,
    elevation: 4,
  },
  timeText: { color: '#CCCCCC', fontSize: 14, fontWeight: '600' },
  timeTextActive: { color: '#0A0A0F', fontWeight: '800' },

  // ── Sticky CTA ────────────────────────────────────────────────────────────
  ctaBar: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    paddingHorizontal: 16,
    paddingBottom: 28,
    paddingTop: 12,
    backgroundColor: 'rgba(10,10,15,0.95)',
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  ctaText: {
    color: '#0A0A0F',
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
});
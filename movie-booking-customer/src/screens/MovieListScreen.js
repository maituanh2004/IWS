import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
  TextInput,
  StatusBar,
  Dimensions,
  Alert,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../context/AuthContext';
import * as api from '../services/api';

const { width: SCREEN_W } = Dimensions.get('window');
const HERO_W = SCREEN_W - 32; // card width with 16px padding each side

// ─── Sample Data ──────────────────────────────────────────────────────────────
const HERO_MOVIES = [
  {
    _id: 'h1',
    title: 'Avengers:',
    titleAccent: 'Doomsday',
    genre: 'ACTION / SCI-FI',
    rating: 9.2,
    desc: 'Một kỷ nguyên mới bắt đầu. Sự trỗi dậy của một mối đe dọa không thể ngăn cản từ đa vũ trụ.',
    gradientColors: ['#2C0A0A', '#8B1A1A', '#1A0505'],
    poster: 'https://via.placeholder.com/400x220/8B1A1A/FFFFFF?text=Avengers',
  },
  {
    _id: 'h2',
    title: 'Lật Mặt 8:',
    titleAccent: 'Vòng Lặp',
    genre: 'HÀI / GIA ĐÌNH',
    rating: 8.5,
    desc: 'Câu chuyện gia đình đầy cảm xúc về những kết nối và tình thân không thể chia cắt.',
    gradientColors: ['#0A1A2C', '#1A4A8B', '#050F1A'],
    poster: 'https://via.placeholder.com/400x220/1A4A8B/FFFFFF?text=Lat+Mat+8',
  },
  {
    _id: 'h3',
    title: 'A Minecraft',
    titleAccent: 'Movie',
    genre: 'PHIÊU LƯU / GIA ĐÌNH',
    rating: 7.8,
    desc: 'Cuộc phiêu lưu kỳ thú trong thế giới khối vuông, nơi mọi giấc mơ đều trở thành hiện thực.',
    gradientColors: ['#0A2C0A', '#1A6B1A', '#051A05'],
    poster: 'https://via.placeholder.com/400x220/1A6B1A/FFFFFF?text=Minecraft',
  },
];

const NOW_PLAYING = [
  {
    _id: '1',
    title: 'Avengers: Doomsday',
    genre: 'Hành động',
    rating: 9.2,
    duration: 150,
    poster: 'https://via.placeholder.com/160x220/8B1A1A/FFFFFF?text=Avengers',
    gradientColors: ['#8B1A1A', '#2C0A0A'],
  },
  {
    _id: '2',
    title: 'Lật Mặt 8',
    genre: 'Hài / Gia đình',
    rating: 8.5,
    duration: 120,
    poster: 'https://via.placeholder.com/160x220/1A4A8B/FFFFFF?text=Lat+Mat',
    gradientColors: ['#1A4A8B', '#0A1A2C'],
  },
  {
    _id: '3',
    title: 'A Minecraft Movie',
    genre: 'Phiêu lưu',
    rating: 7.8,
    duration: 110,
    poster: 'https://via.placeholder.com/160x220/1A6B1A/FFFFFF?text=Minecraft',
    gradientColors: ['#1A6B1A', '#0A2C0A'],
  },
  {
    _id: '4',
    title: 'Sinners',
    genre: 'Kinh dị / Giật gân',
    rating: 8.1,
    duration: 135,
    poster: 'https://via.placeholder.com/160x220/4A0A0A/FFFFFF?text=Sinners',
    gradientColors: ['#4A0A0A', '#1A0505'],
  },
  {
    _id: '5',
    title: 'Mickey 17',
    genre: 'Khoa học viễn tưởng',
    rating: 7.5,
    duration: 138,
    poster: 'https://via.placeholder.com/160x220/0A0A4A/FFFFFF?text=Mickey+17',
    gradientColors: ['#0A0A4A', '#05051A'],
  },
  {
    _id: '6',
    title: 'The Dark Knight',
    genre: 'Hành động / Tội phạm',
    rating: 9.9,
    duration: 152,
    poster: 'https://via.placeholder.com/160x220/1A1A1A/FFFFFF?text=Dark+Knight',
    gradientColors: ['#1A1A2C', '#05050F'],
  },
];

// ─── Bottom Nav Config ─────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { id: 'home',    icon: 'home',        label: 'TRANG CHỦ' },
  { id: 'movies',  icon: 'film',        label: 'PHIM' },
  { id: 'cinemas', icon: 'storefront',  label: 'RẠP' },
  { id: 'tickets', icon: 'ticket',      label: 'VÉ CỦA TÔI' },
  { id: 'profile', icon: 'person',      label: 'TÔI' },
];

// ─── Component ────────────────────────────────────────────────────────────────
export default function MovieListScreen({ navigation }) {
  const { user, signOut } = useAuth();

  const [movies, setMovies]               = useState([]);
  const [filteredMovies, setFilteredMovies] = useState([]);
  const [loading, setLoading]             = useState(false);
  const [searchQuery, setSearchQuery]     = useState('');
  const [isSearchVisible, setIsSearchVisible] = useState(false);

  const [heroIndex, setHeroIndex]         = useState(0);
  const [activeNav, setActiveNav]         = useState('home');

  const heroScrollRef = useRef(null);

  // Fetch movies from API
  useEffect(() => {
    const fetchMovies = async () => {
      setLoading(true);
      try {
        const res = await api.getMovies();
        if (res.data && res.data.success) {
          const apiMovies = res.data.data.map(movie => ({
            ...movie,
            // Map backend fields or provide defaults for UI features
            rating: movie.rating || 8.5,
            gradientColors: movie.gradientColors || ['#1A4A8B', '#0A1A2C'],
            titleAccent: '', // Backend doesn't have titleAccent, can leave empty or split title
          }));
          setMovies(apiMovies);
          setFilteredMovies(apiMovies);
        }
      } catch (error) {
        console.error('Error fetching movies:', error);
        Alert.alert('Lỗi', 'Không thể tải danh sách phim.');
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, []);

  // Search filter
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredMovies(movies);
    } else {
      setFilteredMovies(
        movies.filter((m) =>
          m.title.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    }
  }, [searchQuery, movies]);

  // Hero dot tracker
  const onHeroScroll = (e) => {
    const idx = Math.round(e.nativeEvent.contentOffset.x / HERO_W);
    setHeroIndex(idx);
  };

  const handleNavPress = (navId) => {
    setActiveNav(navId);
    switch (navId) {
      case 'profile': navigation.navigate('Profile'); break;
      case 'tickets': navigation.navigate('BookingHistory'); break;
      default: break;
    }
  };

  const getInitials = (name) =>
    name?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) || 'U';

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00D4FF" />
      </View>
    );
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="#0A0A0F" />

      {/* ── Top Header ── */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBtn}>
          <Ionicons name="menu" size={26} color="#FFFFFF" />
        </TouchableOpacity>

        <Text style={styles.headerLogo}>CINEVIET</Text>

        {/* <View style={styles.headerRight}>
          <TouchableOpacity style={styles.headerBtn}>
            <Ionicons name="search-outline" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.avatarBtn}
            onPress={() => navigation.navigate('Profile')}
          >
            <Text style={styles.avatarText}>{getInitials(user?.name)}</Text>
          </TouchableOpacity>
        </View> */}
        
        <View style={styles.headerRight}>
          <TouchableOpacity 
            style={styles.headerBtn}
            onPress={() => {
              setIsSearchVisible(!isSearchVisible);
              if (isSearchVisible) setSearchQuery(''); // Xóa nội dung tìm kiếm khi đóng
            }}
          >
            <Ionicons 
              name={isSearchVisible ? "close" : "search-outline"} 
              size={24} 
              color="#FFFFFF" 
            />
          </TouchableOpacity>
          {/* Avatar Button giữ nguyên */}
          <TouchableOpacity
            style={styles.avatarBtn}
            onPress={() => navigation.navigate('Profile')}
          >
            <Text style={styles.avatarText}>{getInitials(user?.name)}</Text>
          </TouchableOpacity>
        </View>

      </View>

      {/* ── Search Bar (Ẩn/Hiện) ── */}
      {isSearchVisible && (
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#888" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm kiếm phim, thể loại..."
            placeholderTextColor="#888"
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus={true} // Tự động focus bàn phím khi mở
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="#555" />
            </TouchableOpacity>
          )}
        </View>
      )}

      <ScrollView showsVerticalScrollIndicator={false} style={styles.scroll}>

        {/* ── Location Pill ── */}
        <TouchableOpacity style={styles.locationPill}>
          <Ionicons name="location" size={14} color="#00D4FF" />
          <Text style={styles.locationText}>Hà Nội</Text>
          <Ionicons name="chevron-down" size={14} color="#AAAAAA" />
        </TouchableOpacity>

        {/* ── Hero Carousel ── */}
        <View style={styles.heroSection}>
          <ScrollView
            ref={heroScrollRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={onHeroScroll}
            scrollEventThrottle={16}
            snapToInterval={HERO_W + 0}
            decelerationRate="fast"
            contentContainerStyle={{ paddingHorizontal: 16 }}
          >
            {HERO_MOVIES.map((movie) => (
              <TouchableOpacity
                key={movie._id}
                activeOpacity={0.9}
                style={styles.heroCard}
                onPress={() => navigation.navigate('MovieDetail', { movie })}
              >
                <LinearGradient
                  colors={movie.gradientColors}
                  style={styles.heroGradient}
                  start={{ x: 0.5, y: 0 }}
                  end={{ x: 0.5, y: 1 }}
                >
                  {/* Rating + Genre */}
                  <View style={styles.heroMeta}>
                    <View style={styles.ratingPill}>
                      <Ionicons name="star" size={12} color="#F4C430" />
                      <Text style={styles.ratingPillText}>{movie.rating}</Text>
                    </View>
                    <Text style={styles.heroGenre}>{movie.genre}</Text>
                  </View>

                  {/* Title */}
                  <Text style={styles.heroTitle}>{movie.title}</Text>
                  <Text style={styles.heroTitleAccent}>{movie.titleAccent}</Text>

                  {/* Description */}
                  <Text style={styles.heroDesc} numberOfLines={2}>{movie.desc}</Text>

                  {/* CTA */}
                  <View style={styles.heroBottom}>
                    <TouchableOpacity
                      style={styles.heroCta}
                      onPress={() => navigation.navigate('MovieDetail', { movie })}
                    >
                      <Ionicons name="ticket-outline" size={18} color="#0A0A0F" />
                      <Text style={styles.heroCtaText}>ĐẶT VÉ NGAY</Text>
                    </TouchableOpacity>

                    {/* Dots */}
                    <View style={styles.dotsRow}>
                      {HERO_MOVIES.map((_, i) => (
                        <View
                          key={i}
                          style={[styles.dot, i === heroIndex && styles.dotActive]}
                        />
                      ))}
                    </View>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* ── Đang Chiếu Section ── */}
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            <Text style={styles.sectionIcon}>🎬</Text>
            <Text style={styles.sectionTitle}>Đang Chiếu</Text>
          </View>
          <TouchableOpacity>
            <Text style={styles.seeAll}>Xem tất cả</Text>
          </TouchableOpacity>
        </View>

        {/* Grid movie cards - 3 per row */}
        <View style={styles.movieList}>
          {filteredMovies.length > 0 ? (
            <View style={styles.movieListContent}>
              {filteredMovies.map((movie) => (
                <TouchableOpacity
                  key={movie._id}
                  style={styles.movieCard}
                  onPress={() => navigation.navigate('MovieDetail', { movie })}
                  activeOpacity={0.8}
                >
                  {/* Poster */}
                  <View style={styles.posterWrapper}>
                    <LinearGradient
                      colors={movie.gradientColors}
                      style={styles.posterPlaceholder}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 0, y: 1 }}
                    >
                      <Ionicons name="film-outline" size={32} color="rgba(255,255,255,0.3)" />
                    </LinearGradient>

                    {/* Rating badge */}
                    <View style={styles.ratingBadge}>
                      <Ionicons name="star" size={10} color="#F4C430" />
                      <Text style={styles.ratingBadgeText}>{movie.rating}</Text>
                    </View>
                  </View>

                  {/* Info */}
                  <Text style={styles.movieTitle} numberOfLines={1}>{movie.title}</Text>
                  <Text style={styles.movieGenre} numberOfLines={1}>{movie.genre}</Text>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="film-outline" size={40} color="#333" />
              <Text style={styles.emptyText}>Không tìm thấy phim</Text>
            </View>
          )}
        </View>

        {/* Bottom spacing for nav bar */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* ── Bottom Navigation ── */}
      <View style={styles.bottomNav}>
        {NAV_ITEMS.map((nav) => {
          const active = nav.id === activeNav;
          return (
            <TouchableOpacity
              key={nav.id}
              style={styles.navItem}
              onPress={() => handleNavPress(nav.id)}
            >
              <Ionicons
                name={active ? nav.icon : `${nav.icon}-outline`}
                size={22}
                color={active ? '#00D4FF' : '#555'}
              />
              <Text style={[styles.navLabel, active && styles.navLabelActive]}>
                {nav.label}
              </Text>
            </TouchableOpacity>
          );
        })}
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
  loadingContainer: {
    flex: 1,
    backgroundColor: '#0A0A0F',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scroll: {
    flex: 1,
  },

  // ── Header ──────────────────────────────────────────────────────────────────
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 52,
    paddingBottom: 12,
    backgroundColor: '#0A0A0F',
  },
  headerBtn: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerLogo: {
    color: '#00D4FF',
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 3,
    fontStyle: 'italic',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  avatarBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#1E1E2E',
    borderWidth: 1.5,
    borderColor: '#00D4FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#00D4FF',
    fontSize: 12,
    fontWeight: '700',
  },

  // ── Search Bar ─────────────────────────────────────────────────────────────
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E1E2E',
    marginHorizontal: 16,
    marginBottom: 16,
    paddingHorizontal: 12,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2A2A3E',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 14,
    height: '100%',
  },

  // ── Location ────────────────────────────────────────────────────────────────
  locationPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginHorizontal: 16,
    marginBottom: 16,
    alignSelf: 'flex-start',
    backgroundColor: '#141420',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#2A2A3E',
  },
  locationText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
    marginRight: 2,
  },

  // ── Hero ────────────────────────────────────────────────────────────────────
  heroSection: {
    marginBottom: 28,
  },
  heroCard: {
    width: HERO_W,
    borderRadius: 20,
    overflow: 'hidden',
    marginRight: 0,
  },
  heroGradient: {
    padding: 20,
    paddingTop: 100,
    minHeight: 280,
    justifyContent: 'flex-end',
  },
  heroMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  ratingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  ratingPillText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  heroGenre: {
    color: '#CCCCCC',
    fontSize: 13,
    letterSpacing: 1,
    fontWeight: '500',
  },
  heroTitle: {
    color: '#FFFFFF',
    fontSize: 30,
    fontWeight: '900',
    lineHeight: 34,
  },
  heroTitleAccent: {
    color: '#00D4FF',
    fontSize: 30,
    fontWeight: '900',
    lineHeight: 36,
    marginBottom: 10,
  },
  heroDesc: {
    color: '#AAAAAA',
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 20,
  },
  heroBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  heroCta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#00D4FF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  heroCtaText: {
    color: '#0A0A0F',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 1,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#333',
  },
  dotActive: {
    width: 24,
    backgroundColor: '#00D4FF',
    borderRadius: 4,
  },

  // ── Section Header ──────────────────────────────────────────────────────────
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionIcon: {
    fontSize: 22,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800',
  },
  seeAll: {
    color: '#00D4FF',
    fontSize: 13,
    fontWeight: '600',
  },

  // ── Movie Cards (Grid) ──────────────────────────────────────────────────────
  movieList: {
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  movieListContent: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  movieCard: {
    width: '31%',
  },
  posterWrapper: {
    width: '100%',
    aspectRatio: 0.65,
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 10,
    position: 'relative',
  },
  posterPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ratingBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  ratingBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  movieTitle: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 3,
  },
  movieGenre: {
    color: '#777',
    fontSize: 11,
  },

  // ── Empty State ──────────────────────────────────────────────────────────────
  emptyState: {
    width: SCREEN_W - 32,
    height: 190,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
  emptyText: {
    color: '#555',
    fontSize: 14,
  },

  // ── Bottom Nav ───────────────────────────────────────────────────────────────
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    backgroundColor: '#0F0F18',
    borderTopWidth: 0.5,
    borderTopColor: '#1E1E2E',
    paddingBottom: 24,
    paddingTop: 10,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    gap: 3,
  },
  navLabel: {
    color: '#555',
    fontSize: 8,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  navLabelActive: {
    color: '#00D4FF',
  },
});
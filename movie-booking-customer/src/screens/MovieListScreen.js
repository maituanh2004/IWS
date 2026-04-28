import React, { useEffect, useState, useRef } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    TextInput,
    Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../context/AuthContext';
import * as api from '../services/api';
import ScreenWrapper from '../components/ScreenWrapper';
import MovieCard from '../components/MovieCard';
import BottomNav from '../components/BottomNav';

const { width: SCREEN_W } = Dimensions.get('window');
// HERO_W là chiều rộng thực của thẻ, trừ đi phần padding 2 bên
const HERO_W = SCREEN_W - 32;

const DEFAULT_GRADIENTS = [
    ['#2C0A0A', '#8B1A1A', '#1A0505'],
    ['#0A1A2C', '#1A4A8B', '#050F1A'],
    ['#0A2C0A', '#1A6B1A', '#051A05'],
    ['#2C2C0A', '#8B8B1A', '#1A1A05'],
];

export default function MovieListScreen({ navigation }) {
    const { user } = useAuth();
    const [movies, setMovies] = useState([]);
    const [heroMovies, setHeroMovies] = useState([]);
    const [vouchers, setVouchers] = useState([]);
    const [filteredMovies, setFilteredMovies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearchVisible, setIsSearchVisible] = useState(false);
    const [heroIndex, setHeroIndex] = useState(0);

    const heroScrollRef = useRef(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [moviesRes, discountsRes] = await Promise.all([
                api.getMovies(),
                api.getDiscounts()
            ]);

            if (moviesRes.data.success) {
                const allMovies = moviesRes.data.data.map((m, idx) => ({
                    ...m,
                    gradientColors: DEFAULT_GRADIENTS[idx % DEFAULT_GRADIENTS.length]
                }));
                setMovies(allMovies);
                setFilteredMovies(allMovies);

                // Lấy 3 phim đầu làm banner hero
                setHeroMovies(allMovies.slice(0, 3).map(m => ({
                    ...m,
                    titleAccent: m.title.split(' ').slice(-1)[0],
                    titleBase: m.title.split(' ').slice(0, -1).join(' ') + ' '
                })));
            }

            if (discountsRes.data.success) {
                setVouchers(discountsRes.data.data);
            }
        } catch (error) {
            console.error('Failed to fetch data:', error);
            navigation.navigate('SystemError', { errorType: '500' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const filtered = movies.filter((m) =>
            m.title.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setFilteredMovies(filtered);
    }, [searchQuery, movies]);

    const onHeroScroll = (e) => {
        const idx = Math.round(e.nativeEvent.contentOffset.x / HERO_W);
        setHeroIndex(idx);
    };

    const getInitials = (name) =>
        name?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) || 'CV';

    return (
        <ScreenWrapper>
            {/* ── Header ── */}
            <View className="flex-row items-center justify-between px-4 py-3 bg-[#0A0A0F]">
                <TouchableOpacity className="w-9 h-9 items-center justify-center">
                    <Ionicons name="menu" size={26} color="#FFFFFF" />
                </TouchableOpacity>

                <Text className="text-[#00D4FF] text-xl font-black tracking-[3px] italic">CINEVIET</Text>

                <View className="flex-row items-center gap-2">
                    <TouchableOpacity
                        className="w-9 h-9 items-center justify-center"
                        onPress={() => {
                            setIsSearchVisible(!isSearchVisible);
                            if (isSearchVisible) setSearchQuery('');
                        }}
                    >
                        <Ionicons
                            name={isSearchVisible ? 'close' : 'search-outline'}
                            size={24}
                            color="#FFFFFF"
                        />
                    </TouchableOpacity>
                    <TouchableOpacity
                        className="w-9 h-9 rounded-full bg-[#1E1E2E] border-1.5 border-[#00D4FF] items-center justify-center"
                        onPress={() => navigation.navigate('Profile')}
                    >
                        <Text className="text-[#00D4FF] text-[11px] font-bold">{getInitials(user?.name)}</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* ── Search Bar ── */}
            {isSearchVisible && (
                <View className="flex-row items-center bg-[#1E1E2E] mx-4 mb-4 px-3 h-11 rounded-xl border border-[#2A2A3E]">
                    <Ionicons name="search" size={20} color="#888" />
                    <TextInput
                        className="flex-1 text-white text-sm h-full ml-2"
                        placeholder="Tìm kiếm phim, thể loại..."
                        placeholderTextColor="#888"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        autoFocus
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={() => setSearchQuery('')}>
                            <Ionicons name="close-circle" size={20} color="#555" />
                        </TouchableOpacity>
                    )}
                </View>
            )}

            <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
                {loading ? (
                    <View className="h-64 items-center justify-center">
                        <ActivityIndicator size="large" color="#00D4FF" />
                    </View>
                ) : (
                    /* Toàn bộ nội dung bọc trong Fragment để đảm bảo logic loading */
                    <>
                        {/* ── Location ── */}
                        <TouchableOpacity className="flex-row items-center gap-1.5 mx-4 mb-4 self-start bg-[#141420] px-3 py-2 rounded-full border border-[#2A2A3E]">
                            <Ionicons name="location" size={14} color="#00D4FF" />
                            <Text className="text-white text-xs font-semibold">Hà Nội</Text>
                            <Ionicons name="chevron-down" size={14} color="#AAAAAA" />
                        </TouchableOpacity>

                        {/* ── Hero Carousel ── */}
                        <View className="mb-7">
                            <ScrollView
                                ref={heroScrollRef}
                                horizontal
                                pagingEnabled
                                showsHorizontalScrollIndicator={false}
                                onScroll={onHeroScroll}
                                scrollEventThrottle={16}
                                snapToInterval={HERO_W} // Quan trọng: Khớp với chiều rộng View con
                                decelerationRate="fast"
                                contentContainerStyle={{ paddingHorizontal: 16 }}
                            >
                                {heroMovies.map((movie) => (
                                    <TouchableOpacity
                                        key={movie._id}
                                        activeOpacity={0.9}
                                        onPress={() => navigation.navigate('MovieDetail', { movie })}
                                        style={{ width: HERO_W }}
                                        className="pr-4" // Tạo khoảng cách giữa các slide
                                    >
                                        <View className="rounded-3xl overflow-hidden">
                                            <LinearGradient
                                                colors={movie.gradientColors}
                                                className="px-5 pt-24 pb-5 min-h-[280px] justify-end"
                                                start={{ x: 0.5, y: 0 }}
                                                end={{ x: 0.5, y: 1 }}
                                            >
                                                <View className="flex-row items-center gap-2.5 mb-2">
                                                    <View className="flex-row items-center gap-1 bg-black/50 px-2.5 py-1 rounded-full">
                                                        <Ionicons name="star" size={12} color="#F4C430" />
                                                        <Text className="text-white text-[13px] font-bold">{movie.rating || 9.0}</Text>
                                                    </View>
                                                    <Text className="text-gray-300 text-[13px] tracking-widest font-medium uppercase">{movie.genre}</Text>
                                                </View>

                                                <Text className="text-white text-3xl font-black leading-9">{movie.titleBase}</Text>
                                                <Text className="text-[#00D4FF] text-3xl font-black leading-9 mb-2.5">{movie.titleAccent}</Text>

                                                <Text className="text-gray-400 text-xs leading-5 mb-5" numberOfLines={2}>
                                                    {movie.description}
                                                </Text>

                                                <View className="flex-row items-center justify-between">
                                                    <View className="flex-row items-center gap-2 bg-[#00D4FF] px-5 py-3 rounded-xl">
                                                        <Ionicons name="ticket-outline" size={18} color="#0A0A0F" />
                                                        <Text className="text-[#0A0A0F] text-[13px] font-extrabold tracking-widest">ĐẶT VÉ NGAY</Text>
                                                    </View>

                                                    <View className="flex-row gap-1.5">
                                                        {heroMovies.map((_, i) => (
                                                            <View
                                                                key={i}
                                                                className={`h-2 rounded-full ${i === heroIndex ? 'w-6 bg-[#00D4FF]' : 'w-2 bg-[#333]'}`}
                                                            />
                                                        ))}
                                                    </View>
                                                </View>
                                            </LinearGradient>
                                        </View>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>

                        {/* ── Voucher Section ── */}
                        {vouchers.length > 0 && (
                            <View className="mb-7 px-4">
                                <View className="flex-row items-center gap-2 mb-4">
                                    <Text className="text-xl">🎟️</Text>
                                    <Text className="text-white text-lg font-extrabold">Ưu đãi độc quyền</Text>
                                </View>
                                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                    {vouchers.map((voucher) => (
                                        <TouchableOpacity
                                            key={voucher._id}
                                            className="bg-[#141420] border border-[#1E1E2E] rounded-2xl p-4 mr-3 w-64"
                                            activeOpacity={0.8}
                                        >
                                            <View className="flex-row items-center gap-3 mb-2">
                                                <View className="w-10 h-10 bg-[#00D4FF15] rounded-full items-center justify-center">
                                                    <Ionicons name="pricetag" size={20} color="#00D4FF" />
                                                </View>
                                                <View className="flex-1">
                                                    <Text className="text-white text-sm font-bold" numberOfLines={1}>{voucher.code}</Text>
                                                    <Text className="text-[#4CAF50] text-xs font-bold">Giảm {voucher.discountPercentage}%</Text>
                                                </View>
                                            </View>
                                            <Text className="text-gray-500 text-[10px] leading-4" numberOfLines={2}>
                                                {voucher.description || 'Áp dụng cho tất cả các suất chiếu tại CineViet.'}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </ScrollView>
                            </View>
                        )}

                        {/* ── Danh sách phim chính ── */}
                        <View className="flex-row items-center justify-between px-4 mb-4">
                            <View className="flex-row items-center gap-2">
                                <Text className="text-xl">🎬</Text>
                                <Text className="text-white text-xl font-extrabold">Đang Chiếu</Text>
                            </View>
                            <TouchableOpacity>
                                <Text className="text-[#00D4FF] text-xs font-semibold">Xem tất cả</Text>
                            </TouchableOpacity>
                        </View>

                        <View className="px-4 mb-3">
                            <View className="flex-row flex-wrap justify-between">
                                {filteredMovies.map((movie) => (
                                    <MovieCard
                                        key={movie._id}
                                        movie={movie}
                                        onPress={() => navigation.navigate('MovieDetail', { movie })}
                                    />
                                ))}
                            </View>
                            {filteredMovies.length === 0 && (
                                <View className="w-full h-48 items-center justify-center gap-2">
                                    <Ionicons name="film-outline" size={40} color="#333" />
                                    <Text className="text-gray-500 text-sm">Không tìm thấy phim</Text>
                                </View>
                            )}
                        </View>
                    </>
                )}
                <View className="h-24" />
            </ScrollView>

            <BottomNav />
        </ScreenWrapper>
    );
}
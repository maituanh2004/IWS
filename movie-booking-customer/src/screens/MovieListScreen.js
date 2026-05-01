import React, { useEffect, useState, useRef } from 'react';
import {
    View,
    Text,
    ScrollView,
    Image,
    TouchableOpacity,
    ActivityIndicator,
    Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../context/AuthContext';
import { useUI } from '../context/UIContext';
import * as api from '../services/api';
import ScreenWrapper from '../components/ScreenWrapper';
import MovieCard from '../components/MovieCard';
import BottomNav from '../components/BottomNav';

const { width: SCREEN_W } = Dimensions.get('window');
const CARD_GAP = 16;
const CARD_W = SCREEN_W - 48;

const DEFAULT_GRADIENTS = [
    ['#2C0A0A', '#8B1A1A', '#1A0505'],
    ['#0A1A2C', '#1A4A8B', '#050F1A'],
    ['#0A2C0A', '#1A6B1A', '#051A05'],
    ['#2C2C0A', '#8B8B1A', '#1A1A05'],
];

export default function MovieListScreen({ navigation }) {
    const { user } = useAuth();
    const { t, colors } = useUI();
    const [movies, setMovies] = useState([]);
    const [heroMovies, setHeroMovies] = useState([]);
    const [discounts, setDiscounts] = useState([]);
    const [filteredMovies, setFilteredMovies] = useState([]);
    const [loading, setLoading] = useState(false);
    const [heroIndex, setHeroIndex] = useState(0);
    const heroScrollRef = useRef(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeNav, setActiveNav] = useState('home');

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        setFilteredMovies(movies);
    }, [movies]);

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

                if (allMovies && allMovies.length > 0) {
                    setHeroMovies(allMovies.slice(0, 3).map(m => ({
                        ...m,
                        titleAccent: (m.title || '').split(' ').slice(-1)[0],
                        titleBase: (m.title || '').split(' ').slice(0, -1).join(' ') + ' '
                    })));
                }
            }

            if (discountsRes.data.success) {
                setDiscounts(discountsRes.data.data);
            }
        } catch (error) {
            console.error('Failed to fetch data:', error);
        } finally {
            setLoading(false);
        }
    }
    
    useEffect(() => {
        const filtered = movies.filter((m) =>
            m.title.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setFilteredMovies(filtered);
    }, [searchQuery, movies]);

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


    const onHeroScroll = (e) => {
        const idx = Math.round(e.nativeEvent.contentOffset.x / (CARD_W + CARD_GAP));
        setHeroIndex(idx);
    };

    // const getInitials = (name) =>
    //     (name || '').split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) || 'CV';

    return (
        <ScreenWrapper>
            {/* ── Header ── */}
            <View className={`flex-row items-center justify-between px-4 py-3 ${colors.headerBg}`}>
                <View className="w-9" />
                <Text className="text-[#00D4FF] text-xl font-black tracking-[3px] italic">CINEVIET</Text>
                <TouchableOpacity
                    className="w-9 h-9 rounded-full bg-[#1E1E2E] border-1.5 border-[#00D4FF] items-center justify-center"
                    onPress={() => navigation.navigate('Profile')}
                >
                    <Text className="text-[#00D4FF] text-[11px] font-bold">{getInitials(user?.name)}</Text>
                </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
                {loading ? (
                    <View className="h-64 items-center justify-center">
                        <ActivityIndicator size="large" color="#00D4FF" />
                    </View>
                ) : (
                    <>
                        {/* ── Hero Carousel ── */}
                        {heroMovies.length > 0 && (
                            <View className="mb-7">
                                <ScrollView
                                    ref={heroScrollRef}
                                    horizontal
                                    showsHorizontalScrollIndicator={false}
                                    onScroll={onHeroScroll}
                                    scrollEventThrottle={16}
                                    snapToOffsets={heroMovies.map((_, i) => i * (CARD_W + CARD_GAP))}
                                    decelerationRate="fast"
                                    contentContainerStyle={{ paddingLeft: 16, paddingRight: SCREEN_W - CARD_W - 16 }}
                                >
                                    {heroMovies.map((movie, idx) => (
                                        <TouchableOpacity
                                            key={movie._id}
                                            activeOpacity={0.9}
                                            onPress={() => navigation.navigate('MovieDetail', { movie })}
                                            style={{
                                                width: CARD_W,
                                                marginRight: CARD_GAP,
                                            }}
                                        >
                                            <View className="rounded-3xl overflow-hidden" style={{ minHeight: 280 }}>
                                                {/* Movie poster as background */}
                                                {movie.poster ? (
                                                    <Image
                                                        source={{ uri: movie.poster }}
                                                        className="absolute w-full h-full"
                                                        resizeMode="cover"
                                                    />
                                                ) : null}

                                                {/* Dark gradient overlay */}
                                                <LinearGradient
                                                    colors={movie.poster
                                                        ? ['transparent', 'rgba(0,0,0,0.3)', 'rgba(0,0,0,0.85)', 'rgba(0,0,0,0.95)']
                                                        : movie.gradientColors
                                                    }
                                                    className="px-5 pt-24 pb-5 min-h-[280px] justify-end"
                                                    start={{ x: 0.5, y: 0 }}
                                                    end={{ x: 0.5, y: 1 }}
                                                >
                                                    <View className="flex-row items-center gap-2.5 mb-2">
                                                        <View className="flex-row items-center gap-1 bg-black/60 px-2.5 py-1 rounded-full">
                                                            <Ionicons name="star" size={12} color="#F4C430" />
                                                            <Text className="text-white text-[13px] font-bold">{movie.rating || 9.0}</Text>
                                                        </View>
                                                        <Text className="text-gray-200 text-[13px] tracking-widest font-medium uppercase">{movie.genre}</Text>
                                                    </View>

                                                    <Text className="text-white text-3xl font-black leading-9">{movie.titleBase}</Text>
                                                    <Text className="text-[#00D4FF] text-3xl font-black leading-9 mb-2.5">{movie.titleAccent}</Text>

                                                    <Text className="text-gray-300 text-xs leading-5 mb-5" numberOfLines={2}>
                                                        {movie.description}
                                                    </Text>

                                                    <View className="flex-row items-center justify-between">
                                                        <View className="flex-row items-center gap-2 bg-[#00D4FF] px-5 py-3 rounded-xl">
                                                            <Ionicons name="ticket-outline" size={18} color="#0A0A0F" />
                                                            <Text className="text-[#0A0A0F] text-[13px] font-extrabold tracking-widest">{t('book_now')}</Text>
                                                        </View>

                                                        <View className="flex-row gap-1.5">
                                                            {heroMovies.map((_, i) => (
                                                                <View
                                                                    key={i}
                                                                    className={`h-2 rounded-full ${i === heroIndex ? 'w-6 bg-[#00D4FF]' : 'w-2 bg-white/30'}`}
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
                        )}

                        {/* ── Discount Section ── */}
                        {discounts.length > 0 && (
                            <View className="mb-7 px-4">
                                <View className="flex-row items-center gap-2 mb-4">
                                    <Text className="text-xl">🎟️</Text>
                                    <Text className={`${colors.text} text-lg font-extrabold`}>{t('exclusive_offers')}</Text>
                                </View>
                                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                    {discounts.map((discount) => (
                                        <TouchableOpacity
                                            key={discount._id}
                                            className={`${colors.card} border ${colors.border} rounded-2xl p-4 mr-3 w-64`}
                                            activeOpacity={0.8}
                                        >
                                            <View className="flex-row items-center gap-3 mb-2">
                                                <View className="w-10 h-10 bg-[#00D4FF15] rounded-full items-center justify-center">
                                                    <Ionicons name="pricetag" size={20} color="#00D4FF" />
                                                </View>
                                                <View className="flex-1">
                                                    <Text className={`${colors.text} text-sm font-bold`} numberOfLines={1}>{discount.code}</Text>
                                                    <Text className="text-[#4CAF50] text-xs font-bold">{t('save')} {discount.percentage}%</Text>
                                                </View>
                                            </View>
                                            <Text className="text-gray-500 text-[10px] leading-4" numberOfLines={2}>
                                                {discount.description || 'Applicable to all screenings at CineViet.'}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </ScrollView>
                            </View>
                        )}

                        {/* ── Main Movie List ── */}
                        <View className="flex-row items-center justify-between px-4 mb-4">
                            <View className="flex-row items-center gap-2">
                                <Text className="text-xl">🎬</Text>
                                <Text className={`${colors.text} text-xl font-extrabold`}>{t('now_showing')}</Text>
                            </View>
                            <TouchableOpacity>
                                <Text className="text-[#00D4FF] text-xs font-semibold">{t('see_all')}</Text>
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
                                    <Text className="text-gray-500 text-sm">No movies found</Text>
                                </View>
                            )}
                        </View>
                    </>
                )}
                <View className="h-20" />
            </ScrollView>

            <BottomNav />
        </ScreenWrapper>
    );
}
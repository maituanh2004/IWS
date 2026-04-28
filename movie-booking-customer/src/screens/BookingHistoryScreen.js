/**
 * BookingHistoryScreen.js
 *
 * Requires:
 *   npx expo install react-native-qrcode-svg react-native-svg expo-linear-gradient
 */

import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import QRCode from 'react-native-qrcode-svg';
import { useAuth } from '../context/AuthContext';
import * as api from '../services/api';
import ScreenWrapper from '../components/ScreenWrapper';
import Header from '../components/Header';
import BottomNav from '../components/BottomNav';
import TicketCard from '../components/TicketCard';

const { width: SCREEN_W } = Dimensions.get('window');
const formatVND = (n) => n?.toLocaleString('vi-VN') + 'đ';

// ─── Tab config ──────────────────────────────────────────────────────────────
const TABS = [
    { id: 'all', label: 'Tất Cả' },
    { id: 'upcoming', label: 'Sắp Tới' },
    { id: 'watched', label: 'Đã Xem' },
    { id: 'cancelled', label: 'Đã Hủy' },
];

// ─── Demo data ────────────────────────────────────────────────────────────────
const DEMO_BOOKINGS = [
    {
        _id: 'b1',
        status: 'upcoming',
        movie: { title: 'Avengers: Doomsday', genres: ['HÀNH ĐỘNG', 'SCI-FI'], poster: null },
        format: 'IMAX 2D',
        date: '18/04/2025',
        time: '14:00',
        cinema: 'CGV Vincom Bà Triệu',
        room: 'Phòng 5',
        seats: ['A4', 'A5', 'A6'],
        bookingCode: '#CVN-20250418-8821',
        totalPrice: 360000,
    },
    {
        _id: 'b2',
        status: 'watched',
        movie: { title: 'Lật Mặt 8', genres: ['HÀI', 'GIA ĐÌNH'], poster: null },
        format: '2D',
        date: '12/04/2025',
        time: '10:30',
        cinema: 'Lotte Cinema Quận 7',
        room: 'Phòng 3',
        seats: ['B5', 'B6'],
        bookingCode: '#CVN-20250412-5541',
        totalPrice: 240000,
    },
    {
        _id: 'b3',
        status: 'cancelled',
        movie: { title: 'A Minecraft Movie', genres: ['PHIÊU LƯU'], poster: null },
        format: '3D',
        date: '20/04/2025',
        time: '16:00',
        cinema: 'BHD Star Phạm Ngọc Thạch',
        room: 'Phòng 2',
        seats: ['C3', 'C4'],
        bookingCode: '#CVN-20250420-3312',
        totalPrice: 300000,
        refundNote: 'Hoàn tiền vào ví CineViet',
    },
];

// ─── Bottom Nav ───────────────────────────────────────────────────────────────
const NAV_ITEMS = [
    { id: 'home', icon: 'home-outline', label: 'Trang chủ' },
    { id: 'explore', icon: 'compass-outline', label: 'Khám phá' },
    { id: 'tickets', icon: 'ticket-outline', label: 'Vé của tôi' },
    { id: 'profile', icon: 'person-outline', label: 'Cá nhân' },
];

// ─── Status config ────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
    upcoming: { label: 'ĐÃ THANH TOÁN', color: '#4CAF50', bg: '#0D2B0D', accent: '#00D4FF' },
    watched: { label: 'ĐÃ XEM', color: '#A855F7', bg: '#1A0D2B', accent: '#A855F7' },
    cancelled: { label: 'ĐÃ HỦY', color: '#FF4444', bg: '#2B0D0D', accent: '#FF4444' },
};

// ─── QR payload ───────────────────────────────────────────────────────────────
const buildQR = (b) =>
    JSON.stringify({ code: b.bookingCode, movie: b.movie.title, cinema: b.cinema, seats: b.seats });

// ══════════════════════════════════════════════════════════════════════════════
// CARD: UPCOMING (full detail with QR)
// ══════════════════════════════════════════════════════════════════════════════
const UpcomingCard = ({ item, navigation }) => {
    const cfg = STATUS_CONFIG.upcoming;
    return (
        <View style={[styles.card, { borderLeftColor: cfg.accent }]}>

            {/* ── Top section ── */}
            <View style={styles.cardTop}>
                {/* Poster */}
                <View style={styles.posterBox}>
                    {item.movie.poster ? (
                        <Image source={{ uri: item.movie.poster }} style={styles.posterImg} />
                    ) : (
                        <LinearGradient colors={['#5C1010', '#A01010']} style={styles.posterImg}>
                            <Text style={styles.posterEmoji}>🎬</Text>
                        </LinearGradient>
                    )}
                </View>

                {/* Info */}
                <View style={styles.cardInfo}>
                    {/* Status + Format row */}
                    <View style={styles.statusFormatRow}>
                        <View style={[styles.statusBadge, { backgroundColor: cfg.bg }]}>
                            <Text style={[styles.statusText, { color: cfg.color }]}>{cfg.label}</Text>
                        </View>
                        <Text style={styles.formatText}>{item.format}</Text>
                    </View>

                    {/* Title */}
                    <Text style={styles.movieTitle}>{item.movie.title}</Text>

                    {/* Genre tags */}
                    <View style={styles.genreRow}>
                        {item.movie.genres.map((g) => (
                            <View key={g} style={styles.genreTag}>
                                <Text style={styles.genreTagText}>{g}</Text>
                            </View>
                        ))}
                    </View>

                    {/* Date & Time */}
                    <View style={styles.metaRow}>
                        <Ionicons name="calendar-outline" size={13} color="#888" />
                        <Text style={styles.metaText}>{item.date}</Text>
                        <Ionicons name="time-outline" size={13} color="#888" style={{ marginLeft: 8 }} />
                        <Text style={styles.metaText}>{item.time}</Text>
                    </View>

                    {/* Cinema */}
                    <View style={styles.metaRow}>
                        <Ionicons name="location-outline" size={13} color="#888" />
                        <Text style={styles.metaText}>{item.cinema}</Text>
                    </View>
                </View>
            </View>

            {/* ── Dashed divider ── */}
            <View style={styles.dashedDivider}>
                {Array.from({ length: 30 }).map((_, i) => (
                    <View key={i} style={styles.dashSegment} />
                ))}
            </View>

            {/* ── Bottom section ── */}
            <View style={styles.cardBottom}>
                {/* Left: room + seats + code + price */}
                <View style={{ flex: 1 }}>
                    <Text style={styles.bottomLabel}>PHÒNG CHIẾU / GHẾ</Text>
                    <Text style={styles.bottomValue}>
                        {item.room} — {item.seats.join(', ')}
                    </Text>

                    <Text style={[styles.bottomLabel, { marginTop: 10 }]}>MÃ ĐẶT VÉ</Text>
                    <View style={styles.codeAndPrice}>
                        <Text style={styles.bookingCode}>{item.bookingCode}</Text>
                        <Text style={styles.priceText}>{formatVND(item.totalPrice)}</Text>
                    </View>
                </View>

                {/* Right: QR */}
                <View style={styles.qrBox}>
                    <QRCode
                        value={buildQR(item)}
                        size={72}
                        backgroundColor="#FFFFFF"
                        color="#0A0A0F"
                        ecl="H"
                    />
                </View>
            </View>

            {/* ── Action buttons ── */}
            <View style={styles.actionRow}>
                <TouchableOpacity
                    style={styles.actionBtnPrimary}
                    onPress={() => Alert.alert('Tải vé', 'Đang tải vé PDF...')}
                >
                    <Ionicons name="download-outline" size={16} color="#0A0A0F" />
                    <Text style={styles.actionBtnPrimaryText}>Tải Vé</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.actionBtnIcon}
                    onPress={() => Alert.alert('Chia sẻ', 'Đang mở tùy chọn chia sẻ...')}
                >
                    <Ionicons name="share-social-outline" size={18} color="#AAAAAA" />
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.actionBtnIcon}
                    onPress={() => Alert.alert('Nhắc nhở', 'Đã bật nhắc nhở trước 1 giờ chiếu.')}
                >
                    <Ionicons name="notifications-outline" size={18} color="#AAAAAA" />
                </TouchableOpacity>
            </View>
        </View>
    );
};

// ══════════════════════════════════════════════════════════════════════════════
// CARD: WATCHED (compact)
// ══════════════════════════════════════════════════════════════════════════════
const WatchedCard = ({ item, navigation }) => {
    const cfg = STATUS_CONFIG.watched;
    return (
        <View style={[styles.card, styles.cardCompact, { borderLeftColor: cfg.accent }]}>
            {/* Poster */}
            <View style={styles.posterBoxSm}>
                {item.movie.poster ? (
                    <Image source={{ uri: item.movie.poster }} style={styles.posterImgSm} />
                ) : (
                    <LinearGradient colors={['#1A3A6C', '#0A1A4A']} style={styles.posterImgSm}>
                        <Text style={styles.posterEmoji}>🎬</Text>
                    </LinearGradient>
                )}
            </View>

            <View style={{ flex: 1 }}>
                <View style={[styles.statusBadge, { backgroundColor: cfg.bg, alignSelf: 'flex-start', marginBottom: 6 }]}>
                    <Text style={[styles.statusText, { color: cfg.color }]}>{cfg.label}</Text>
                </View>
                <Text style={styles.movieTitle}>{item.movie.title}</Text>
                <Text style={styles.compactMeta}>
                    {item.date} • {item.cinema}
                </Text>

                {/* Actions */}
                <View style={styles.compactActions}>
                    <TouchableOpacity
                        style={styles.rateBtn}
                        onPress={() => Alert.alert('Đánh giá', 'Tính năng sắp ra mắt!')}
                    >
                        <Ionicons name="star" size={14} color="#0A0A0F" />
                        <Text style={styles.rateBtnText}>Đánh Giá</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.rebookBtn}
                        onPress={() => navigation.navigate('Movies')}
                    >
                        <Ionicons name="refresh-outline" size={14} color="#DDDDDD" />
                        <Text style={styles.rebookBtnText}>Đặt Lại</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
};

// ══════════════════════════════════════════════════════════════════════════════
// CARD: CANCELLED (faded)
// ══════════════════════════════════════════════════════════════════════════════
const CancelledCard = ({ item }) => {
    const cfg = STATUS_CONFIG.cancelled;
    return (
        <View style={[styles.card, styles.cardCompact, styles.cardFaded, { borderLeftColor: cfg.accent }]}>
            {/* Poster */}
            <View style={styles.posterBoxSm}>
                {item.movie.poster ? (
                    <Image source={{ uri: item.movie.poster }} style={[styles.posterImgSm, { opacity: 0.5 }]} />
                ) : (
                    <LinearGradient colors={['#2A2A2A', '#1A1A1A']} style={styles.posterImgSm}>
                        <Text style={styles.posterEmoji}>🎬</Text>
                    </LinearGradient>
                )}
            </View>

            <View style={{ flex: 1 }}>
                <View style={[styles.statusBadge, { backgroundColor: cfg.bg, alignSelf: 'flex-start', marginBottom: 6 }]}>
                    <Text style={[styles.statusText, { color: cfg.color }]}>{cfg.label}</Text>
                </View>
                <Text style={[styles.movieTitle, { opacity: 0.7 }]}>{item.movie.title}</Text>
                {item.refundNote && (
                    <Text style={styles.refundNote}>{item.refundNote}</Text>
                )}

                <TouchableOpacity
                    style={styles.supportBtn}
                    onPress={() => Alert.alert('Hỗ trợ', 'Đang kết nối với bộ phận hỗ trợ...')}
                >
                    <Ionicons name="headset-outline" size={14} color="#888" />
                    <Text style={styles.supportBtnText}>Liên Hệ Hỗ Trợ</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

// ══════════════════════════════════════════════════════════════════════════════
// MAIN SCREEN
// ══════════════════════════════════════════════════════════════════════════════
export default function BookingHistoryScreen({ navigation }) {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('upcoming');
    const [bookings, setBookings] = useState(DEMO_BOOKINGS);
    const [loading, setLoading] = useState(false);

    // Load from API (falls back to demo data)
    useEffect(() => {
        const fetchBookings = async () => {
            setLoading(true);
            try {
                const res = await api.getUserBookings(user?.id);
                const apiBookings = res.data; // It's an array directly

                if (apiBookings && Array.isArray(apiBookings)) {
                    const mappedBookings = apiBookings.map(b => {
                        const startTime = new Date(b.showtime?.startTime);
                        const isPast = startTime < new Date();

                        let status = 'upcoming';
                        if (b.status === 'CANCELLED') status = 'cancelled';
                        else if (isPast) status = 'watched';

                        return {
                            _id: b._id,
                            status: status,
                            movie: {
                                title: b.showtime?.movie?.title || 'Unknown Movie',
                                genres: (b.showtime?.movie?.genre || '').split(',').map(g => g.trim().toUpperCase()),
                                poster: b.showtime?.movie?.poster
                            },
                            format: '2D', // Default
                            date: startTime.toLocaleDateString('vi-VN'),
                            time: startTime.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
                            cinema: b.showtime?.cinema || 'Rạp CineViet',
                            room: b.showtime?.room || 'Phòng 1',
                            seats: b.seats || [],
                            bookingCode: b._id.slice(-8).toUpperCase(),
                            totalPrice: b.totalPrice || 0
                        };
                    });
                    setBookings(mappedBookings);
                }
            } catch (error) {
                console.error('Error fetching bookings:', error);
            } finally {
                setLoading(false);
            }
        };

        if (user?.id) fetchBookings();
    }, [user?.id]);

    // Filter by tab
    const filtered = bookings.filter((b) =>
        activeTab === 'all' ? true : b.status === activeTab
    );

    const renderCard = ({ item }) => {
        if (item.status === 'upcoming') return <UpcomingCard item={item} navigation={navigation} />;
        if (item.status === 'watched') return <WatchedCard item={item} navigation={navigation} />;
        if (item.status === 'cancelled') return <CancelledCard item={item} />;
        return null;
    };

    const EmptyState = () => (
        <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🎟️</Text>
            <Text style={styles.emptyTitle}>Chưa có vé nào</Text>
            <Text style={styles.emptySub}>Đặt vé ngay để trải nghiệm điện ảnh đỉnh cao!</Text>
            <TouchableOpacity
                style={styles.emptyCtaWrapper}
                onPress={() => navigation.navigate('Movies')}
            >
                <LinearGradient
                    colors={['#00D4FF', '#6C3483']}
                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                    style={styles.emptyCta}
                >
                    <Text style={styles.emptyCtaText}>🎬  Khám Phá Phim Ngay</Text>
                </LinearGradient>
            </TouchableOpacity>
        </View>
    );

    return (
        <View style={styles.root}>
            <StatusBar barStyle="light-content" backgroundColor="#0A0A0F" />

            {/* ── Header ── */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={22} color="#00D4FF" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Lịch sử đặt vé</Text>
                <TouchableOpacity style={styles.headerBtn}>
                    <Ionicons name="options-outline" size={22} color="#00D4FF" />
                </TouchableOpacity>
            </View>

            {/* ── Tab Bar ── */}
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.tabBar}
                style={styles.tabBarScroll}
            >
                {TABS.map((tab) => {
                    const active = tab.id === activeTab;
                    return (
                        <TouchableOpacity
                            key={tab.id}
                            style={[styles.tab, active && styles.tabActive]}
                            onPress={() => setActiveTab(tab.id)}
                            activeOpacity={0.7}
                        >
                            <Text style={[styles.tabText, active && styles.tabTextActive]}>
                                {tab.label}
                                {active ? '  ✓' : ''}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>

            {/* ── Content ── */}
            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#00D4FF" />
                </View>
            ) : (
                <FlatList
                    data={filtered}
                    keyExtractor={(item) => item._id}
                    renderItem={renderCard}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={<EmptyState />}
                    showsVerticalScrollIndicator={false}
                />
            )}

            {/* ── Bottom Nav ── */}
            <View style={styles.bottomNav}>
                {NAV_ITEMS.map((nav) => {
                    const active = nav.id === 'tickets';
                    return (
                        <TouchableOpacity
                            key={nav.id}
                            style={styles.navItem}
                            onPress={() => {
                                if (nav.id === 'home') navigation.navigate('MovieList');
                                if (nav.id === 'profile') navigation.navigate('Profile');
                            }}
                        >
                            <Ionicons
                                name={active ? nav.icon.replace('-outline', '') : nav.icon}
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
    root: { flex: 1, backgroundColor: '#0A0A0F' },

    // ── Header ──────────────────────────────────────────────────────────────────
    header: {
        flexDirection: 'row', alignItems: 'center',
        paddingTop: 52, paddingBottom: 14, paddingHorizontal: 16,
        backgroundColor: '#0A0A0F',
    },
    headerBtn: { width: 36, height: 36, justifyContent: 'center', alignItems: 'center' },
    headerTitle: { flex: 1, color: '#FFFFFF', fontSize: 20, fontWeight: '800' },

    // ── Tabs ────────────────────────────────────────────────────────────────────
    tabBarScroll: { maxHeight: 56, flexGrow: 0 },
    tabBar: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        gap: 10,
        alignItems: 'center',
    },
    tab: {
        paddingHorizontal: 18,
        paddingVertical: 8,
        borderRadius: 24,
        backgroundColor: '#141420',
        borderWidth: 1,
        borderColor: '#2A2A3E',
    },
    tabActive: {
        backgroundColor: '#00D4FF',
        borderColor: '#00D4FF',
    },
    tabText: { color: '#888', fontSize: 14, fontWeight: '600' },
    tabTextActive: { color: '#0A0A0F', fontWeight: '800' },

    // ── List ────────────────────────────────────────────────────────────────────
    listContent: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 100 },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },

    // ── Card base ───────────────────────────────────────────────────────────────
    card: {
        backgroundColor: '#141420',
        borderRadius: 16,
        marginBottom: 16,
        overflow: 'hidden',
        borderLeftWidth: 4,
        borderLeftColor: '#00D4FF',
    },
    cardCompact: {},
    cardFaded: { opacity: 0.75 },

    // ── Card Top ────────────────────────────────────────────────────────────────
    cardTop: {
        flexDirection: 'row',
        gap: 12,
        padding: 14,
    },
    posterBox: {
        width: 100,
        height: 140,
        borderRadius: 10,
        overflow: 'hidden',
    },
    posterImg: {
        width: '100%', height: '100%',
        justifyContent: 'center', alignItems: 'center',
    },
    posterEmoji: { fontSize: 28, opacity: 0.6 },

    cardInfo: { flex: 1, gap: 6 },

    // Status + format
    statusFormatRow: {
        flexDirection: 'row', alignItems: 'center',
        justifyContent: 'space-between',
    },
    statusBadge: {
        paddingHorizontal: 10, paddingVertical: 4,
        borderRadius: 6,
    },
    statusText: { fontSize: 11, fontWeight: '800', letterSpacing: 0.5 },
    formatText: { color: '#F4C430', fontSize: 12, fontWeight: '700' },

    movieTitle: { color: '#FFFFFF', fontSize: 18, fontWeight: '800', lineHeight: 22 },

    genreRow: { flexDirection: 'row', gap: 6 },
    genreTag: {
        borderWidth: 1, borderColor: '#333',
        borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3,
    },
    genreTagText: { color: '#888', fontSize: 10, fontWeight: '700', letterSpacing: 0.5 },

    metaRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
    metaText: { color: '#999', fontSize: 12 },

    // ── Dashed divider ──────────────────────────────────────────────────────────
    dashedDivider: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 14,
        gap: 4,
        marginBottom: 2,
    },
    dashSegment: { flex: 1, height: 1, backgroundColor: '#2A2A3E' },

    // ── Card Bottom ─────────────────────────────────────────────────────────────
    cardBottom: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 14,
        padding: 14,
        paddingTop: 10,
    },
    bottomLabel: {
        color: '#666', fontSize: 10,
        fontWeight: '700', letterSpacing: 1,
        marginBottom: 4,
    },
    bottomValue: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },

    codeAndPrice: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 4,
    },
    bookingCode: { color: '#888', fontSize: 12, fontFamily: 'monospace' },
    priceText: { color: '#00D4FF', fontSize: 18, fontWeight: '900' },

    qrBox: {
        backgroundColor: '#FFFFFF',
        padding: 6, borderRadius: 10,
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2, shadowRadius: 4, elevation: 4,
    },

    // ── Action buttons (upcoming) ────────────────────────────────────────────────
    actionRow: {
        flexDirection: 'row',
        gap: 10,
        padding: 14,
        paddingTop: 0,
        alignItems: 'center',
    },
    actionBtnPrimary: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        backgroundColor: '#00D4FF',
        height: 44,
        borderRadius: 12,
    },
    actionBtnPrimaryText: { color: '#0A0A0F', fontSize: 14, fontWeight: '800' },
    actionBtnIcon: {
        width: 44, height: 44,
        backgroundColor: '#1E1E2E',
        borderRadius: 12,
        justifyContent: 'center', alignItems: 'center',
    },

    // ── Compact card (watched / cancelled) ──────────────────────────────────────
    posterBoxSm: {
        width: 80, height: 100,
        borderRadius: 10, overflow: 'hidden',
        margin: 14, marginRight: 0,
    },
    posterImgSm: {
        width: '100%', height: '100%',
        justifyContent: 'center', alignItems: 'center',
    },
    compactMeta: { color: '#777', fontSize: 12, marginBottom: 10 },

    compactActions: { flexDirection: 'row', gap: 10 },
    rateBtn: {
        flexDirection: 'row', alignItems: 'center', gap: 6,
        backgroundColor: '#F4C430',
        paddingHorizontal: 14, paddingVertical: 8,
        borderRadius: 10,
    },
    rateBtnText: { color: '#0A0A0F', fontSize: 13, fontWeight: '800' },
    rebookBtn: {
        flexDirection: 'row', alignItems: 'center', gap: 6,
        backgroundColor: '#2A2A3A',
        paddingHorizontal: 14, paddingVertical: 8,
        borderRadius: 10,
    },
    rebookBtnText: { color: '#DDDDDD', fontSize: 13, fontWeight: '700' },

    // Cancelled
    refundNote: { color: '#4CAF50', fontSize: 12, fontStyle: 'italic', marginBottom: 10 },
    supportBtn: {
        flexDirection: 'row', alignItems: 'center', gap: 6,
        borderWidth: 1, borderColor: '#333',
        paddingHorizontal: 14, paddingVertical: 8,
        borderRadius: 10, alignSelf: 'flex-start',
    },
    supportBtnText: { color: '#888', fontSize: 13, fontWeight: '600' },

    // ── Empty state ──────────────────────────────────────────────────────────────
    emptyState: {
        alignItems: 'center', paddingTop: 80, paddingHorizontal: 32, gap: 12,
    },
    emptyIcon: { fontSize: 64, marginBottom: 8 },
    emptyTitle: { color: '#FFFFFF', fontSize: 20, fontWeight: '800' },
    emptySub: { color: '#666', fontSize: 14, textAlign: 'center', lineHeight: 22 },
    emptyCtaWrapper: { borderRadius: 14, overflow: 'hidden', marginTop: 8, width: '100%' },
    emptyCta: { height: 52, justifyContent: 'center', alignItems: 'center' },
    emptyCtaText: { color: '#FFFFFF', fontSize: 15, fontWeight: '800' },

    // ── Bottom Nav ───────────────────────────────────────────────────────────────
    bottomNav: {
        position: 'absolute', bottom: 0, left: 0, right: 0,
        flexDirection: 'row',
        backgroundColor: '#0F0F18',
        borderTopWidth: 0.5, borderTopColor: '#1E1E2E',
        paddingBottom: 24, paddingTop: 10,
    },
    navItem: { flex: 1, alignItems: 'center', gap: 3 },
    navLabel: { color: '#555', fontSize: 10, fontWeight: '600' },
    navLabelActive: { color: '#00D4FF' },
});
const TABS = [
    { id: 'all', label: 'Tất Cả' },
    { id: 'confirmed', label: 'Sắp Tới' },
    { id: 'watched', label: 'Đã Xem' },
    { id: 'cancelled', label: 'Đã Hủy' },
];

const STATUS_CONFIG = {
    confirmed: { label: 'SẮP TỚI', color: '#00D4FF', bg: '#00D4FF15' },
    watched: { label: 'ĐÃ XEM', color: '#A855F7', bg: '#A855F715' },
    cancelled: { label: 'ĐÃ HỦY', color: '#FF4444', bg: '#FF444415' },
};

const formatVND = (n) => n?.toLocaleString('vi-VN') + 'đ';

export default function BookingHistoryScreen({ navigation }) {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('confirmed');
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadBookings();
    }, []);

    const loadBookings = async () => {
        setLoading(true);
        try {
            const res = await api.getUserBookings(user?.id);
            if (res.data.success) {
                setBookings(res.data.data);
            }
        } catch (error) {
            console.error('Failed to load bookings:', error);
        } finally {
            setLoading(false);
        }
    };

    const filtered = bookings.filter((b) =>
        activeTab === 'all' ? true : b.status === activeTab
    );

    const renderCard = ({ item }) => {
        const isUpcoming = item.status === 'confirmed';
        const cfg = STATUS_CONFIG[item.status] || STATUS_CONFIG.confirmed;

        if (isUpcoming) {
            return (
                <View className="px-4 mb-4">
                    <TicketCard
                        movie={item.showtime?.movie}
                        showtime={item.showtime}
                        seats={item.seats}
                        bookingCode={`#${item._id.slice(-8).toUpperCase()}`}
                        cinemaName={`Rạp ${item.showtime?.room}`}
                    />
                </View>
            );
        }

        return (
            <View className={`bg-[#141420] rounded-2xl mx-4 mb-4 p-4 border-l-4 border-[${cfg.color}] flex-row gap-4 items-center`}>
                <View className="w-16 h-22 rounded-lg overflow-hidden bg-gray-800">
                    {item.showtime?.movie?.poster ? (
                        <Image source={{ uri: item.showtime.movie.poster }} className="w-full h-full" />
                    ) : (
                        <View className="flex-1 items-center justify-center bg-gray-700">
                            <Text className="text-xl">🎬</Text>
                        </View>
                    )}
                </View>

                <View className="flex-1 gap-1">
                    <View className={`self-start px-2 py-0.5 rounded-md`} style={{ backgroundColor: cfg.bg }}>
                        <Text className="text-[10px] font-bold" style={{ color: cfg.color }}>{cfg.label}</Text>
                    </View>
                    <Text className="text-white text-base font-bold" numberOfLines={1}>{item.showtime?.movie?.title}</Text>
                    <Text className="text-gray-500 text-[11px]">{new Date(item.showtime?.startTime).toLocaleDateString('vi-VN')} • {formatVND(item.totalPrice)}</Text>

                    <TouchableOpacity
                        className="flex-row items-center gap-1.5 mt-2"
                        onPress={() => navigation.navigate('Movies')}
                    >
                        <Ionicons name="refresh-outline" size={14} color="#00D4FF" />
                        <Text className="text-[#00D4FF] text-xs font-bold">Đặt lại</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    return (
        <ScreenWrapper>
            <Header title="Vé Của Tôi" showBack={false} />

            {/* Tab Bar */}
            <View className="py-4">
                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="px-4">
                    {TABS.map((tab) => {
                        const isActive = tab.id === activeTab;
                        return (
                            <TouchableOpacity
                                key={tab.id}
                                onPress={() => setActiveTab(tab.id)}
                                className={`px-5 py-2.5 rounded-full mr-3 border ${isActive ? 'bg-[#00D4FF] border-[#00D4FF]' : 'bg-[#141420] border-[#2A2A3E]'}`}
                            >
                                <Text className={`text-sm font-bold ${isActive ? 'text-[#0A0A0F]' : 'text-gray-500'}`}>{tab.label}</Text>
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>
            </View>

            {loading ? (
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color="#00D4FF" />
                </View>
            ) : (
                <FlatList
                    data={filtered}
                    keyExtractor={(item) => item._id}
                    renderItem={renderCard}
                    contentContainerStyle={{ paddingBottom: 100 }}
                    ListEmptyComponent={
                        <View className="flex-1 items-center justify-center pt-20 px-8 gap-3">
                            <Text className="text-5xl">🎟️</Text>
                            <Text className="text-white text-xl font-bold">Chưa có vé nào</Text>
                            <Text className="text-gray-500 text-sm text-center leading-5">Đặt vé ngay để trải nghiệm điện ảnh đỉnh cao!</Text>
                            <TouchableOpacity
                                className="mt-4 w-full"
                                onPress={() => navigation.navigate('MovieList')}
                            >
                                <LinearGradient
                                    colors={['#00D4FF', '#6C3483']}
                                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                                    className="h-13 items-center justify-center rounded-xl"
                                >
                                    <Text className="text-white text-sm font-black italic tracking-widest">🎬 KHÁM PHÁ PHIM NGAY</Text>
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>
                    }
                />
            )}

            <BottomNav />
        </ScreenWrapper>
    );
}

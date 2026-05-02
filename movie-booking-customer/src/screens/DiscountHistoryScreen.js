import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    Image,
    Dimensions,
} from 'react-native';
import { 
    Ticket, 
    Tag, 
    Clock, 
    ChevronRight, 
    CreditCard, 
    Calendar,
    CircleCheck,
    History,
    XCircle,
    Info,
    RotateCcw
} from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';
import { useUI } from '../context/UIContext';
import * as api from '../services/api';
import ScreenWrapper from '../components/ScreenWrapper';
import BottomNav from '../components/BottomNav';

const { width } = Dimensions.get('window');

const formatVND = (n) =>
    n ? n.toLocaleString('vi-VN') + 'đ' : '0đ';

export default function DiscountHistoryScreen({ navigation }) {
    const { user } = useAuth();
    const { t, colors, theme } = useUI();
    const [activeTab, setActiveTab] = useState('tickets'); // 'tickets' or 'promos'
    const [statusFilter, setStatusFilter] = useState('all');
    const [bookings, setBookings] = useState([]);
    const [discounts, setDiscounts] = useState([]);
    const [loading, setLoading] = useState(false);

    const STATUS_TABS = [
        { id: 'all', label: t('all') },
        { id: 'confirmed', label: t('upcoming') },
        { id: 'watched', label: t('watched') },
    ];

    useEffect(() => {
        loadData();
    }, [user?._id]);

    const loadData = async () => {
        setLoading(true);
        try {
            const [bookRes, promoRes] = await Promise.all([
                api.getMyBookings(),
                api.getDiscounts()
            ]);
            
            if (bookRes.data.success) {
                setBookings(bookRes.data.data);
            }
            if (promoRes.data.success) {
                setDiscounts(promoRes.data.data);
            }
        } catch (error) {
            console.error('Failed to load history:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredBookings = bookings.filter((b) =>
        statusFilter === 'all' ? true : (b.status || '').toLowerCase() === statusFilter.toLowerCase()
    );

    const renderTicketCard = ({ item }) => {
        const status = (item.status || 'confirmed').toLowerCase();
        const isUpcoming = status === 'confirmed' || status === 'upcoming';
        const isWatched = status === 'watched';

        return (
            <View className={`${colors.card} p-5 rounded-3xl mb-4 border ${colors.border} shadow-lg`}>
                {/* Header: Movie Title & ID */}
                <View className="flex-row items-center justify-between mb-4 pb-3 border-b border-white/5">
                    <View className="flex-1 mr-3">
                        <Text className="text-[#00D4FF] text-[10px] font-bold uppercase tracking-wider mb-1">
                            {item.showtime?.movie?.title || 'Unknown Movie'}
                        </Text>
                        <Text className={`${colors.text} text-lg font-bold tracking-tight`}>
                            {t('room')} {item.showtime?.room || '?' }
                        </Text>
                    </View>
                    <View className="bg-[#00D4FF10] px-2.5 py-1 rounded-lg border border-[#00D4FF20]">
                        <Text className="text-[#00D4FF] font-bold text-[9px] uppercase tracking-tighter">
                            #{String(item._id || '').slice(-8).toUpperCase()}
                        </Text>
                    </View>
                </View>

                {/* Details: Date & Time */}
                <View className="flex-row items-center mb-4 gap-5">
                    <View className="flex-row items-center">
                        <Calendar color="#00D4FF" size={14} />
                        <Text className={`${colors.textSecondary} text-[11px] font-semibold ml-2`}>
                            {item.showtime?.startTime ? new Date(item.showtime.startTime).toLocaleDateString() : 'N/A'}
                        </Text>
                    </View>
                    <View className="flex-row items-center">
                        <Clock color="#00D4FF" size={14} />
                        <Text className={`${colors.textSecondary} text-[11px] font-semibold ml-2`}>
                            {item.showtime?.startTime ? new Date(item.showtime.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '--:--'}
                        </Text>
                    </View>
                </View>

                {/* Seats & Price */}
                <View className="flex-row justify-between items-end mb-5">
                    <View className="flex-1">
                        <Text className={`${colors.textMuted} text-[9px] font-bold uppercase mb-2`}>{t('seats')}</Text>
                        <View className="flex-row flex-wrap gap-1.5">
                            {(item.seats || item.seatNumber || []).map((s, idx) => (
                                <View key={idx} className="bg-[#00D4FF20] px-2 py-0.5 rounded-md border border-[#00D4FF30]">
                                    <Text className="text-[#00D4FF] text-[10px] font-bold">{s}</Text>
                                </View>
                            ))}
                        </View>
                    </View>
                    <View className="items-end">
                        <Text className={`${colors.textMuted} text-[9px] font-bold uppercase mb-1`}>{t('total') || 'Total'}</Text>
                        <Text className={`text-xl font-bold ${colors.text}`}>{formatVND(item.totalPrice)}</Text>
                    </View>
                </View>

                {/* Status Footer */}
                <View className="flex-row justify-between items-center pt-3 border-t border-white/5">
                    <View className="flex-row items-center">
                        <CreditCard color={theme === 'dark' ? "#6b7280" : "#9ca3af"} size={14} />
                        <Text className={`${colors.textSecondary} text-[10px] font-medium ml-2`}>{t('vnpay_paid')}</Text>
                    </View>
                    <View className={`px-3 py-1 rounded-full border ${
                        isUpcoming ? 'bg-[#00D4FF10] border-[#00D4FF20]' : 
                        'bg-purple-900/10 border-purple-500/20'
                    }`}>
                        <View className="flex-row items-center gap-1.5">
                            {isUpcoming && <CircleCheck color="#00D4FF" size={12} />}
                            {isWatched && <History color="#a855f7" size={12} />}
                            <Text className={`font-bold text-[10px] uppercase tracking-tight ${
                                isUpcoming ? 'text-[#00D4FF]' : 'text-purple-400'
                            }`}>
                                {t(status) || status}
                            </Text>
                        </View>
                    </View>
                </View>
            </View>
        );
    };

    const renderPromoCard = ({ item }) => {
        const isExpired = new Date(item.expiryDate) < new Date();
        
        return (
            <TouchableOpacity 
                activeOpacity={0.8}
                className={`${colors.card} p-5 rounded-3xl mb-4 border shadow-md ${isExpired ? 'border-red-500/20' : colors.border}`}
            >
                <View className="flex-row justify-between items-start mb-4">
                    <View className="flex-1">
                        <View className="flex-row items-center mb-2">
                            <Tag color={isExpired ? "#ef4444" : "#00D4FF"} size={20} />
                            <Text className={`text-xl font-bold ml-2 tracking-tight ${isExpired ? 'text-red-500' : colors.text}`}>
                                {item.code}
                            </Text>
                        </View>
                        <View className="flex-row items-center">
                            <Calendar color={theme === 'dark' ? "#6b7280" : "#9ca3af"} size={14} />
                            <Text className={`${colors.textSecondary} text-[11px] font-medium ml-2`}>
                                {t('expires')} {new Date(item.expiryDate).toLocaleDateString()}
                            </Text>
                        </View>
                    </View>
                    <View className={`px-3 py-2 rounded-xl border ${isExpired ? 'bg-red-500/10 border-red-500/20' : 'bg-[#00D4FF10] border-[#00D4FF20]'}`}>
                        <Text className={`font-bold text-lg ${isExpired ? 'text-red-400' : 'text-[#00D4FF]'}`}>
                            -{item.percentage || item.discountPercentage || 0}%
                        </Text>
                    </View>
                </View>
                <View className="pt-3 border-t border-white/5">
                    <Text className={`${colors.textSecondary} text-[11px] leading-4`} numberOfLines={2}>
                        {item.description || t('special_offer_note')}
                    </Text>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <ScreenWrapper bg={colors.background}>
            {/* Header */}
            <View className="flex-row items-center justify-between px-6 pt-12 pb-6">
                <View>
                    <Text className="text-[#00D4FF] text-[11px] font-bold uppercase tracking-widest mb-1">CINEVIET</Text>
                    <Text className={`${colors.text} text-3xl font-bold tracking-tight uppercase`}>{t('my_booking_title')}</Text>
                </View>
                <TouchableOpacity 
                    onPress={loadData}
                    className={`w-11 h-11 rounded-2xl ${colors.card} border ${colors.border} items-center justify-center`}
                >
                    <RotateCcw color="#00D4FF" size={20} />
                </TouchableOpacity>
            </View>

            {/* Main Tabs */}
            <View className="flex-row px-6 mb-8 gap-3">
                <TouchableOpacity 
                    onPress={() => setActiveTab('tickets')}
                    className={`flex-1 flex-row items-center justify-center py-3.5 rounded-2xl border ${activeTab === 'tickets' ? 'bg-[#00D4FF] border-[#00D4FF]' : `${colors.card} ${colors.border}`}`}
                >
                    <Ticket color={activeTab === 'tickets' ? "#0A0A0F" : "#6b7280"} size={18} />
                    <Text className={`ml-2 text-[11px] font-bold uppercase tracking-wide ${activeTab === 'tickets' ? 'text-[#0A0A0F]' : colors.textSecondary}`}>{t('tickets_count')}</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                    onPress={() => setActiveTab('promos')}
                    className={`flex-1 flex-row items-center justify-center py-3.5 rounded-2xl border ${activeTab === 'promos' ? 'bg-[#00D4FF] border-[#00D4FF]' : `${colors.card} ${colors.border}`}`}
                >
                    <Tag color={activeTab === 'promos' ? "#0A0A0F" : "#6b7280"} size={18} />
                    <Text className={`ml-2 text-[11px] font-bold uppercase tracking-wide ${activeTab === 'promos' ? 'text-[#0A0A0F]' : colors.textSecondary}`}>{t('offers')}</Text>
                </TouchableOpacity>
            </View>

            {/* Status Filter for Tickets */}
            {activeTab === 'tickets' && (
                <View className="mb-6">
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 24, gap: 10 }}>
                        {STATUS_TABS.map((tab) => {
                            const active = tab.id === statusFilter;
                            return (
                                <TouchableOpacity
                                    key={tab.id}
                                    onPress={() => setStatusFilter(tab.id)}
                                    className={`px-4 py-1.5 rounded-xl border ${active ? 'bg-[#00D4FF15] border-[#00D4FF30]' : `${colors.card} border-transparent`}`}
                                >
                                    <Text className={`text-[10px] font-bold ${active ? 'text-[#00D4FF]' : colors.textSecondary}`}>
                                        {tab.label}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </ScrollView>
                </View>
            )}

            {/* Content */}
            {loading ? (
                <View className="flex-1 justify-center items-center">
                    <ActivityIndicator size="large" color="#00D4FF" />
                </View>
            ) : (
                <FlatList
                    data={activeTab === 'tickets' ? filteredBookings : discounts}
                    renderItem={activeTab === 'tickets' ? renderTicketCard : renderPromoCard}
                    keyExtractor={(item, idx) => String(item._id || idx)}
                    contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 150 }}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={
                        <View className={`items-center py-20 ${colors.card} rounded-[32px] border ${colors.border} mt-10`}>
                            <Info color={theme === 'dark' ? "#6b7280" : "#9ca3af"} size={44} opacity={0.3} />
                            <Text className={`${colors.textSecondary} font-bold mt-4 uppercase tracking-widest text-[11px]`}>{t('no_tickets_yet')}</Text>
                        </View>
                    }
                />
            )}

            <BottomNav />
        </ScreenWrapper>
    );
}


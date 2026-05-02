import React, { useEffect, useState, useMemo } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
    Alert,
    Dimensions,
} from 'react-native';
import { Armchair, RotateCcw, Info, ChevronLeft, Ticket } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as api from '../services/api';
import ScreenWrapper from '../components/ScreenWrapper';
import Header from '../components/Header';
import { formatCurrency, getDisplaySeatType } from '../utils/bookingUtils';
import { Ionicons } from '@expo/vector-icons';
import { useUI } from '../context/UIContext';

const { width: SCREEN_W } = Dimensions.get('window');

// ─── Component ────────────────────────────────────────────────────────────────
export default function SeatSelectionScreen({ route, navigation }) {
    const { showtime: initialShowtime } = route.params || {};
    const { theme, t } = useUI();
    
    // Theme Colors
    const isDark = theme === 'dark';
    const bgColor = isDark ? 'bg-[#0A0A0F]' : 'bg-[#F8F9FA]';
    const textColor = isDark ? 'text-white' : 'text-[#1A1A2E]';
    const subTextColor = isDark ? 'text-gray-400' : 'text-gray-500';
    const cardBg = isDark ? 'bg-black/40 border-white/10' : 'bg-white border-black/5 shadow-md shadow-black/10';

    const [preview, setPreview] = useState(null);
    const [previewLoading, setPreviewLoading] = useState(false);
    const [showtime, setShowtime] = useState(initialShowtime);
    const [seats, setSeats] = useState([])
    const [selectedSeats, setSelectedSeats] = useState([]);
    const [loading, setLoading] = useState(true);

    const seatMap = useMemo(() => {
        const map = {};
        seats.forEach(s => {
            map[s.code] = s;
        });
        return map;
    }, [seats]);

    useEffect(() => {
        loadData();
    }, [initialShowtime?._id]);

    const fetchPreview = async () => {
        try {
            if (!showtime?._id || !selectedSeats.length) return;
            const payload = {
                showtimeId: showtime._id,
                seats: expandSeats(selectedSeats)
            };
            setPreviewLoading(true);
            const res = await api.previewBooking(payload);
            if (res.data.success) {
                setPreview(res.data.data);
            }
        } catch (err) {
            console.log('Preview error:', err.response?.data || err.message);
        } finally {
            setPreviewLoading(false);
        }
    };

    useEffect(() => {
        if (!selectedSeats.length || !showtime?._id) {
            setPreview(null);
            setPreviewLoading(false);
            return;
        }
        const timer = setTimeout(() => {
            fetchPreview();
        }, 300);
        return () => clearTimeout(timer);
    }, [selectedSeats, showtime?._id]);

    const loadData = async () => {
        if (!initialShowtime?._id) {
            setLoading(false);
            return;
        }
        setLoading(true);
        try {
            const [stRes, seatsRes] = await Promise.all([
                api.getShowtime(initialShowtime._id),
                api.getAvailableSeats(initialShowtime._id)
            ]);
            if (stRes.data.success) setShowtime(stRes.data.data);
            const seatData = seatsRes.data.data?.seats || seatsRes.data.data;
            setSeats(seatData);
        } catch (error) {
            console.error('Failed to load seat data:', error);
            Alert.alert('Error', 'Unable to load seat map. Please try again.');
        } finally {
            setLoading(false);
        }
    };
    
    const layout = useMemo(() => {
        if (!showtime) return { capacity: 80, cols: 10, rows: 8 };
        let capacity = showtime.totalSeats || 80;
        const roomNum = parseInt(showtime.room);
        if (roomNum >= 1 && roomNum <= 5) capacity = 80;
        else if (roomNum >= 6 && roomNum <= 10) capacity = 100;
        const cols = 10;
        const rows = Math.ceil(capacity / cols);
        const startVipRow = Math.floor((rows - 4) / 2);
        const endVipRow = startVipRow + 3;
        return { capacity, cols, rows, startVipRow, endVipRow };
    }, [showtime]);

    const basePrice = showtime?.basePrice || 100000;

    const getSeatType = (r, c) => {
        if (r === layout.rows - 1) return 'COUPLE';
        if (r >= layout.startVipRow && r <= layout.endVipRow && c >= 2 && c <= layout.cols - 3) return 'VIP';
        return 'REGULAR';
    };

    const toggleSeat = (seatId) => {
        if (seatId.includes('-')) {
            const row = seatId[0];
            const [a, b] = seatId.slice(1).split('-');
            const seat1 = seatMap?.[`${row}${a}`];
            const seat2 = seatMap?.[`${row}${b}`];
            if (seat1?.isBooked || seat2?.isBooked) return;
            setSelectedSeats(prev => prev.includes(seatId) ? prev.filter(s => s !== seatId) : [...prev, seatId]);
            return;
        }
        if (seatMap?.[seatId]?.isBooked) return;
        setSelectedSeats(prev => prev.includes(seatId) ? prev.filter(s => s !== seatId) : [...prev, seatId]);
    };

    const expandSeats = (seats) => {
        const result = [];
        seats.forEach(seat => {
            if (seat.includes('-')) {
                const row = seat[0];
                const [a, b] = seat.slice(1).split('-');
                result.push(`${row}${a}`, `${row}${b}`);
            } else {
                result.push(seat);
            }
        });
        return result;
    };

    const handleContinue = () => {
        if (selectedSeats.length === 0) {
            Alert.alert('Notice', 'Please select at least 1 seat');
            return;
        }
        navigation.navigate('BookingConfirmScreen', {
            showtime,
            seats: expandSeats(selectedSeats)
        });
    };

    // 🔥 PRECISE MATH FOR ALIGNMENT
    const ROW_GAP = 4;
    const SEAT_SIZE = (SCREEN_W - 32 - 12 - (ROW_GAP * 13)) / 10;
    // Couple seat must cover 2 seats plus the gap between them to remain aligned
    const COUPLE_W = SEAT_SIZE * 2 + ROW_GAP;

    const renderSeat = (seatId, type, label) => {
        const isSelected = selectedSeats.includes(seatId);
        const seatType = type === 'couple' ? 'COUPLE' : getDisplaySeatType(seatId, seatMap);
        const isVip = seatType === 'VIP';
        const isCouple = seatType === 'COUPLE';

        let isBooked = false;
        if (isCouple) {
            const row = seatId[0];
            const [a, b] = seatId.slice(1).split('-');
            isBooked = seatMap?.[`${row}${a}`]?.isBooked || seatMap?.[`${row}${b}`]?.isBooked;
        } else {
            isBooked = seatMap?.[seatId]?.isBooked;
        }

        const ICON_SIZE = Math.floor(SEAT_SIZE * 0.45);
        const TEXT_SIZE = Math.floor(SEAT_SIZE * 0.28);

        if (isCouple) {
            let coupleClass = isSelected 
                ? 'bg-[#A855F7] border-[#A855F7]' 
                : isBooked 
                    ? 'bg-[#ff3d3d]/30 border-[#ff3d3d]/20' 
                    : isDark ? 'bg-[#2A1A40] border-[#A855F7]' : 'bg-pink-50 border-pink-200';
            
            return (
                <TouchableOpacity
                    key={seatId}
                    className={`rounded-lg border-1.2 items-center justify-center ${coupleClass}`}
                    style={{ width: COUPLE_W, height: SEAT_SIZE }}
                    onPress={() => toggleSeat(seatId)}
                    disabled={isBooked}
                    activeOpacity={0.7}
                >
                    <View className="flex-row items-center justify-center gap-1">
                        <Armchair size={ICON_SIZE} color={isSelected ? '#FFF' : isBooked ? 'rgba(255,255,255,0.2)' : isDark ? '#ec4899' : '#db2777'} />
                        <Armchair size={ICON_SIZE} color={isSelected ? '#FFF' : isBooked ? 'rgba(255,255,255,0.2)' : isDark ? '#ec4899' : '#db2777'} />
                    </View>
                    {isSelected && <Text className="absolute bottom-1 text-[#0A0A0F] text-[8px] font-black italic uppercase">C</Text>}
                </TouchableOpacity>
            );
        }

        let containerClass = "rounded-lg items-center justify-between py-1 border m-0.5";
        let iconColor = isDark ? "#6b7280" : "#9ca3af";
        let textColor = isDark ? "text-gray-400" : "text-gray-500";
        let borderColor = isDark ? "border-white/10" : "border-gray-200";
        let bgColor = isDark ? "bg-white/5" : "bg-gray-100";

        if (isSelected) {
            bgColor = "bg-[#c04444]";
            borderColor = "border-[#c04444]";
            iconColor = "#ffffff";
            textColor = "text-white";
        } else if (isBooked) {
            bgColor = "bg-[#c04444]/20";
            borderColor = "border-[#c04444]/10";
            iconColor = isDark ? "rgba(192, 68, 68, 0.3)" : "rgba(192, 68, 68, 0.2)";
            textColor = isDark ? "text-[#c04444]/30" : "text-[#c04444]/40";
        } else if (isVip) {
            bgColor = isDark ? "bg-amber-900/10" : "bg-amber-50";
            borderColor = isDark ? "border-amber-500/30" : "border-amber-200";
            iconColor = isDark ? "#f59e0b" : "#d97706";
            textColor = isDark ? "text-amber-500" : "text-amber-600";
        }

        return (
            <TouchableOpacity
                key={seatId}
                style={{ width: SEAT_SIZE, height: SEAT_SIZE }}
                onPress={() => toggleSeat(seatId)}
                disabled={isBooked}
                activeOpacity={0.7}
            >
                <View className={`${containerClass} ${bgColor} ${borderColor} w-full h-full`}>
                    <Text style={{ fontSize: TEXT_SIZE }} className={`font-black ${textColor}`}>
                        {seatId}
                    </Text>
                    <Armchair size={ICON_SIZE} color={iconColor} />
                </View>
            </TouchableOpacity>
        );
    };

    const renderGrid = () => {
        if (!showtime) return null;
        const grid = [];
        for (let r = 0; r < layout.rows; r++) {
            const rowLabel = String.fromCharCode(65 + r);
            const rowSeats = [];
            const isLastRow = r === layout.rows - 1;

            if (isLastRow) {
                for (let c = 0; c < layout.cols / 2; c++) {
                    const seatId = `${rowLabel}${c * 2 + 1}-${c * 2 + 2}`;
                    rowSeats.push(renderSeat(seatId, 'couple', null));
                    if (c === 0 || c === 3) {
                        rowSeats.push(<View key={`aisle-c-${c}`} className="w-2" />);
                    }
                }
            } else {
                for (let c = 0; c < layout.cols; c++) {
                    const seatIndex = r * layout.cols + c;
                    if (seatIndex >= layout.capacity) break;
                    const seatId = `${rowLabel}${c + 1}`;
                    rowSeats.push(renderSeat(seatId, (r >= layout.startVipRow && r <= layout.endVipRow && c >= 2 && c <= layout.cols - 3) ? 'vip' : 'regular', c + 1));
                    if (c === 1 || c === 7) {
                        rowSeats.push(<View key={`aisle-${r}-${c}`} className="w-2" />);
                    }
                }
            }

            grid.push(
                <View key={rowLabel} className={`flex-row items-center gap-[${ROW_GAP}px] ${isLastRow ? 'mt-2' : ''}`}>
                    <Text className={`text-[10px] font-bold w-3.5 text-center ${subTextColor}`}>{rowLabel}</Text>
                    {rowSeats}
                    <Text className={`text-[10px] font-bold w-3.5 text-center ${subTextColor}`}>{rowLabel}</Text>
                </View>
            );
        }
        return grid;
    };

    if (loading && !showtime) {
        return (
            <View className={`flex-1 ${bgColor} justify-center items-center`}>
                <ActivityIndicator size="large" color="#c04444" />
                <Text className={`${subTextColor} mt-4 font-bold tracking-widest uppercase text-xs`}>Loading Theater...</Text>
            </View>
        );
    }

    return (
        <ScreenWrapper>
            <View className={`flex-row items-center justify-between px-5 pt-12 pb-6 ${bgColor}`}>
                <TouchableOpacity onPress={() => navigation.goBack()} className={`w-10 h-10 rounded-2xl ${isDark ? 'bg-white/5 border-white/10' : 'bg-black/5 border-black/10'} border items-center justify-center`}>
                    <ChevronLeft color={isDark ? '#FFFFFF' : '#1A1A2E'} size={24} />
                </TouchableOpacity>
                <View className="items-center">
                    <Text className="text-[#c04444] text-[10px] font-black uppercase tracking-[4px] mb-0.5">Seat Selection</Text>
                    <Text className={`${textColor} text-xl font-black italic tracking-tighter uppercase`}>Theater Layout</Text>
                </View>
                <TouchableOpacity onPress={loadData} className={`w-10 h-10 rounded-2xl ${isDark ? 'bg-white/5 border-white/10' : 'bg-black/5 border-black/10'} border items-center justify-center`}>
                    <RotateCcw color="#c04444" size={18} />
                </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="pb-40" className={bgColor}>
                <View className={`${cardBg} mx-5 mt-4 p-6 rounded-[32px] border shadow-2xl`}>
                    <View className="flex-row justify-between items-start mb-4">
                        <View className="flex-1">
                            <Text className="text-[#c04444] text-[10px] font-black uppercase tracking-[3px] mb-2" numberOfLines={1}>{showtime?.movie?.title || 'Loading Movie...'}</Text>
                            <Text className={`text-3xl font-black ${textColor} italic`}>ROOM {showtime?.room}</Text>
                        </View>
                        <View className="bg-[#c04444] px-4 py-2 rounded-2xl shadow-lg shadow-[#c04444]/40">
                            <Text className="text-white font-black text-xs italic uppercase tracking-widest">{showtime ? new Date(showtime.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}</Text>
                        </View>
                    </View>
                    <View className={`flex-row items-center pt-4 border-t ${isDark ? 'border-white/5' : 'border-gray-100'} gap-4`}>
                        <View className="flex-row items-center">
                            <Info color="#6b7280" size={14} />
                            <Text className={`${subTextColor} text-[10px] font-black uppercase ml-2 tracking-widest`}>{showtime ? new Date(showtime.startTime).toLocaleDateString('vi-VN') : ''}</Text>
                        </View>
                        <View className="flex-row items-center gap-1">
                            <Ionicons name="time-outline" size={14} color={isDark ? "#AAA" : "#888"} />
                            <Text className={`${subTextColor} text-[12px] font-medium`}>{showtime ? new Date(showtime.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</Text>
                        </View>
                        <View className="flex-row items-center gap-1">
                            <Ionicons name="cash-outline" size={14} color="#4CAF50" />
                            <Text className="text-[#4CAF50] text-[12px] font-medium">{formatCurrency(basePrice)}</Text>
                        </View>
                    </View>
                </View>

                <View className="mt-12 px-4 items-center">
                    <View className="w-full max-w-[300px] mb-12">
                        <View className="w-full h-1 bg-[#c04444] rounded-full shadow-lg shadow-[#c04444]/50 opacity-80" />
                        <Text className="text-center text-[#c04444] text-[10px] font-black uppercase tracking-[12px] mt-3">SCREEN</Text>
                    </View>
                    <View className="items-center">{renderGrid()}</View>
                </View>

                <View className={`mt-12 mx-5 ${cardBg} p-8 rounded-[40px] border`}>
                    <Text className={`text-[10px] font-black ${subTextColor} mb-6 uppercase tracking-[4px] text-center italic`}>Seat Categories</Text>
                    <View className="flex-row justify-around flex-wrap gap-y-6">
                        <View className="items-center w-1/4">
                            <View className={`w-8 h-8 rounded-xl ${isDark ? 'bg-white/5 border-white/10' : 'bg-gray-100 border-gray-200'} border items-center justify-center mb-2`}>
                                <Armchair size={14} color="#6b7280" />
                            </View>
                            <Text className={`text-[8px] ${subTextColor} font-black uppercase tracking-widest`}>Normal</Text>
                        </View>
                        <View className="items-center w-1/4">
                            <View className={`w-8 h-8 rounded-xl ${isDark ? 'bg-amber-500/10 border-amber-500/30' : 'bg-amber-50 border-amber-200'} border items-center justify-center mb-2`}>
                                <Armchair size={14} color={isDark ? "#f59e0b" : "#d97706"} />
                            </View>
                            <Text className={`text-[8px] ${subTextColor} font-black uppercase tracking-widest`}>VIP</Text>
                        </View>
                        <View className="items-center w-1/4">
                            <View className={`w-8 h-8 rounded-xl ${isDark ? 'bg-pink-500/10 border-pink-500/30' : 'bg-pink-50 border-pink-200'} border items-center justify-center mb-2`}>
                                <Armchair size={14} color={isDark ? "#ec4899" : "#db2777"} />
                            </View>
                            <Text className={`text-[8px] ${subTextColor} font-black uppercase tracking-widest`}>Couple</Text>
                        </View>
                        <View className="items-center w-1/4">
                            <View className="w-8 h-8 rounded-xl bg-[#c04444] items-center justify-center mb-2">
                                <Armchair size={14} color="#ffffff" />
                            </View>
                            <Text className={`text-[8px] ${subTextColor} font-black uppercase tracking-widest`}>Selected</Text>
                        </View>
                    </View>
                </View>
                <View className="h-20" />
            </ScrollView>

            <View className={`absolute bottom-0 left-0 right-0 ${isDark ? 'bg-[#0A0A0F]/95 border-white/5' : 'bg-white/95 border-gray-100'} border-t px-6 pt-5 pb-10 shadow-2xl`}>
                <View className="flex-row items-center justify-between">
                    <View className="flex-1">
                        <View className="flex-row items-center mb-1">
                            <Text className={`${subTextColor} text-[10px] font-black uppercase tracking-widest`}>Selected: </Text>
                            <Text className={`${textColor} text-xs font-black italic flex-1`} numberOfLines={1}>{selectedSeats.length > 0 ? selectedSeats.join(', ') : 'None'}</Text>
                        </View>
                        <Text className="text-[#c04444] text-3xl font-black italic tracking-tighter">{previewLoading ? '...' : preview ? formatCurrency(preview.finalPrice) : formatCurrency(0)}</Text>
                    </View>
                    <TouchableOpacity onPress={handleContinue} activeOpacity={0.85} disabled={!preview || previewLoading} className="bg-[#c04444] h-14 px-8 rounded-2xl items-center justify-center shadow-lg shadow-[#c04444]/40">
                        <Text className="text-white text-base font-black italic tracking-[2px] uppercase">Book Now</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </ScreenWrapper>
    );
}

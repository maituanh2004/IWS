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
import { formatCurrency, isSeatBooked, getDisplaySeatType, formatTime } from '../utils/bookingUtils';
import { Ionicons } from '@expo/vector-icons';

const { width: SCREEN_W } = Dimensions.get('window');

// ─── Component ────────────────────────────────────────────────────────────────
export default function SeatSelectionScreen({ route, navigation }) {
    const { showtime: initialShowtime } = route.params || {};

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

    // Preview
    const fetchPreview = async () => {
        try {
            if (!showtime?._id || !selectedSeats.length) return;

            const payload = {
                showtimeId: showtime._id,
                seats: selectedSeats
            };

            console.log('PREVIEW PAYLOAD:', payload);

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
        }, 300); // delay 300ms

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

            const seatData = seatsRes.data.data.seats;
            setSeats(seatData);

        } catch (error) {
            console.error('Failed to load seat data:', error);
            Alert.alert('Error', 'Unable to load seat map. Please try again.');
        } finally {
            setLoading(false);
        }
    };
    
    // Group seats by row
    const groupedSeats = useMemo(() => {
        const rows = {};
        seats.forEach(seat => {
            if (!rows[seat.row]) rows[seat.row] = [];
            rows[seat.row].push(seat);
        });
        // Sort seats in each row by number
        Object.keys(rows).forEach(rowKey => {
            rows[rowKey].sort((a, b) => a.number - b.number);
        });
        return rows;
    }, [seats]);

    const layout = useMemo(() => {
        // Match admin capacity logic
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
    const PRICE_REGULAR = basePrice;
    const PRICE_VIP = Math.round(basePrice * 1.25 / 1000) * 1000;
    const PRICE_COUPLE = Math.round(basePrice * 1.8 / 1000) * 1000;

    const getSeatType = (r, c) => {
        if (r === layout.rows - 1) return 'COUPLE';
        if (r >= layout.startVipRow && r <= layout.endVipRow && c >= 2 && c <= layout.cols - 3) return 'VIP';
        return 'REGULAR';
    };

    const getSeatPrice = (seat) => {
        if (seat.type === 'VIP') return Math.round(basePrice * 1.25 / 1000) * 1000;
        if (seat.type === 'COUPLE') return Math.round(basePrice * 1.8 / 1000) * 1000;
        return basePrice;
    };

    const toggleSeat = (seatId) => {

        // 🔥 COUPLE SEAT
        if (seatId.includes('-')) {

            const row = seatId[0];
            const [a, b] = seatId.slice(1).split('-');

            const seat1 = seatMap?.[`${row}${a}`];
            const seat2 = seatMap?.[`${row}${b}`];

            // ❗ nếu 1 trong 2 ghế bị booked → không cho chọn
            if (seat1?.isBooked || seat2?.isBooked) return;

            setSelectedSeats(prev =>
                prev.includes(seatId)
                    ? prev.filter(s => s !== seatId)
                    : [...prev, seatId]
            );

            return;
        }

        // 🔥 NORMAL SEAT
        if (seatMap?.[seatId]?.isBooked) return;

        setSelectedSeats(prev =>
            prev.includes(seatId)
                ? prev.filter(s => s !== seatId)
                : [...prev, seatId]
        );
    };

    const expandSeats = (seats) => {
        const result = [];

        seats.forEach(seat => {
            if (seat.includes('-')) {
                const row = seat[0];
                const [a, b] = seat.slice(1).split('-');

                result.push(`${row}${a}`);
                result.push(`${row}${b}`);
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

    const Seat = ({ seatId, type, label }) => {

        const isSelected = selectedSeats.includes(seatId);

        const seatType =
            type === 'couple'
                ? 'COUPLE'
                : getDisplaySeatType(seatId, seatMap);

        const isVip = seatType === 'VIP';
        const isCouple = seatType === 'COUPLE';

        let isBooked = false;

        const getCoupleSeat = (seatId) => {
            if (!seatId.includes('-')) return null;

            const row = seatId[0];
            const [a, b] = seatId.slice(1).split('-');

            return {
                seat1: seatMap[`${row}${a}`],
                seat2: seatMap[`${row}${b}`]
            };
        };

        if (isCouple) {
            const couple = getCoupleSeat(seatId);

            isBooked =
                couple?.seat1?.isBooked ||
                couple?.seat2?.isBooked;
        } else {
            isBooked = seatMap?.[seatId]?.isBooked;
        }
        const ICON_SIZE = Math.floor(SEAT_SIZE * 0.45);
        const TEXT_SIZE = Math.floor(SEAT_SIZE * 0.28);

        let containerClass = "rounded-lg items-center justify-between py-1 border m-0.5";
        let iconColor = "#6b7280";
        let textColor = "text-gray-400";
        let borderColor = "border-white/10";
        let bgColor = "bg-white/5";

        if (isSelected) {
        bgColor = "bg-[#c04444]";
        borderColor = "border-[#c04444]";
        iconColor = "#ffffff";
        textColor = "text-white";
        } else if (isBooked) {
        bgColor = "bg-[#c04444]/20";
        borderColor = "border-[#c04444]/10";
        iconColor = "rgba(192, 68, 68, 0.3)";
        textColor = "text-[#c04444]/30";
        } else if (isVip) {
        bgColor = "bg-amber-900/10";
        borderColor = "border-amber-500/30";
        iconColor = "#f59e0b";
        textColor = "text-amber-500";
        } else if (isCouple) {
        bgColor = "bg-pink-900/10";
        borderColor = "border-pink-500/30";
        iconColor = "#ec4899";
        textColor = "text-pink-400";
        }

        if (isCouple) {
            return (
                <TouchableOpacity
                    className={`h-[${SEAT_SIZE}px] rounded-lg border-1.2 items-center justify-center ${isSelected ? 'bg-[#A855F7] border-[#A855F7]' : isBooked ? 'bg-[#ff3d3d]/30 border-[#ff3d3d]/20' : 'bg-[#2A1A40] border-[#A855F7]'}`}
                    style={{
                        width: COUPLE_W,
                        height: SEAT_SIZE,
                    }}
                    onPress={() => toggleSeat(seatId)}
                    disabled={isBooked}
                    activeOpacity={0.7}
                >
                    {isSelected && <Text className="text-[#0A0A0F] text-[10px] font-black">C</Text>}
                </TouchableOpacity>
            );
        }

        return (
            <TouchableOpacity
                className={`w-[${SEAT_SIZE}px] h-[${SEAT_SIZE}px] rounded-md items-center justify-center ${isSelected ? 'bg-[#00D4FF]' : isBooked ? 'bg-[#ff3d3d]/30' : isVip ? 'bg-[#1A1A1A] border-1.2 border-[#F4C430]' : 'bg-[#3A3A4A]'}`}
                style={{ width: SEAT_SIZE, height: SEAT_SIZE }}
                onPress={() => toggleSeat(seatId)}
                disabled={isBooked}
                activeOpacity={0.7}
                style={{ 
                    width: isCouple ? SEAT_SIZE * 2 + 4 : SEAT_SIZE, 
                    height: SEAT_SIZE 
                }}
            >
                <View 
                    className={`${containerClass} ${bgColor} ${borderColor} w-full h-full`}
                >
                    <Text style={{ fontSize: TEXT_SIZE }} className={`font-black ${textColor}`}>
                        {seatId}
                    </Text>
                    <View className="flex-row">
                        <Armchair size={ICON_SIZE} color={iconColor} />
                        {isCouple && <Armchair size={ICON_SIZE} color={iconColor} />}
                    </View>
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

                    rowSeats.push(<Seat key={seatId} seatId={seatId} type="couple" />);

                    if (c < (layout.cols / 2) - 1) {
                        rowSeats.push(<View key={`aisle-c-${c}`} className="w-2" />);
                    }
                }
            } else {
                for (let c = 0; c < layout.cols; c++) {
                    const seatIndex = r * layout.cols + c;
                    if (seatIndex >= layout.capacity) break;

                    const seatId = `${rowLabel}${c + 1}`;

                    rowSeats.push(
                        <Seat
                            key={seatId}
                            seatId={seatId}
                            type={getSeatType(r, c)}
                            label={c + 1}
                        />
                    );

                    if (c === 1 || c === 7) {
                        rowSeats.push(<View key={`aisle-${r}-${c}`} className="w-2" />);
                    }
                }
            }

            grid.push(
                <View key={rowLabel} className="flex-row items-center gap-[4px]">
                    <Text className="text-[#444] text-[10px] font-bold w-3.5 text-center">{rowLabel}</Text>
                    {rowSeats}
                    <Text className="text-[#444] text-[10px] font-bold w-3.5 text-center">{rowLabel}</Text>
                </View>
            );
        }
        return grid;
    };

    const SEAT_GAP = 6;
    const SEAT_SIZE = (SCREEN_W - 32 - 12 - (SEAT_GAP * 11)) / 10;
    const COUPLE_W = SEAT_SIZE * 2 + SEAT_GAP;

    if (loading && !showtime) {
        return (
            <View className="flex-1 bg-[#0A0A0F] justify-center items-center">
                <ActivityIndicator size="large" color="#c04444" />
                <Text className="text-gray-500 mt-4 font-bold tracking-widest uppercase text-xs">Loading Theater...</Text>
            </View>
        );
    }

    return (
        <ScreenWrapper>
            {/* Custom Admin-style Header */}
            <View className="flex-row items-center justify-between px-5 pt-12 pb-6 bg-[#0A0A0F]">
                <TouchableOpacity 
                    onPress={() => navigation.goBack()}
                    className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 items-center justify-center"
                >
                    <ChevronLeft color="#FFFFFF" size={24} />
                </TouchableOpacity>
                <View className="items-center">
                    <Text className="text-[#c04444] text-[10px] font-black uppercase tracking-[4px] mb-0.5">Seat Selection</Text>
                    <Text className="text-white text-xl font-black italic tracking-tighter uppercase">Theater Layout</Text>
                </View>
                <TouchableOpacity 
                    onPress={loadData}
                    className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 items-center justify-center"
                >
                    <RotateCcw color="#c04444" size={18} />
                </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="pb-40">
                {/* Movie & Showtime Info Card */}
                <View className="bg-black/40 mx-5 mt-4 p-6 rounded-[32px] border border-white/10 shadow-2xl">
                    <View className="flex-row justify-between items-start mb-4">
                        <View className="flex-1">
                            <Text className="text-[#c04444] text-[10px] font-black uppercase tracking-[3px] mb-2" numberOfLines={1}>
                                {showtime?.movie?.title || 'Loading Movie...'}
                            </Text>
                            <Text className="text-3xl font-black text-white italic">ROOM {showtime?.room}</Text>
                        </View>
                        <View className="bg-[#c04444] px-4 py-2 rounded-2xl shadow-lg shadow-[#c04444]/40">
                            <Text className="text-white font-black text-xs italic uppercase tracking-widest">
                                {showtime ? new Date(showtime.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                            </Text>
                        </View>
                    </View>
                    <View className="flex-row items-center pt-4 border-t border-white/5 gap-4">
                        <View className="flex-row items-center">
                            <Info color="#6b7280" size={14} />
                            <Text className="text-gray-400 text-[10px] font-black uppercase ml-2 tracking-widest">
                                {showtime ? new Date(showtime.startTime).toLocaleDateString('vi-VN') : ''}
                            </Text>
                        </View>
                        <View className="flex-row items-center gap-1">
                            <Ionicons name="time-outline" size={14} color="#AAA" />
                            <Text className="text-gray-400 text-[12px] font-medium">{showtime ? new Date(showtime.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</Text>
                        </View>
                        <View className="flex-row items-center gap-1">
                            <Ionicons name="cash-outline" size={14} color="#4CAF50" />
                            <Text className="text-[#4CAF50] text-[12px] font-medium">{formatCurrency(basePrice)}</Text>
                        </View>
                    </View>
                </View>

                {/* Screen Indicator */}
                <View className="mt-12 px-4 items-center">
                    <View className="w-full max-w-[300px] mb-12">
                        <View className="w-full h-1 bg-[#c04444] rounded-full shadow-lg shadow-[#c04444]/50 opacity-80" />
                        <Text className="text-center text-[#c04444] text-[10px] font-black uppercase tracking-[12px] mt-3">SCREEN</Text>
                    </View>
                    
                    {/* Seating Grid */}
                        <View className="items-center">
                        {renderGrid()}
                        </View>
                </View>

                {/* Legend Area */}
                <View className="mt-12 mx-5 bg-black/40 p-8 rounded-[40px] border border-white/10">
                    <Text className="text-[10px] font-black text-gray-500 mb-6 uppercase tracking-[4px] text-center italic">Seat Categories</Text>
                    <View className="flex-row justify-around flex-wrap gap-y-6">
                        <View className="items-center w-1/4">
                            <View className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 items-center justify-center mb-2">
                                <Armchair size={14} color="#6b7280" />
                            </View>
                            <Text className="text-[8px] text-gray-500 font-black uppercase tracking-widest">Normal</Text>
                        </View>
                        <View className="items-center w-1/4">
                            <View className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 items-center justify-center mb-2">
                                <Armchair size={14} color="#f59e0b" />
                            </View>
                            <Text className="text-[8px] text-gray-500 font-black uppercase tracking-widest">VIP</Text>
                        </View>
                        <View className="items-center w-1/4">
                            <View className="w-8 h-8 rounded-xl bg-pink-500/10 border border-pink-500/30 items-center justify-center mb-2">
                                <Armchair size={14} color="#ec4899" />
                            </View>
                            <Text className="text-[8px] text-gray-500 font-black uppercase tracking-widest">Couple</Text>
                        </View>
                        <View className="items-center w-1/4">
                            <View className="w-8 h-8 rounded-xl bg-[#c04444] items-center justify-center mb-2">
                                <Armchair size={14} color="#ffffff" />
                            </View>
                            <Text className="text-[8px] text-gray-500 font-black uppercase tracking-widest">Selected</Text>
                        </View>
                    </View>
                </View>

                <View className="h-20" />
            </ScrollView>

            {/* Sticky Bottom Summary */}
            <View className="absolute bottom-0 left-0 right-0 bg-[#0A0A0F]/95 border-t border-white/5 px-6 pt-5 pb-10 shadow-2xl">
                <View className="flex-row items-center justify-between">
                    <View className="flex-1">
                        <View className="flex-row items-center mb-1">
                            <Text className="text-gray-500 text-[10px] font-black uppercase tracking-widest">Selected: </Text>
                            <Text className="text-white text-xs font-black italic flex-1" numberOfLines={1}>
                                {selectedSeats.length > 0 ? selectedSeats.join(', ') : 'None'}
                            </Text>
                        </View>
                        <Text className="text-[#c04444] text-3xl font-black italic tracking-tighter">
                            {previewLoading
                                ? '...'
                                : preview
                                    ? formatCurrency(preview.finalPrice)
                                    : formatCurrency(0)
                            }
                        </Text>
                    </View>

                    <TouchableOpacity
                        onPress={handleContinue}
                        activeOpacity={0.85}
                        disabled={!preview || previewLoading}
                        className="bg-[#c04444] h-14 px-8 rounded-2xl items-center justify-center shadow-lg shadow-[#c04444]/40"
                    >
                        <Text className="text-white text-base font-black italic tracking-[2px] uppercase">Book Now</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </ScreenWrapper>
    );
}

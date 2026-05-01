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
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as api from '../services/api';
import ScreenWrapper from '../components/ScreenWrapper';
import Header from '../components/Header';
import { formatCurrency, isSeatBooked, getDisplaySeatType, formatTime } from '../utils/bookingUtils';

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
                seats: expandSeats(selectedSeats)
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
            Alert.alert('Lỗi', 'Không thể tải sơ đồ ghế ngồi. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    const layout = useMemo(() => {
        if (!showtime) return { rows: 0, cols: 0, capacity: 0 };

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
        if (r === layout.rows - 1) return 'couple';
        if (r >= layout.startVipRow && r <= layout.endVipRow && c >= 2 && c <= layout.cols - 3) return 'vip';
        return 'regular';
    };

    const getSeatPrice = (seatId) => {
        if (seatId.includes('-')) return PRICE_COUPLE;
        const rowLabel = seatId[0];
        const r = rowLabel.charCodeAt(0) - 65;
        const c = parseInt(seatId.slice(1)) - 1;
        if (getSeatType(r, c) === 'vip') return PRICE_VIP;
        return PRICE_REGULAR;
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


    const totalPrice = 0;

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
            Alert.alert('Thông báo', 'Vui lòng chọn ít nhất 1 ghế');
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
            >
                {isSelected && (
                    <Text className="text-[#0A0A0F] text-[10px] font-black">{label}</Text>
                )}
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
                <ActivityIndicator size="large" color="#00D4FF" />
                <Text className="text-gray-500 mt-2.5">Đang tải sơ đồ ghế...</Text>
            </View>
        );
    }

    return (
        <ScreenWrapper>
            <Header
                title="Chọn Ghế"
                subTitle={`Phòng ${showtime?.room || '?'}`}
                rightElement={
                    <TouchableOpacity onPress={loadData}>
                        <Ionicons name="refresh-outline" size={20} color="#00D4FF" />
                    </TouchableOpacity>
                }
            />

            <ScrollView showsVerticalScrollIndicator={false} className="px-4 pt-4">
                {/* Movie Info Card */}
                <View className="bg-[#141420] rounded-2xl p-3.5 mb-6 border border-[#1E1E2E]">
                    <View className="flex-row items-center mb-2.5">
                        <Ionicons name="film" size={20} color="#00D4FF" className="mr-2.5" />
                        <Text className="text-white text-[15px] font-bold flex-1" numberOfLines={1}>{showtime?.movie?.title}</Text>
                    </View>
                    <View className="flex-row flex-wrap gap-3.5">
                        <View className="flex-row items-center gap-1">
                            <Ionicons name="calendar-outline" size={14} color="#AAA" />
                            <Text className="text-gray-400 text-[12px] font-medium">{showtime ? new Date(showtime.startTime).toLocaleDateString('vi-VN') : ''}</Text>
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
                <View className="items-center mb-8">
                    <View className="w-[80%] h-1 bg-[#00D4FF] rounded-full shadow-lg shadow-[#00D4FF]/50" />
                    <Text className="text-[#00D4FF] text-[10px] font-bold tracking-[6px] mt-1.5 uppercase">MÀN HÌNH</Text>
                </View>

                {/* Seat Grid */}
                <View className="items-center gap-[6px] mb-7">
                    {renderGrid()}
                </View>

                {/* Legend */}
                <View className="mb-3">
                    <View className="flex-row justify-between items-center">
                        <View className="flex-row items-center gap-1.5">
                            <View className="w-4 h-4 rounded-sm bg-[#2A2A3A]" />
                            <Text className="text-gray-500 text-[11px]">Thường</Text>
                        </View>
                        <View className="flex-row items-center gap-1.5">
                            <View className="w-4 h-4 rounded-sm bg-[#0A0A0F] border border-[#F4C430]" />
                            <Text className="text-gray-500 text-[11px]">VIP</Text>
                        </View>
                        <View className="flex-row items-center gap-1.5">
                            <View className="w-4 h-4 rounded-sm bg-[#00D4FF]" />
                            <Text className="text-gray-500 text-[11px]">Đang chọn</Text>
                        </View>
                        <View className="flex-row items-center gap-1.5">
                            <View className="w-4 h-4 rounded-sm bg-[#ff3d3d]/30" />
                            <Text className="text-gray-500 text-[11px]">Đã bán</Text>
                        </View>
                    </View>
                    <View className="flex-row justify-center mt-3">
                        <View className="flex-row items-center gap-[6px]">
                            <View className="w-7 h-4 rounded-sm bg-[#2A1A40] border border-[#A855F7]" />
                            <Text className="text-gray-500 text-[11px]">Couple</Text>
                        </View>
                    </View>
                </View>

                <View className="h-40" />
            </ScrollView>

            {/* Sticky Bottom */}
            <View className="absolute bottom-0 left-0 right-0 bg-[#0A0A0F]/98 border-t border-[#1E1E2E] px-4 pt-3.5 pb-9">
                <View className="flex-row items-center gap-4">
                    <View className="flex-1">
                        <View className="flex-row items-center mb-0.5">
                            <Text className="text-gray-600 text-[12px]">Ghế đã chọn: </Text>
                            <Text className="text-white text-[13px] font-bold flex-1" numberOfLines={1}>
                                {selectedSeats.length > 0 ? selectedSeats.join(', ') : 'Chưa chọn'}
                            </Text>
                        </View>
                        <Text className="text-[#00D4FF] text-2xl font-black">{formatCurrency(preview?.finalPrice || 0)}</Text>
                    </View>

                    <TouchableOpacity
                        onPress={handleContinue}
                        activeOpacity={0.85}
                        disabled={!preview || previewLoading}
                        className="flex-1 rounded-2xl overflow-hidden shadow-lg shadow-[#00D4FF]/20"
                    >
                        <LinearGradient
                            colors={['#00D4FF', '#00AACC']}
                            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                            className="h-13 items-center justify-center"
                        >
                            <Text className="text-[#0A0A0F] text-base font-black tracking-widest">TIẾP TỤC</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            </View>
        </ScreenWrapper>
    );
}

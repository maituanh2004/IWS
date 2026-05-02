import React, { useState, useEffect, useMemo } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    Dimensions,
} from 'react-native';
import { Inbox, Info, Armchair } from 'lucide-react-native';
import * as showtimeApi from '../services/showtimeService';
import AdminHeader from '../components/AdminHeader';
import Navbar from '../components/Navbar';
import BackgroundWrapper from '../components/BackgroundWrapper';
import * as bookingApi from '../services/bookingService';

const { width } = Dimensions.get('window');
const SEAT_SIZE = (width - 60) / 10;

export default function OccupancyScreen({ route, navigation }) {
    const { showtimeId } = route.params || {};
    const [showtime, setShowtime] = useState(null);
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadShowtime();
    }, [showtimeId]);

    const loadShowtime = async () => {
        setLoading(true);
        try {
            const [showtimeRes, bookingsRes] = await Promise.all([
                showtimeApi.getShowtime(showtimeId),
                bookingApi.getBookingsByShowtime(showtimeId)
            ]);

            setShowtime(showtimeRes.data.data);
            setBookings(bookingsRes.data.data);

        } catch (error) {
            console.error('Failed to load data:', error);
        } finally {
            setLoading(false);
        }
    };

    const capacity = useMemo(() => {
        if (!showtime) return 80;
        const roomNum = parseInt(showtime.room);
        if (roomNum >= 1 && roomNum <= 5) return 80;
        if (roomNum >= 6 && roomNum <= 10) return 100;
        return showtime.totalSeats || 80;
    }, [showtime]);

    const cols = 10;
    const rows = Math.ceil(capacity / cols);
    const startVipRow = Math.floor((rows - 4) / 2);
    const endVipRow = startVipRow + 3;

    const bookedSeats = useMemo(() => {
        if (!bookings) return new Set();

        const set = new Set();

        bookings.forEach(b => {
            if (b.seat) {
                // convert A1 → index
                const row = b.seat.charCodeAt(0) - 65;
                const col = parseInt(b.seat.slice(1)) - 1;

                const index = row * cols + col;
                set.add(index);
            }
        });

        return set;
    }, [bookings]);

    if (loading) {
        return (
            <BackgroundWrapper>
                <View className="flex-1 justify-center items-center">
                    <ActivityIndicator size="large" color="#c04444" />
                </View>
            </BackgroundWrapper>
        );
    }

    if (!showtime) {
        return (
            <BackgroundWrapper>
                <AdminHeader title="Theater Layout" showBack={true} />
                <View className="flex-1 justify-center items-center p-6">
                    <Inbox color="#c04444" size={64} />
                    <Text className="text-xl font-black text-white mt-4 text-center italic">DATA UNAVAILABLE</Text>
                    <TouchableOpacity
                        className="mt-8 bg-[#c04444] px-10 py-4 rounded-2xl"
                        onPress={() => navigation.goBack()}
                    >
                        <Text className="text-white font-black uppercase tracking-widest">Return Home</Text>
                    </TouchableOpacity>
                </View>
            </BackgroundWrapper>
        );
    }

    const renderGrid = () => {
        const grid = [];
        const ICON_SIZE = Math.floor(SEAT_SIZE * 0.4);
        const TEXT_SIZE = Math.floor(SEAT_SIZE * 0.25);

        for (let r = 0; r < rows; r++) {
            const rowLabel = String.fromCharCode(65 + r);
            const rowSeats = [];
            const isLastRow = r === rows - 1;

            if (isLastRow) {
                for (let c = 0; c < cols / 2; c++) {
                    const seatIndex1 = r * cols + c * 2;
                    const seatIndex2 = seatIndex1 + 1;
                    const isBooked = bookedSeats.has(seatIndex1) || bookedSeats.has(seatIndex2);
                    rowSeats.push(
                        <View key={`${rowLabel}${c}`} className="m-0.5" style={{ width: SEAT_SIZE * 2 + 4, height: SEAT_SIZE }}>
                            <View className={`w-full h-full rounded-lg items-center justify-between py-1 border ${isBooked ? 'bg-[#c04444] border-[#c04444]/20' : 'bg-pink-900/10 border-pink-500/30'}`}>
                                <Text style={{ fontSize: TEXT_SIZE - 1 }} className={`font-black ${isBooked ? 'text-white/40' : 'text-pink-400'}`}>
                                    {rowLabel}{c * 2 + 1}-{c * 2 + 2}
                                </Text>
                                <View className="flex-row">
                                    <Armchair size={ICON_SIZE} color={isBooked ? 'rgba(255,255,255,0.2)' : '#ec4899'} />
                                    <Armchair size={ICON_SIZE} color={isBooked ? 'rgba(255,255,255,0.2)' : '#ec4899'} />
                                </View>
                            </View>
                        </View>
                    );
                }
            } else {
                for (let c = 0; c < cols; c++) {
                    const seatIndex = r * cols + c;
                    if (seatIndex >= capacity) break;
                    const isBooked = bookedSeats.has(seatIndex);
                    const isVIP = r >= startVipRow && r <= endVipRow && c >= 2 && c <= cols - 3;
                    rowSeats.push(
                        <View key={`${rowLabel}${c}`} className="m-0.5" style={{ width: SEAT_SIZE, height: SEAT_SIZE }}>
                            <View className={`w-full h-full rounded-lg items-center justify-between py-1 border ${isBooked ? 'bg-[#c04444] border-[#c04444]/20' : isVIP ? 'bg-amber-900/10 border-amber-500/30' : 'bg-white/5 border-white/10'}`}>
                                <Text style={{ fontSize: TEXT_SIZE }} className={`font-black ${isBooked ? 'text-white/40' : isVIP ? 'text-amber-500' : 'text-gray-400'}`}>
                                    {rowLabel}{c + 1}
                                </Text>
                                <Armchair size={ICON_SIZE} color={isBooked ? 'rgba(255,255,255,0.2)' : isVIP ? '#f59e0b' : '#6b7280'} />
                            </View>
                        </View>
                    );
                }
            }
            grid.push(
                <View key={rowLabel} className="flex-row items-center justify-center">
                    <Text className="w-6 text-gray-500 font-black text-center text-[10px]">{rowLabel}</Text>
                    {rowSeats}
                    <Text className="w-6 text-gray-500 font-black text-center text-[10px]">{rowLabel}</Text>
                </View>
            );
        }
        return grid;
    };

    return (
        <BackgroundWrapper>
            <AdminHeader title="Theater Layout" showBack={true} />
            
            <ScrollView contentContainerClassName="pb-32">
                {/* Showtime Header Card */}
                <View className="bg-black/40 mx-5 mt-6 p-6 rounded-[32px] border border-white/10 shadow-2xl">
                    <View className="flex-row justify-between items-start mb-4">
                        <View className="flex-1">
                            <Text className="text-[#c04444] text-[10px] font-black uppercase tracking-[3px] mb-2" numberOfLines={1}>
                                {showtime.movie?.title || 'Unknown Movie'}
                            </Text>
                            <Text className="text-3xl font-black text-white italic">ROOM {showtime.room}</Text>
                        </View>
                        <View className="bg-[#c04444] px-4 py-2 rounded-2xl shadow-lg shadow-[#c04444]/40">
                            <Text className="text-white font-black text-xs italic">
                                {Math.round(((bookings.length || 0) / capacity) * 100)}%
                            </Text>
                        </View>
                    </View>
                    <View className="flex-row items-center pt-4 border-t border-white/5">
                        <View className="flex-1 flex-row items-center">
                            <Info color="#6b7280" size={14} />
                            <Text className="text-gray-400 text-[10px] font-black uppercase ml-2 tracking-widest">
                                {bookings.length || 0} / {capacity} SEATS BOOKED
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Seating Grid Area */}
                <View className="mt-10 px-4 items-center">
                    {/* Screen Indicator */}
                    <View className="w-full max-w-[300px] mb-12">
                        <View className="w-full h-1 bg-[#c04444] rounded-full shadow-lg shadow-[#c04444]/50" />
                        <Text className="text-center text-[#c04444] text-[10px] font-black uppercase tracking-[8px] mt-2">SCREEN</Text>
                    </View>
                    
                    <View className="items-center">
                        {renderGrid()}
                    </View>
                </View>

                {/* Legend Area */}
                <View className="mt-10 mx-5 bg-black/40 p-8 rounded-[40px] border border-white/10">
                    <Text className="text-xs font-black text-gray-500 mb-6 uppercase tracking-widest text-center">Legend</Text>
                    <View className="flex-row justify-around flex-wrap gap-y-6">
                        <View className="items-center w-1/4">
                            <View className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 mb-2" />
                            <Text className="text-[8px] text-gray-500 font-black uppercase tracking-widest">Open</Text>
                        </View>
                        <View className="items-center w-1/4">
                            <View className="w-8 h-8 rounded-xl bg-[#c04444] mb-2" />
                            <Text className="text-[8px] text-gray-500 font-black uppercase tracking-widest">Sold</Text>
                        </View>
                        <View className="items-center w-1/4">
                            <View className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 mb-2" />
                            <Text className="text-[8px] text-gray-500 font-black uppercase tracking-widest">VIP</Text>
                        </View>
                        <View className="items-center w-1/4">
                            <View className="w-8 h-8 rounded-xl bg-pink-500/10 border border-pink-500/30 mb-2" />
                            <Text className="text-[8px] text-gray-500 font-black uppercase tracking-widest">Couple</Text>
                        </View>
                    </View>
                </View>
            </ScrollView>
            <Navbar />
        </BackgroundWrapper>
    );
}

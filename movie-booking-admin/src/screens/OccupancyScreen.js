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

const { width } = Dimensions.get('window');
const SEAT_SIZE = (width - 60) / 10;

export default function OccupancyScreen({ route, navigation }) {
    const { showtimeId } = route.params || {};
    const [showtime, setShowtime] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadShowtime();
    }, [showtimeId]);

    const loadShowtime = async () => {
        setLoading(true);
        if (!showtimeId) {
            // No showtime selected — leave data empty so UI renders an empty state
            setShowtime(null);
            setLoading(false);
            return;
        }
        try {
            const response = await showtimeApi.getShowtime(showtimeId);
            setShowtime(response.data.data);
        } catch (error) {
            console.error('Failed to load showtime details:', error);
            setShowtime(null);
        } finally {
            setLoading(false);
        }
    };

    const capacity = useMemo(() => {
        if (!showtime) return 80;
        return showtime.totalSeats || 80;
    }, [showtime]);

    const cols = 10;
    const rows = Math.ceil(capacity / cols);
    const vipRowsCount = capacity >= 100 ? 3 : 2;

  
    const bookedSeats = useMemo(() => {
        const booked = new Set();
        if (!showtime) return booked;
        
        const bookedCount = showtime.bookedSeats || 0;
        const seedValue = showtime._id ? showtime._id.slice(-4) : '0';
        const seed = parseInt(seedValue, 16) || 123;
        
        // Simple LCG PRNG for consistency
        let m_w = seed;
        const random = () => {
            m_w = (1103515245 * m_w + 12345) & 0x7fffffff;
            return m_w / 0x7fffffff;
        };

        while (booked.size < bookedCount) {
            const randomSeat = Math.floor(random() * capacity);
            booked.add(randomSeat);
        }
        return booked;
    }, [capacity, showtime]);

    if (loading) {
        return (
            <View className="flex-1 justify-center items-center bg-gray-50">
                <ActivityIndicator size="large" color="#e50914" />
            </View>
        );
    }

    if (!showtime) {
        return (
            <View className="flex-1 justify-center items-center bg-gray-50 p-6">
                <Inbox color="#e50914" size={64} />
                <Text className="text-xl font-bold text-gray-900 mt-4 text-center">Showtime not found</Text>
                <TouchableOpacity
                    className="mt-6 bg-[#e50914] px-8 py-3 rounded-full"
                    onPress={() => navigation.goBack()}
                >
                    <Text className="text-white font-bold">Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const renderGrid = () => {
        const grid = [];
        const ICON_SIZE = Math.floor(SEAT_SIZE * 0.4);
        const TEXT_SIZE = Math.floor(SEAT_SIZE * 0.25);

        for (let r = 0; r < rows; r++) {
            const rowLabel = String.fromCharCode(65 + r);
            const rowSeats = [];

            for (let c = 0; c < cols; c++) {
                const seatIndex = r * cols + c;
                if (seatIndex >= capacity) break;

                const isBooked = bookedSeats.has(seatIndex);
                const isVIP = r < vipRowsCount;

                rowSeats.push(
                    <View
                        key={`${rowLabel}${c + 1}`}
                        className="m-0.5"
                        style={{ width: SEAT_SIZE, height: SEAT_SIZE }}
                    >
                        <View
                            className="w-full h-full rounded-md items-center justify-between py-1 border"
                            style={{
                                backgroundColor: isBooked ? '#333' : isVIP ? '#fef3c7' : '#fff',
                                borderColor: isBooked ? '#111' : isVIP ? '#fbbf24' : '#e5e7eb'
                            }}
                        >
                            <Text
                                style={{ fontSize: TEXT_SIZE }}
                                className={`font-bold ${isBooked ? 'text-gray-400' : 'text-gray-600'}`}
                            >
                                {rowLabel}{c + 1}
                            </Text>
                            <Armchair
                                size={ICON_SIZE}
                                color={isBooked ? '#555' : isVIP ? '#d97706' : '#9ca3af'}
                            />
                        </View>
                    </View>
                );
            }
            grid.push(
                <View key={rowLabel} className="flex-row items-center justify-center">
                    <Text className="w-5 text-gray-400 font-bold text-center text-xs">{rowLabel}</Text>
                    {rowSeats}
                    <Text className="w-5 text-gray-400 font-bold text-center text-xs">{rowLabel}</Text>
                </View>
            );
        }
        return grid;
    };

    return (
        <View className="flex-1 bg-gray-50">
            <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 40 }}>
                {/* Movie Info Header */}
                <View className="bg-white p-5 border-b border-gray-100 shadow-sm">
                    <Text className="text-xl font-black text-gray-900 mb-2">{showtime.movie?.title}</Text>
                    <View className="flex-row items-center gap-4">
                        <View className="bg-red-50 px-3 py-1 rounded-full border border-red-100">
                            <Text className="text-[#e50914] font-bold text-xs uppercase">Room {showtime.room}</Text>
                        </View>
                        <Text className="text-gray-500 font-medium">{new Date(showtime.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                        <View className="flex-row items-center">
                            <Text className="text-gray-900 font-bold">{showtime.bookedSeats || 0}</Text>
                            <Text className="text-gray-400">/{capacity} Booked</Text>
                        </View>
                    </View>
                </View>

                {/* Legend */}
                <View className="flex-row justify-center py-6 px-4 flex-wrap gap-4">
                    <View className="flex-row items-center">
                        <View className="w-4 h-4 rounded bg-amber-100 border border-amber-400 mr-2" />
                        <Text className="text-xs text-gray-600 font-bold">VIP (+5K)</Text>
                    </View>
                    <View className="flex-row items-center">
                        <View className="w-4 h-4 rounded bg-white border border-gray-200 mr-2" />
                        <Text className="text-xs text-gray-600 font-bold">Regular</Text>
                    </View>
                    <View className="flex-row items-center">
                        <View className="w-4 h-4 rounded bg-[#333] border border-[#111] mr-2" />
                        <Text className="text-xs text-gray-600 font-bold">Booked</Text>
                    </View>
                </View>

                {/* Seating Grid with screen indicator */}
                <View className="items-center px-4">
                    <View style={{ width: Math.min(width - 40, cols * SEAT_SIZE + 40), alignItems: 'center', marginBottom: 12 }}>
                        <View style={{ width: '70%', height: 18, backgroundColor: '#d97706', borderRadius: 8, alignItems: 'center', justifyContent: 'center' }}>
                            <Text style={{ color: '#fff', fontWeight: '700', fontSize: 12 }}>SCREEN</Text>
                        </View>
                    </View>
                    {renderGrid()}
                </View>

                {/* Detailed Info */}
                <View className="mt-10 mx-5 bg-white p-6 rounded-3xl border border-gray-100 shadow-xl">
                    <View className="flex-row items-center mb-4">
                        <Info color="#e50914" size={20} />
                        <Text className="text-lg font-black text-gray-900 ml-2">Capacity Details</Text>
                    </View>

                    <View className="space-y-4">
                        <View className="flex-row justify-between items-center py-2 border-b border-gray-50">
                            <Text className="text-gray-600">Total Capacity</Text>
                            <Text className="font-bold text-gray-900">{capacity} Seats</Text>
                        </View>
                        <View className="flex-row justify-between items-center py-2 bg-red-50 p-3 rounded-xl mt-2">
                            <Text className="text-[#e50914] font-bold">Occupancy Rate</Text>
                            <Text className="text-[#e50914] text-xl font-black">{capacity > 0 ? Math.round(((showtime.bookedSeats || 0) / capacity) * 100) : 0}%</Text>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}

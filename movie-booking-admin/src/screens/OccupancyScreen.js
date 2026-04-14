import React, { useMemo } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    Dimensions,
} from 'react-native';
import { Inbox, Info, ArrowLeft, Armchair } from 'lucide-react-native';

const { width } = Dimensions.get('window');
const SEAT_SIZE = (width - 60) / 10;

export default function OccupancyScreen({ route, navigation }) {
    const { showtime } = route.params || {};

    // Safety check for showtime data
    if (!showtime) {
        return (
            <View className="flex-1 justify-center items-center bg-gray-50 p-6">
                <Inbox color="#e50914" size={64} />
                <Text className="text-xl font-bold text-gray-900 mt-4 text-center">No Showtime Data</Text>
                <TouchableOpacity
                    className="mt-6 bg-[#e50914] px-8 py-3 rounded-full"
                    onPress={() => navigation.goBack()}
                >
                    <Text className="text-white font-bold">Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const totalSeats = showtime.totalSeats || 80;
    const capacity = totalSeats === 100 ? 100 : 80; // Standardize to 80 or 100
    const cols = 10;
    const rows = capacity / cols;

    const vipRowsCount = capacity === 100 ? 3 : 2;

    // Generate mock booked seats for demonstration
    const bookedSeats = useMemo(() => {
        const booked = new Set();
        const bookedCount = showtime.bookedSeats || Math.floor(capacity * 0.4);
        while (booked.size < bookedCount) {
            const randomSeat = Math.floor(Math.random() * capacity);
            booked.add(randomSeat);
        }
        return booked;
    }, [capacity, showtime.bookedSeats]);

    const renderGrid = () => {
        const grid = [];
        const ICON_SIZE = Math.floor(SEAT_SIZE * 0.4);
        const TEXT_SIZE = Math.floor(SEAT_SIZE * 0.25);

        for (let r = 0; r < rows; r++) {
            const rowLabel = String.fromCharCode(65 + r); // A, B, C...
            const rowSeats = [];

            for (let c = 0; c < cols; c++) {
                const seatIndex = r * cols + c;
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
                                className={`font-bold ${isBooked ? 'text-gray-400' : 'text-gray-600'
                                    }`}
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
                            <Text className="text-gray-900 font-bold">{showtime.bookedSeats || bookedSeats.size}</Text>
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

                {/* Screen Indicator */}
                <View className="items-center mb-10">
                    <View className="w-3/4 h-1 bg-gray-300 rounded-full mb-2 shadow-sm" />
                    <Text className="text-gray-400 font-bold text-[10px] uppercase tracking-widest">Cinema Screen</Text>
                </View>

                {/* Seating Grid */}
                <View className="items-center px-4">
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
                        <View className="flex-row justify-between items-center py-2 border-b border-gray-50">
                            <View className="flex-row items-center">
                                <View className="w-2 h-2 rounded-full bg-amber-400 mr-2" />
                                <Text className="text-gray-600">VIP Zone (Front)</Text>
                            </View>
                            <Text className="font-bold text-amber-600">{vipRowsCount * 10} Seats</Text>
                        </View>
                        <View className="flex-row justify-between items-center py-2 border-b border-gray-50">
                            <View className="flex-row items-center">
                                <View className="w-2 h-2 rounded-full bg-gray-300 mr-2" />
                                <Text className="text-gray-600">Regular Zone</Text>
                            </View>
                            <Text className="font-bold text-gray-900">{capacity - (vipRowsCount * 10)} Seats</Text>
                        </View>
                        <View className="flex-row justify-between items-center py-2 bg-red-50 p-3 rounded-xl mt-2">
                            <Text className="text-[#e50914] font-bold">Current Occupancy</Text>
                            <Text className="text-[#e50914] text-xl font-black">{Math.round((bookedSeats.size / capacity) * 100)}%</Text>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}

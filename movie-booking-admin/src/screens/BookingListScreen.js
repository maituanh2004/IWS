import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    FlatList,
    ActivityIndicator,
    Alert,
    TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { User, Ticket, Clock, Lock, Unlock, Mail, CreditCard } from 'lucide-react-native';
import * as bookingApi from '../services/bookingService';
import * as showtimeApi from '../services/showtimeService';
import AdminHeader from '../components/AdminHeader';
import Navbar from '../components/Navbar';
import BackgroundWrapper from '../components/BackgroundWrapper';

export default function BookingListScreen({ route, navigation }) {
    const { showtimeId } = route.params;
    const [bookings, setBookings] = useState([]);
    const [showtime, setShowtime] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, [showtimeId]);

    const loadData = async () => {
        try {
            setLoading(true);
            const [bookingsRes, showtimeRes] = await Promise.all([
                bookingApi.getBookingsByShowtime(showtimeId),
                showtimeApi.getShowtime(showtimeId)
            ]);
            setBookings(bookingsRes.data.data);
            setShowtime(showtimeRes.data.data);
        } catch (error) {
            console.error('Failed to load bookings:', error);
            Alert.alert('Error', 'Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        }).format(amount);
    };

    const handleToggleBooking = async () => {
        if (!showtime) return;

        const startTime = new Date(showtime.startTime);
        const msSinceStart = Date.now() - startTime.getTime();
        const thirtyMinsInMs = 30 * 60 * 1000;
        
        const isMoviePlayingLongEnough = msSinceStart > thirtyMinsInMs;

        if (showtime.bookingOpen && !isMoviePlayingLongEnough) {
             Alert.alert('Unable to Close', 'You can only manually close booking if the movie has been playing for more than 30 minutes.');
             return;
        }

        try {
            const newState = !showtime.bookingOpen;
            await showtimeApi.updateShowtime(showtimeId, { bookingOpen: newState });
            setShowtime({ ...showtime, bookingOpen: newState });
            Alert.alert('Success', `Bookings ${newState ? 'Opened' : 'Closed'}`);
        } catch (error) {
            Alert.alert('Error', 'Failed to update status');
        }
    };

    if (loading && !showtime) {
        return (
            <BackgroundWrapper>
                <View className="flex-1 justify-center items-center">
                    <ActivityIndicator size="large" color="#c04444" />
                </View>
            </BackgroundWrapper>
        );
    }

    return (
        <BackgroundWrapper>
            <AdminHeader title="Bookings" showBack={true} />
            
            <View className="p-5 flex-1">
                {showtime && (
                    <View className="mb-8 bg-black/40 p-6 rounded-[32px] border border-white/10 shadow-2xl">
                        <View className="flex-row justify-between items-start">
                            <View className="flex-1">
                                <Text className="text-[#c04444] text-[10px] font-black uppercase tracking-[4px] mb-2">
                                    {showtime.movie?.title}
                                </Text>
                                <Text className="text-2xl font-black text-white italic mb-4">ROOM {showtime.room}</Text>
                                <View className="flex-row items-center">
                                    <Clock color="#6b7280" size={12} />
                                    <Text className="text-gray-400 text-[10px] font-black uppercase ml-2 tracking-widest">
                                        {new Date(showtime.startTime).toLocaleTimeString()} • {new Date(showtime.startTime).toLocaleDateString()}
                                    </Text>
                                </View>
                            </View>

                            <TouchableOpacity 
                                onPress={handleToggleBooking}
                                className={`px-4 py-2 rounded-2xl border ${showtime.bookingOpen ? 'bg-[#c04444] border-[#c04444]/20' : 'bg-white/5 border-white/10'}`}
                            >
                                <View className="flex-row items-center">
                                    {showtime.bookingOpen ? <Lock color="#fff" size={14} /> : <Unlock color="#c04444" size={14} />}
                                    <Text className={`text-[10px] font-black uppercase ml-2 italic ${showtime.bookingOpen ? 'text-white' : 'text-[#c04444]'}`}>
                                        {showtime.bookingOpen ? 'Close' : 'Open'}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}

                <FlatList
                    data={bookings}
                    keyExtractor={(item) => item._id}
                    contentContainerClassName="pb-32"
                    renderItem={({ item }) => (
                        <View className="bg-black/40 p-6 rounded-[32px] mb-4 border border-white/10 shadow-xl">
                            <View className="flex-row items-center mb-5 border-b border-white/10 pb-4">
                                <View className="w-12 h-12 bg-[#c04444]/10 rounded-2xl items-center justify-center border border-[#c04444]/20">
                                    <User color="#c04444" size={24} />
                                </View>
                                <View className="ml-4 flex-1">
                                    <Text className="text-white font-black text-lg italic">{item.user?.name || 'Guest'}</Text>
                                    <View className="flex-row items-center">
                                        <Mail color="#6b7280" size={10} />
                                        <Text className="text-gray-400 text-[10px] font-bold ml-1">{item.user?.email}</Text>
                                    </View>
                                </View>
                                <View className="bg-black/40 px-3 py-1.5 rounded-xl border border-white/10">
                                    <Text className="text-white font-black text-[10px] italic">#{item._id.slice(-6).toUpperCase()}</Text>
                                </View>
                            </View>

                            <View className="flex-row justify-between mb-6">
                                <View className="flex-1">
                                    <Text className="text-gray-500 text-[8px] font-black uppercase tracking-widest mb-1">Seats</Text>
                                    <View className="flex-row flex-wrap gap-1">
                                        {(item.seatNumber || []).map((seat, i) => (
                                            <View key={i} className="bg-[#c04444] px-2 py-1 rounded-lg">
                                                <Text className="text-white text-[10px] font-black italic">{seat}</Text>
                                            </View>
                                        ))}
                                    </View>
                                </View>
                                <View className="items-end">
                                    <Text className="text-gray-500 text-[8px] font-black uppercase tracking-widest mb-1 text-right">Investment</Text>
                                    <Text className="text-xl font-black text-white italic">{formatCurrency(item.totalPrice)}</Text>
                                </View>
                            </View>

                            <View className="flex-row justify-between items-center">
                                <View className="flex-row items-center">
                                    <CreditCard color="#6b7280" size={14} />
                                    <Text className="text-gray-400 text-[10px] font-black uppercase ml-2 tracking-widest">Credit Card</Text>
                                </View>
                                <View className={`px-4 py-1.5 rounded-xl border ${item.status === 'confirmed' ? 'bg-green-900/20 border-green-500/30' : 'bg-[#c04444]/10 border-[#c04444]/20'}`}>
                                    <Text className={`${item.status === 'confirmed' ? 'text-green-500' : 'text-[#c04444]'} font-black text-[10px] uppercase tracking-widest italic`}>{item.status}</Text>
                                </View>
                            </View>
                        </View>
                    )}
                    ListEmptyComponent={
                        <View className="items-center py-20 bg-black/20 rounded-[40px] border border-white/10">
                            <Ticket color="#c04444" size={48} opacity={0.3} />
                            <Text className="text-gray-400 font-black mt-4 uppercase tracking-[4px] italic">No Transactions</Text>
                        </View>
                    }
                />
            </View>
            <Navbar />
        </BackgroundWrapper>
    );
}

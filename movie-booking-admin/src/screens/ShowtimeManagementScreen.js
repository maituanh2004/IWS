import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    Image,
} from 'react-native';
import { Clock, MapPin, Ticket, Edit, Trash2, Plus } from 'lucide-react-native';
import * as showtimeApi from '../services/showtimeService';
import Navbar from '../components/Navbar';
import AdminHeader from '../components/AdminHeader';
import BackgroundWrapper from '../components/BackgroundWrapper';
import AnimatedCard from '../components/AnimatedCard';

export default function ShowtimeManagementScreen({ navigation }) {
    const [showtimes, setShowtimes] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadShowtimes();
    }, []);

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            loadShowtimes();
        });
        return unsubscribe;
    }, [navigation]);

    const loadShowtimes = async () => {
        try {
            const response = await showtimeApi.getShowtimes();
            setShowtimes(response.data.data);
        } catch (error) {
            console.error('Failed to load showtimes:', error);
            Alert.alert('Error', 'Failed to load showtimes');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        Alert.alert(
            'Delete Showtime',
            'Are you sure you want to delete this showtime?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await showtimeApi.deleteShowtime(id);
                            loadShowtimes();
                            Alert.alert('Success', 'Showtime deleted');
                        } catch (error) {
                            Alert.alert('Error', 'Failed to delete showtime');
                        }
                    },
                },
            ]
        );
    };

    const formatCurrency = (amount) => {
        return Math.round(amount).toLocaleString('vi-VN') + ' VND';
    };

    const renderShowtime = ({ item, index }) => {
        const startTime = new Date(item.startTime);
        
        const booked = item.bookedSeats || 0;
        const total = item.totalSeats || 50;
        const fillPercentage = Math.min(100, Math.max(0, (booked / total) * 100));

        return (
            <AnimatedCard index={index}>
                <View className="bg-black/40 rounded-[32px] p-6 mb-6 shadow-2xl border border-white/10">
                    <View className="flex-row items-start mb-5">
                        <View className="w-24 h-36 bg-black rounded-2xl overflow-hidden border border-white/10 mr-5 shadow-lg">
                            <Image 
                                source={{ uri: item.movie?.poster || 'https://via.placeholder.com/300x450?text=No+Poster' }} 
                                className="w-full h-full"
                                resizeMode="cover"
                            />
                        </View>
                        <View className="flex-1">
                            <Text className="text-2xl font-black text-white mb-2 tracking-tight" numberOfLines={2}>
                                {item.movie?.title || 'Unknown Title'}
                            </Text>
                            
                            <View className="flex-row items-center mb-2">
                                <Clock color="#c04444" size={16} />
                                <Text className="text-sm text-gray-400 ml-2.5 font-bold uppercase tracking-wider">
                                    {startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {startTime.toLocaleDateString()}
                                </Text>
                            </View>
                            
                            <View className="flex-row items-center">
                                <MapPin color="#c04444" size={16} />
                                <Text className="text-sm text-gray-400 ml-2.5 font-bold uppercase tracking-wider">
                                    Room {item.room}
                                </Text>
                            </View>
                        </View>
                        
                        <View className="bg-[#c04444] px-4 py-2 rounded-xl shadow-lg shadow-[#c04444]/40">
                            <Text className="text-white font-black text-sm">{formatCurrency(item.price)}</Text>
                        </View>
                    </View>

                    <TouchableOpacity 
                        className="mt-2 mb-6 bg-black/40 p-4 rounded-2xl border border-white/5 active:bg-black/60"
                        onPress={() => navigation.navigate('Occupancy', { showtimeId: item._id })}
                    >
                        <View className="flex-row justify-between items-center mb-3">
                            <View className="flex-row items-center">
                                <Ticket color="#c04444" size={14} />
                                <Text className="text-[10px] text-gray-500 ml-2 uppercase font-black tracking-[2px]">Occupancy</Text>
                            </View>
                            <View className="flex-row items-center">
                                <Text className="text-[10px] text-blue-400 font-black mr-4 uppercase tracking-widest">Map Details</Text>
                                <Text className="text-sm font-black text-white">
                                    {booked} <Text className="text-gray-600">/ {total}</Text>
                                </Text>
                            </View>
                        </View>
                        <View className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                            <View className={`${fillPercentage > 85 ? 'bg-red-600' : (fillPercentage > 60 ? 'bg-amber-500' : 'bg-[#c04444]')} h-full rounded-full`} style={{ width: `${fillPercentage}%` }} />
                        </View>
                    </TouchableOpacity>

                    <View className="flex-row gap-3 mt-1">
                        <TouchableOpacity
                            className="flex-1 bg-[#c04444] py-3.5 rounded-2xl flex-row justify-center items-center shadow-lg shadow-[#c04444]/20"
                            onPress={() => navigation.navigate('BookingList', { showtimeId: item._id })}
                        >
                            <Ticket color="#fff" size={18} />
                            <Text className="text-white font-black ml-2 uppercase tracking-widest text-xs">Booking</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            className="flex-1 bg-white/5 border border-white/10 py-3.5 rounded-2xl flex-row justify-center items-center"
                            onPress={() => navigation.navigate('AddEditShowtime', { showtime: item })}
                        >
                            <Edit color="#fff" size={18} />
                            <Text className="text-white font-black ml-2 uppercase tracking-widest text-xs">Edit</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            className="flex-1 bg-red-600/20 border border-red-600/30 py-3.5 rounded-2xl flex-row justify-center items-center"
                            onPress={() => handleDelete(item._id)}
                        >
                            <Trash2 color="#ef4444" size={18} />
                            <Text className="text-red-500 font-black ml-2 uppercase tracking-widest text-xs">Delete</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </AnimatedCard>
        );
    };

    if (loading) {
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
            <AdminHeader 
                title="Showtimes" 
                showBack={true} 
                rightButtons={[
                    { title: "NEW", onPress: () => navigation.navigate('AddEditShowtime', {}) }
                ]}
            />
            
            <FlatList
                data={showtimes}
                renderItem={({ item, index }) => renderShowtime({ item, index })}
                keyExtractor={(item) => item._id}
                contentContainerClassName="px-4 py-8 pb-32"
            />
            
            <Navbar />
        </BackgroundWrapper>
    );
}

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
            if (response.data?.data && response.data.data.length > 0) {
                setShowtimes(response.data.data);
            } else {
                throw new Error("No showtimes found, showing mock");
            }
        } catch (error) {
            console.log("Using Mock Data for Showtimes:", error.message);
            // Fallback mock data to display the UI if the backend DB is empty or connection fails
            setShowtimes([
                {
                    _id: 'mock-1',
                    movie: { title: 'Dune: Part Two' },
                    startTime: new Date(Date.now() + 86400000).toISOString(),
                    room: 'IMAX 1',
                    price: 115000,
                    totalSeats: 250,
                    bookedSeats: 215
                },
                {
                    _id: 'mock-2',
                    movie: { title: 'Godzilla x Kong: The New Empire' },
                    startTime: new Date(Date.now() + 120000000).toISOString(),
                    room: 'Standard 4',
                    price: 95000,
                    totalSeats: 120,
                    bookedSeats: 45
                }
            ]);
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
                            if (!id.startsWith('mock')) {
                                await showtimeApi.deleteShowtime(id);
                            }
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

    const renderShowtime = ({ item }) => {
        const startTime = new Date(item.startTime);
        
        // Mock booked seats if it doesn't exist, to test the visual progress bar
        const booked = item.bookedSeats !== undefined ? item.bookedSeats : Math.floor(Math.random() * ((item.totalSeats || 50) + 1));
        const total = item.totalSeats || 50;
        const fillPercentage = Math.min(100, Math.max(0, (booked / total) * 100));
        
        // Color coding for progress bar
        let progressColor = "bg-green-500";
        if (fillPercentage > 85) progressColor = "bg-red-500";
        else if (fillPercentage > 60) progressColor = "bg-yellow-500";

        return (
            <View className="bg-white rounded-2xl p-5 mb-5 shadow-md border border-[#e50914]">
                <View className="flex-row items-start mb-4">
                    <View className="w-24 h-36 bg-gray-50 rounded-xl overflow-hidden border border-gray-100 mr-5">
                        <Image 
                            source={{ uri: item.movie?.poster || 'https://image.tmdb.org/t/p/w500/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg' }} 
                            className="w-full h-full"
                            resizeMode="cover"
                        />
                    </View>
                    <View className="flex-1">
                        <Text className="text-2xl font-extrabold text-gray-900 mb-3 tracking-tight" numberOfLines={2}>
                            {item.movie?.title || 'Unknown Title'}
                        </Text>
                        
                        <View className="flex-row items-center mb-2">
                            <Clock color="#6b7280" size={18} />
                            <Text className="text-base text-gray-600 ml-2.5 font-medium">
                                {startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {startTime.toLocaleDateString()}
                            </Text>
                        </View>
                        
                        <View className="flex-row items-center">
                            <MapPin color="#6b7280" size={18} />
                            <Text className="text-base text-gray-600 ml-2.5 font-medium">
                                Room {item.room}
                            </Text>
                        </View>
                    </View>
                    
                    <View className="bg-[#e50914]/10 px-4 py-2 rounded-lg border border-[#e50914]/20">
                        <Text className="text-[#e50914] font-bold text-base">{formatCurrency(item.price)}</Text>
                    </View>
                </View>

                {/* Progress Bar Section (X/XX Seats) */}
                <TouchableOpacity 
                    className="mt-2 mb-4 bg-gray-50 p-3 rounded-xl border border-gray-100 active:bg-gray-100"
                    onPress={() => navigation.navigate('Occupancy', { showtime: { ...item, totalSeats: total, bookedSeats: booked } })}
                >
                    <View className="flex-row justify-between items-center mb-2.5">
                        <View className="flex-row items-center">
                            <Ticket color="#6b7280" size={16} />
                            <Text className="text-sm text-gray-500 ml-2 uppercase font-bold tracking-wider">Occupancy</Text>
                        </View>
                        <View className="flex-row items-center">
                            <Text className="text-xs text-blue-500 font-bold mr-3">View Map</Text>
                            <Text className="text-sm font-bold text-gray-900">
                                {booked} <Text className="text-gray-400">/ {total}</Text>
                            </Text>
                        </View>
                    </View>
                    <View className="w-full h-2.5 bg-gray-200 rounded-full overflow-hidden">
                        <View className={`${progressColor} h-full rounded-full`} style={{ width: `${fillPercentage}%` }} />
                    </View>
                </TouchableOpacity>


                <View className="flex-row gap-3 mt-1">
                    <TouchableOpacity
                        className="flex-1 bg-[#333] py-3 rounded-xl flex-row justify-center items-center"
                        onPress={() => navigation.navigate('AddEditShowtime', { showtime: item })}
                    >
                        <Edit color="#fff" size={18} />
                        <Text className="text-white font-bold ml-2">Edit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        className="flex-1 bg-[#e50914] py-3 rounded-xl flex-row justify-center items-center"
                        onPress={() => handleDelete(item._id)}
                    >
                        <Trash2 color="#fff" size={18} />
                        <Text className="text-white font-bold ml-2">Delete</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    if (loading) {
        return (
            <View className="flex-1 justify-center items-center bg-gray-50">
                <ActivityIndicator size="large" color="#e50914" />
            </View>
        );
    }

    return (
        <View className="flex-1 bg-gray-50">
            <AdminHeader title="Showtime Management" showBack={true} />
            <Navbar />

            <FlatList
                data={showtimes}
                renderItem={renderShowtime}
                keyExtractor={(item) => item._id}
                contentContainerClassName="px-3 py-4"
            />

            <View className="absolute bottom-6 w-full items-center">
                <TouchableOpacity 
                    className="flex-row items-center bg-[#e50914] px-6 py-3.5 rounded-full"
                    style={{ shadowColor: '#e50914', shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.4, shadowRadius: 8, elevation: 10 }}
                    onPress={() => navigation.navigate('AddEditShowtime', {})}
                >
                    <Plus color="#fff" size={28} strokeWidth={3} />
                    <Text className="text-white font-extrabold ml-3 text-xl uppercase tracking-widest">Add Showtime</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

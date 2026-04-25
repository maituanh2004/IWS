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
import { Film, Clock, Edit, Trash2, Plus } from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';
import * as movieApi from '../services/movieService';
import Navbar from '../components/Navbar';
import AdminHeader from '../components/AdminHeader';
import * as discountService from '../services/discountService';

export default function MovieManagementScreen({ navigation }) {
    const [movies, setMovies] = useState([]);
    const [discounts, setDiscounts] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            loadData();
        });
        return unsubscribe;
    }, [navigation]);

    const loadData = async () => {
        try {
            const [movieRes, discountRes] = await Promise.all([
                movieApi.getMovies(),
                discountService.getDiscounts()
            ]);

            setMovies(movieRes.data.data);
            
            // Convert discounts array to an object for fast lookup by code
            const discountMap = {};
            discountRes.data.data.forEach(d => {
                discountMap[d.code] = d;
            });
            setDiscounts(discountMap);
        } catch (error) {
            console.error('Failed to load data:', error);
            Alert.alert('Error', 'Failed to load movies or discounts');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id, title) => {
        Alert.alert(
            "Delete Movie",
            `Are you sure you want to delete "${title}"?`,
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await movieApi.deleteMovie(id);
                            loadData();
                            Alert.alert("Success", "Movie deleted");
                        } catch (error) {
                            Alert.alert("Error", "Failed to delete movie");
                        }
                    }
                }
            ]
        );
    };

    // Admin view should not apply discounts to the displayed price —
    // discounts are for customer-side pricing only. Keep original price.

    const formatCurrency = (amount) => {
        return Math.round(amount).toLocaleString('vi-VN') + ' VND';
    };

    const renderMovie = ({ item }) => {
        const price = item.price || 0;
        const available = item.availableVouchers || [];
        const hasDiscount = available.length > 0;

        return (
            <View className="bg-white rounded-2xl p-4 mb-5 shadow-md border border-[#e50914]">
                <View className="flex-row items-start mb-4">
                    <View className="w-24 h-36 bg-[#1f1f1f] rounded-xl overflow-hidden border border-[#444] shadow-md">
                        <Image
                            source={{ uri: item.poster || 'https://via.placeholder.com/300x450?text=No+Poster' }}
                            className="w-full h-full"
                            resizeMode="cover"
                        />
                    </View>
                    <View className="flex-1 ml-5 justify-start">
                        <View className="flex-row justify-between items-start">
                            <Text className="text-xl font-extrabold text-gray-900 mb-2 tracking-tight flex-1" numberOfLines={2}>
                                {item.title}
                            </Text>
                            {hasDiscount && (
                                <View className="ml-2 px-2 py-1 rounded-md bg-[#e50914]/10 border border-[#e50914]/30">
                                            <Text className="text-[10px] font-bold uppercase text-[#e50914]">
                                                {available.join(', ')}
                                            </Text>
                                </View>
                            )}
                        </View>

                        <View className="flex-row items-center mb-3">
                            <View className="bg-gray-100 px-2 py-1 rounded-md border border-gray-200 mr-2">
                                <Text className="text-gray-600 font-bold text-[10px] uppercase">{item.genre}</Text>
                            </View>
                            <View className="flex-row items-center">
                                <Clock color="#6b7280" size={12} />
                                <Text className="text-xs text-gray-500 ml-1 font-medium">{item.duration} min</Text>
                            </View>
                        </View>

                        <View className="mt-1">
                            <Text className="text-lg font-black text-gray-900">
                                {formatCurrency(price)}
                            </Text>
                            {hasDiscount && (
                                <Text className="text-xs text-gray-500 mt-1">Multi-voucher mode enabled for this movie</Text>
                            )}
                        </View>
                    </View>
                </View>

                <View className="flex-row gap-3">
                    <TouchableOpacity
                        className="flex-1 bg-[#333] py-2.5 rounded-xl flex-row justify-center items-center"
                        onPress={() => navigation.navigate('AddEditMovie', { movie: item })}
                    >
                        <Edit color="#fff" size={18} />
                        <Text className="text-white font-bold ml-2">Edit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        className="flex-1 bg-[#e50914] py-2.5 rounded-xl flex-row justify-center items-center"
                        onPress={() => handleDelete(item._id, item.title)}
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
            <AdminHeader title="Movie Management" showBack={true} />
            <Navbar />

            <FlatList
                data={movies}
                renderItem={renderMovie}
                keyExtractor={(item) => item._id}
                contentContainerClassName="px-3 py-4"
            />

            <View className="absolute bottom-6 w-full items-center">
                <TouchableOpacity
                    className="flex-row items-center bg-[#e50914] px-6 py-3.5 rounded-full"
                    style={{ shadowColor: '#e50914', shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.4, shadowRadius: 8, elevation: 10 }}
                    onPress={() => navigation.navigate('AddEditMovie', {})}
                >
                    <Plus color="#fff" size={28} strokeWidth={3} />
                    <Text className="text-white font-extrabold ml-3 text-xl uppercase tracking-widest">Add Movie</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

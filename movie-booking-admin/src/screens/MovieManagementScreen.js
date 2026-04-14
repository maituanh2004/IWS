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
    const [loading, setLoading] = useState(true);
    const { signOut } = useAuth();

    useEffect(() => {
        loadMovies();
    }, []);

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            loadMovies();
        });
        return unsubscribe;
    }, [navigation]);

    const loadMovies = async () => {
        try {
            const response = await movieApi.getMovies();
            setMovies(response.data.data);
        } catch (error) {
            alert('Error: Failed to load movies');
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
                            loadMovies();
                            alert("Success: Movie deleted");
                        } catch (error) {
                            console.log("Delete error:", error.response?.data || error);
                            alert("Error: Failed to delete movie");
                        }
                    }
                }
            ]
        );
    };


    const calculateDiscountedPrice = (price, voucherCode) => {
        if (!price || !voucherCode || voucherCode === 'none') return price;
        const discount = discountService.getDiscountByCode(voucherCode);
        if (discount) {
            return price * (1 - (discount.percentage / 100));
        }
        return price;
    };

    const formatCurrency = (amount) => {
        return Math.round(amount).toLocaleString('vi-VN') + ' VND';
    };

    const renderMovie = ({ item }) => {
        // Mock default price if missing for existing movies
        const price = item.price || 95000;
        const voucherCode = item.voucherCode || 'none';
        const discountedPrice = calculateDiscountedPrice(price, voucherCode);
        const hasDiscount = voucherCode !== 'none';
        const discountObj = hasDiscount ? discountService.getDiscountByCode(voucherCode) : null;

        return (
            <View className="bg-white rounded-2xl p-4 mb-5 shadow-md border border-[#e50914]">
                <View className="flex-row items-start mb-4">
                    <View className="w-24 h-36 bg-[#1f1f1f] rounded-xl overflow-hidden border border-[#444] shadow-md">
                        <Image
                            source={{ uri: item.poster || 'https://image.tmdb.org/t/p/w500/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg' }}
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
                                <View className={`ml-2 px-2 py-1 rounded-md bg-[#e50914]/10 border border-[#e50914]/30`}>
                                    <Text className={`text-[10px] font-bold uppercase text-[#e50914]`}>
                                        {voucherCode}
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
                            {hasDiscount ? (
                                <View>
                                    <View className="flex-row items-center">
                                        <Text className="text-xs text-gray-400 line-through font-medium">
                                            {formatCurrency(price)}
                                        </Text>
                                        <Text className="text-[10px] font-bold text-green-600 ml-2">-{discountObj?.percentage}%</Text>
                                    </View>
                                    <Text className="text-lg font-black text-[#e50914]">
                                        {formatCurrency(discountedPrice)}
                                    </Text>
                                </View>
                            ) : (
                                <Text className="text-lg font-black text-gray-900">
                                    {formatCurrency(price)}
                                </Text>
                            )}
                        </View>
                    </View>
                </View>

                <View className="flex-row gap-3">
                    <TouchableOpacity
                        className="flex-1 bg-[#333] py-2.5 rounded-xl flex-row justify-center items-center"
                        onPress={() => navigation.navigate('AddEditMovie', { movie: { ...item, price, voucherCode } })}
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
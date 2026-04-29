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
import BackgroundWrapper from '../components/BackgroundWrapper';
import AnimatedCard from '../components/AnimatedCard';
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

    const formatCurrency = (amount) => {
        return Math.round(amount).toLocaleString('vi-VN') + ' VND';
    };

    const renderMovie = ({ item, index }) => {
        const price = item.price || 0;
        const availableDiscounts = item.availableDiscounts || [];
        const hasDiscount = availableDiscounts.length > 0;

        return (
            <AnimatedCard index={index}>
            <View className="bg-black/40 rounded-[32px] p-5 mb-6 shadow-2xl border border-white/10">
                <View className="flex-row items-start mb-5">
                    <View className="w-24 h-36 bg-black rounded-2xl overflow-hidden border border-white/10 shadow-lg">
                        <Image
                            source={{ uri: item.poster || 'https://via.placeholder.com/300x450?text=No+Poster' }}
                            className="w-full h-full"
                            resizeMode="cover"
                        />
                    </View>
                    <View className="flex-1 ml-5">
                        <View className="flex-row justify-between items-start mb-2">
                            <Text className="text-xl font-black text-white italic tracking-tighter flex-1" numberOfLines={2}>
                                {item.title}
                            </Text>
                            {hasDiscount && (
                                <View className="ml-2 px-2 py-1 rounded-lg bg-[#c04444]/10 border border-[#c04444]/30">
                                    <Text className="text-[8px] font-black uppercase text-[#c04444] tracking-widest">
                                        Voucher
                                    </Text>
                                </View>
                            )}
                        </View>

                        <View className="flex-row items-center mb-4">
                            <View className="bg-white/5 px-2 py-1 rounded-lg border border-white/10 mr-3">
                                <Text className="text-gray-400 font-black text-[9px] uppercase tracking-widest">{item.genre}</Text>
                            </View>
                            <View className="flex-row items-center">
                                <Clock color="#c04444" size={12} />
                                <Text className="text-[10px] text-gray-400 ml-1.5 font-black uppercase tracking-widest">{item.duration}m</Text>
                            </View>
                        </View>

                        <View className="mt-1">
                            <Text className="text-xl font-black text-white italic">
                                {formatCurrency(price)}
                            </Text>
                        </View>
                    </View>
                </View>

                <View className="flex-row gap-3">
                    <TouchableOpacity
                        className="flex-1 bg-white/5 border border-white/10 py-3 rounded-2xl flex-row justify-center items-center"
                        onPress={() => navigation.navigate('AddEditMovie', { movie: item })}
                    >
                        <Edit color="#fff" size={16} />
                        <Text className="text-white font-black ml-2 uppercase tracking-widest text-[10px]">Edit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        className="flex-1 bg-[#c04444] py-3 rounded-2xl flex-row justify-center items-center shadow-lg shadow-[#c04444]/20"
                        onPress={() => handleDelete(item._id, item.title)}
                    >
                        <Trash2 color="#fff" size={16} />
                        <Text className="text-white font-black ml-2 uppercase tracking-widest text-[10px]">Delete</Text>
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
                title="Movies"
                showBack={true}
                rightButtons={[
                    { title: "NEW", onPress: () => navigation.navigate('AddEditMovie', {}) }
                ]}
            />

            <FlatList
                data={movies}
                renderItem={({ item, index }) => renderMovie({ item, index })}
                keyExtractor={(item) => item._id}
                contentContainerClassName="px-4 py-8 pb-32"
            />

            <Navbar />
        </BackgroundWrapper>
    );
}

import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Tag, Edit, Trash2, Calendar, Plus } from 'lucide-react-native';
import AdminHeader from '../components/AdminHeader';
import EmptyState from '../components/EmptyState';
import Navbar from '../components/Navbar';
import * as discountService from '../services/discountService';

export default function DiscountManagementScreen({ navigation }) {
    const [discounts, setDiscounts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadDiscounts();
    }, []);

    const loadDiscounts = async () => {
        try {
            const response = await discountService.getDiscounts();
            setDiscounts(response.data.data);
        } catch (error) {
            console.error('Failed to load discounts:', error);
        } finally {
            setLoading(false);
        }
    };


    const renderDiscount = ({ item }) => {
        const isExpired = new Date(item.expiryDate) < new Date();

        return (
            <View className={`bg-white rounded-2xl p-5 mb-5 shadow-md border ${isExpired ? 'border-red-500/50' : 'border-[#e50914]'}`}>
                <View className="flex-row justify-between items-start mb-3">
                    <View className="flex-1 pr-3">
                        <View className="flex-row items-center mb-2">
                            <Tag color={isExpired ? "#ef4444" : "#4caf50"} size={24} />
                            <Text className={`text-2xl font-extrabold ml-3 tracking-tight ${isExpired ? 'text-red-400' : 'text-gray-900'}`}>
                                {item.code}
                            </Text>
                        </View>

                        <View className="flex-row items-center">
                            <Calendar color="#6b7280" size={18} />
                            <Text className="text-base text-gray-600 ml-2.5 font-medium">
                                Expires: {new Date(item.expiryDate).toLocaleDateString()}
                            </Text>
                        </View>
                    </View>
                    <View className={`px-4 py-2 rounded-lg border flex-row items-center ${isExpired ? 'bg-red-500/10 border-red-500/20' : 'bg-[#e50914]/10 border-[#e50914]/20'}`}>
                        <Text className={`font-bold text-xl ${isExpired ? 'text-red-400' : 'text-[#e50914]'}`}>
                            {item.percentage}% OFF
                        </Text>
                    </View>
                </View>

                <View className="flex-row gap-3 mt-2">
                    <TouchableOpacity
                        className="flex-1 bg-[#333] py-2.5 rounded-xl flex-row justify-center items-center"
                        onPress={() => { }}
                    >
                        <Edit color="#fff" size={18} />
                        <Text className="text-white font-bold ml-2">Edit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        className="flex-1 bg-[#e50914] py-2.5 rounded-xl flex-row justify-center items-center"
                        onPress={() => { }}
                    >
                        <Trash2 color="#fff" size={18} />
                        <Text className="text-white font-bold ml-2">Delete</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    return (
        <View className="flex-1 bg-gray-50">
            <AdminHeader title="Discount Management" showBack={true} />
            <Navbar />
            <FlatList
                data={discounts}
                renderItem={renderDiscount}
                keyExtractor={(item, index) => index.toString()}
                contentContainerClassName="px-3 py-4 flex-grow"
                ListEmptyComponent={<EmptyState message="No discounts found" />}
            />
            <View className="absolute bottom-6 w-full items-center flex-1 z-50">
                <TouchableOpacity
                    className="flex-row items-center bg-[#e50914] px-6 py-3.5 rounded-full"
                    style={{ shadowColor: '#e50914', shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.4, shadowRadius: 8, elevation: 10 }}
                    onPress={() => { }}
                >
                    <Plus color="#fff" size={28} strokeWidth={3} />
                    <Text className="text-white font-extrabold ml-3 text-xl uppercase tracking-widest">Add Discount</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

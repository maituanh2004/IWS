import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Alert, Modal, TextInput, ScrollView } from 'react-native';
import { Tag, Edit, Trash2, Calendar, Plus, X } from 'lucide-react-native';
import AdminHeader from '../components/AdminHeader';
import EmptyState from '../components/EmptyState';
import Navbar from '../components/Navbar';
import * as discountService from '../services/discountService';

export default function DiscountManagementScreen({ navigation }) {
    const [discounts, setDiscounts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [editingDiscount, setEditingDiscount] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    // Form states
    const [code, setCode] = useState('');
    const [percentage, setPercentage] = useState('');
    const [minPrice, setMinPrice] = useState('0');
    const [expiryDate, setExpiryDate] = useState('');
    const [type, setType] = useState('custom');

    useEffect(() => {
        loadDiscounts();
    }, []);

    const loadDiscounts = async () => {
        try {
            const response = await discountService.getDiscounts();
            setDiscounts(response.data.data);
        } catch (error) {
            console.error('Failed to load discounts:', error);
            Alert.alert('Error', 'Failed to load discounts');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id, code) => {
        Alert.alert(
            'Delete Discount',
            `Are you sure you want to delete ${code}?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await discountService.deleteDiscount(id);
                            loadDiscounts();
                            Alert.alert('Success', 'Discount deleted');
                        } catch (error) {
                            Alert.alert('Error', 'Failed to delete discount');
                        }
                    },
                },
            ]
        );
    };

    const openModal = (discount = null) => {
        if (discount) {
            setEditingDiscount(discount);
            setCode(discount.code);
            setPercentage(discount.percentage.toString());
            setMinPrice(discount.minPrice.toString());
            setExpiryDate(new Date(discount.expiryDate).toISOString().split('T')[0]);
            setType(discount.type);
        } else {
            setEditingDiscount(null);
            setCode('');
            setPercentage('');
            setMinPrice('0');
            setExpiryDate(new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]);
            setType('custom');
        }
        setModalVisible(true);
    };

    const handleSave = async () => {
        if (!code || !percentage || !expiryDate) {
            Alert.alert('Error', 'Please fill in required fields');
            return;
        }

        const data = {
            code: code.toUpperCase(),
            percentage: parseInt(percentage),
            minPrice: parseInt(minPrice),
            expiryDate: new Date(expiryDate),
            type
        };

        setSubmitting(true);
        try {
            if (editingDiscount) {
                await discountService.updateDiscount(editingDiscount._id, data);
                Alert.alert('Success', 'Discount updated');
            } else {
                await discountService.createDiscount(data);
                Alert.alert('Success', 'Discount created');
            }
            setModalVisible(false);
            loadDiscounts();
        } catch (error) {
            Alert.alert('Error', error.response?.data?.error || 'Failed to save discount');
        } finally {
            setSubmitting(false);
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

                        <View className="flex-row items-center mb-1">
                            <Calendar color="#6b7280" size={18} />
                            <Text className="text-base text-gray-600 ml-2.5 font-medium">
                                Expires: {new Date(item.expiryDate).toLocaleDateString()}
                            </Text>
                        </View>
                        <Text className="text-xs text-gray-400 font-bold uppercase ml-7">
                            Min Price: {Math.round(item.minPrice).toLocaleString()} VND
                        </Text>
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
                        onPress={() => openModal(item)}
                    >
                        <Edit color="#fff" size={18} />
                        <Text className="text-white font-bold ml-2">Edit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        className="flex-1 bg-[#e50914] py-2.5 rounded-xl flex-row justify-center items-center"
                        onPress={() => handleDelete(item._id, item.code)}
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
            
            {loading ? (
                <View className="flex-1 justify-center items-center">
                    <ActivityIndicator size="large" color="#e50914" />
                </View>
            ) : (
                <FlatList
                    data={discounts}
                    renderItem={renderDiscount}
                    keyExtractor={(item) => item._id}
                    contentContainerClassName="px-3 py-4 flex-grow"
                    ListEmptyComponent={<EmptyState message="No discounts found" />}
                />
            )}

            <View className="absolute bottom-6 w-full items-center z-40">
                <TouchableOpacity
                    className="flex-row items-center bg-[#e50914] px-6 py-3.5 rounded-full"
                    style={{ shadowColor: '#e50914', shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.4, shadowRadius: 8, elevation: 10 }}
                    onPress={() => openModal()}
                >
                    <Plus color="#fff" size={28} strokeWidth={3} />
                    <Text className="text-white font-extrabold ml-3 text-xl uppercase tracking-widest">Add Discount</Text>
                </TouchableOpacity>
            </View>

            {/* Add/Edit Modal */}
            <Modal visible={modalVisible} animationType="slide" transparent={true}>
                <View className="flex-1 justify-end bg-black/50">
                    <View className="bg-white rounded-t-3xl p-6 h-[80%]">
                        <View className="flex-row justify-between items-center mb-6">
                            <Text className="text-2xl font-black text-gray-900">{editingDiscount ? 'Edit Discount' : 'New Discount'}</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)} className="p-2 bg-gray-100 rounded-full">
                                <X color="#333" size={20} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false}>
                            <Text className="text-base font-bold text-gray-900 mb-2">Voucher Code*</Text>
                            <TextInput 
                                className="bg-gray-50 p-4 rounded-xl border border-gray-100 text-gray-900 font-bold mb-4"
                                value={code} onChangeText={setCode} placeholder="e.g. SUMMER50" autoCapitalize="characters"
                            />

                            <View className="flex-row gap-4 mb-4">
                                <View className="flex-1">
                                    <Text className="text-base font-bold text-gray-900 mb-2">Discount %*</Text>
                                    <TextInput 
                                        className="bg-gray-50 p-4 rounded-xl border border-gray-100 text-gray-900 font-bold"
                                        value={percentage} onChangeText={setPercentage} keyboardType="numeric" placeholder="15"
                                    />
                                </View>
                                <View className="flex-1">
                                    <Text className="text-base font-bold text-gray-900 mb-2">Min Price (VND)</Text>
                                    <TextInput 
                                        className="bg-gray-50 p-4 rounded-xl border border-gray-100 text-gray-900 font-bold"
                                        value={minPrice} onChangeText={setMinPrice} keyboardType="numeric" placeholder="100000"
                                    />
                                </View>
                            </View>

                            <Text className="text-base font-bold text-gray-900 mb-2">Expiry Date* (YYYY-MM-DD)</Text>
                            <TextInput 
                                className="bg-gray-50 p-4 rounded-xl border border-gray-100 text-gray-900 font-bold mb-6"
                                value={expiryDate} onChangeText={setExpiryDate} placeholder="2024-12-31"
                            />

                            <TouchableOpacity 
                                className="bg-[#e50914] p-5 rounded-2xl items-center shadow-lg" 
                                onPress={handleSave} 
                                disabled={submitting}
                            >
                                {submitting ? <ActivityIndicator color="#fff" /> : <Text className="text-white text-lg font-black uppercase tracking-tighter">{editingDiscount ? 'Update' : 'Create'}</Text>}
                            </TouchableOpacity>
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

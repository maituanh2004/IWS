import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Alert, Modal, TextInput, ScrollView } from 'react-native';
import { Tag, Edit, Trash2, Calendar, Plus, X } from 'lucide-react-native';
import AdminHeader from '../components/AdminHeader';
import EmptyState from '../components/EmptyState';
import Navbar from '../components/Navbar';
import BackgroundWrapper from '../components/BackgroundWrapper';
import * as discountService from '../services/discountService';
import { BlurView } from 'expo-blur';
import AnimatedCard from '../components/AnimatedCard';

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
            navigation.navigate('SystemError');
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


    const renderDiscount = ({ item, index }) => {
        const isExpired = new Date(item.expiryDate) < new Date();

        return (
            <AnimatedCard index={index}>
                <View className={`bg-black/40 rounded-[32px] p-6 mb-6 shadow-2xl border ${isExpired ? 'border-red-500/20' : 'border-white/10'}`}>
                    <View className="flex-row justify-between items-start mb-4">
                        <View className="flex-1 pr-3">
                            <View className="flex-row items-center mb-3">
                                <Tag color={isExpired ? "#ef4444" : "#c04444"} size={22} />
                                <Text className={`text-2xl font-black ml-3 tracking-tighter italic ${isExpired ? 'text-red-400' : 'text-white'}`}>
                                    {item.code}
                                </Text>
                            </View>

                            <View className="flex-row items-center mb-2">
                                <Calendar color="#6b7280" size={14} />
                                <Text className="text-[10px] text-gray-400 ml-2 font-black uppercase tracking-widest">
                                    Valid until: {new Date(item.expiryDate).toLocaleDateString()}
                                </Text>
                            </View>
                            <Text className="text-[10px] text-[#c04444] font-black uppercase ml-6 tracking-[2px]">
                                Min Invest: {Math.round(item.minPrice).toLocaleString()} VND
                            </Text>
                        </View>
                        <View className={`px-4 py-3 rounded-2xl border flex-row items-center ${isExpired ? 'bg-red-500/10 border-red-500/20' : 'bg-[#c04444]/10 border-[#c04444]/20'}`}>
                            <Text className={`font-black text-xl italic ${isExpired ? 'text-red-400' : 'text-[#c04444]'}`}>
                                -{item.percentage}%
                            </Text>
                        </View>
                    </View>

                    <View className="flex-row gap-3 mt-4">
                        <TouchableOpacity
                            className="flex-1 bg-white/5 border border-white/10 py-3 rounded-2xl flex-row justify-center items-center"
                            onPress={() => openModal(item)}
                        >
                            <Edit color="#fff" size={16} />
                            <Text className="text-white font-black ml-2 uppercase tracking-widest text-[10px]">Edit</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            className="flex-1 bg-[#c04444] py-3 rounded-2xl flex-row justify-center items-center shadow-lg shadow-[#c04444]/20"
                            onPress={() => handleDelete(item._id, item.code)}
                        >
                            <Trash2 color="#fff" size={16} />
                            <Text className="text-white font-black ml-2 uppercase tracking-widest text-[10px]">Delete</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </AnimatedCard>
        );
    };

    return (
        <BackgroundWrapper>
            <AdminHeader 
                title="Vouchers" 
                showBack={true} 
                rightButtons={[
                    { title: "NEW", onPress: () => openModal() }
                ]}
            />
            
            {loading ? (
                <View className="flex-1 justify-center items-center">
                    <ActivityIndicator size="large" color="#c04444" />
                </View>
            ) : (
                <FlatList
                    data={discounts}
                    renderItem={({ item, index }) => renderDiscount({ item, index })}
                    keyExtractor={(item) => item._id}
                    contentContainerClassName="px-4 py-8 pb-32 flex-grow"
                    ListEmptyComponent={<EmptyState message="No vouchers found" />}
                />
            )}

            <Navbar />

            <Modal visible={modalVisible} animationType="slide" transparent={true}>
                <View className="flex-1 justify-end bg-black/60">
                    <View className="rounded-t-[40px] p-8 h-[80%] border-t border-white/10 bg-[#121212]">
                        <View className="flex-row justify-between items-center mb-8">
                            <Text className="text-3xl font-black text-white italic tracking-tighter uppercase">Voucher Info</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)} className="p-3 bg-white/5 rounded-2xl border border-white/10">
                                <X color="#fff" size={20} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false}>
                            <Text className="text-xs font-black text-gray-500 mb-3 uppercase tracking-widest ml-1">Voucher Code*</Text>
                            <TextInput 
                                className="bg-white/5 p-5 rounded-2xl border border-white/10 text-white font-black italic mb-6 focus:border-[#c04444]"
                                value={code} onChangeText={setCode} placeholder="e.g. SUMMER50" autoCapitalize="characters" placeholderTextColor="#4b5563"
                            />

                            <View className="flex-row gap-4 mb-6">
                                <View className="flex-1">
                                    <Text className="text-xs font-black text-gray-500 mb-3 uppercase tracking-widest ml-1">Discount %*</Text>
                                    <TextInput 
                                        className="bg-white/5 p-5 rounded-2xl border border-white/10 text-white font-black italic focus:border-[#c04444]"
                                        value={percentage} onChangeText={setPercentage} keyboardType="numeric" placeholder="15" placeholderTextColor="#4b5563"
                                    />
                                </View>
                                <View className="flex-1">
                                    <Text className="text-xs font-black text-gray-500 mb-3 uppercase tracking-widest ml-1">Min Price (VND)</Text>
                                    <TextInput 
                                        className="bg-white/5 p-5 rounded-2xl border border-white/10 text-white font-black italic focus:border-[#c04444]"
                                        value={minPrice} onChangeText={setMinPrice} keyboardType="numeric" placeholder="100000" placeholderTextColor="#4b5563"
                                    />
                                </View>
                            </View>

                            <Text className="text-xs font-black text-gray-500 mb-3 uppercase tracking-widest ml-1">Expiry Date* (YYYY-MM-DD)</Text>
                            <TextInput 
                                className="bg-white/5 p-5 rounded-2xl border border-white/10 text-white font-black italic mb-10 focus:border-[#c04444]"
                                value={expiryDate} onChangeText={setExpiryDate} placeholder="2024-12-31" placeholderTextColor="#4b5563"
                            />

                            <TouchableOpacity 
                                className="bg-[#c04444] p-6 rounded-[24px] items-center shadow-2xl shadow-[#c04444]/40" 
                                onPress={handleSave} 
                                disabled={submitting}
                            >
                                {submitting ? <ActivityIndicator color="#fff" /> : <Text className="text-white text-lg font-black uppercase italic tracking-widest">{editingDiscount ? 'Update Voucher' : 'Create Voucher'}</Text>}
                            </TouchableOpacity>
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </BackgroundWrapper>
    );
}

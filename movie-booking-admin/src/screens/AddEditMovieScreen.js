import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
    Image,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import * as discountService from '../services/discountService';
import * as movieService from '../services/movieService';
import AdminHeader from '../components/AdminHeader';
import BackgroundWrapper from '../components/BackgroundWrapper';

export default function AddEditMovieScreen({ route, navigation }) {
    const { movie } = route.params || {};
    const isEdit = !!movie;

    const [title, setTitle] = useState(movie?.title || '');
    const [description, setDescription] = useState(movie?.description || '');
    const [poster, setPoster] = useState(movie?.poster || '');
    const [duration, setDuration] = useState(movie?.duration?.toString() || '');
    const [genre, setGenre] = useState(movie?.genre || '');
    const [releaseDate, setReleaseDate] = useState(
        movie?.releaseDate ? new Date(movie.releaseDate).toISOString().split('T')[0] : ''
    );
    const [price, setPrice] = useState(movie?.price?.toString() || '');
    const [availableVouchers, setAvailableVouchers] = useState(movie?.availableVouchers || []);
    const [discounts, setDiscounts] = useState([]);
    const [loading, setLoading] = useState(false);

    // Focus Refs
    const descRef = useRef(null);
    const priceRef = useRef(null);
    const posterRef = useRef(null);
    const durationRef = useRef(null);
    const genreRef = useRef(null);
    const releaseDateRef = useRef(null);

    useEffect(() => {
        loadDiscounts();
    }, []);

    const loadDiscounts = async () => {
        try {
            const response = await discountService.getDiscounts();
            const activeDiscounts = response.data.data.filter(d => new Date(d.expiryDate) > new Date());
            setDiscounts(activeDiscounts);
        } catch (error) {
            console.error('Failed to load discounts:', error);
        }
    };

    const handleSave = async () => {
        if (!title || !description || !duration || !genre || !releaseDate || !price) {
            alert('Error: Please fill in all fields including price');
            return;
        }

        const movieData = {
            title,
            description,
            poster: poster || undefined,
            duration: parseInt(duration),
            genre,
            releaseDate: new Date(releaseDate),
            price: parseInt(price),
            availableVouchers: availableVouchers
        };

        setLoading(true);
        try {
            if (isEdit) {
                await movieService.updateMovie(movie._id, movieData);
                alert('Success: Movie updated');
            } else {
                await movieService.createMovie(movieData);
                alert('Success: Movie created');
            }
            navigation.goBack();
        } catch (error) {
            alert('Error: ' + (error.response?.data?.message || 'Failed to save movie'));
        } finally {
            setLoading(false);
        }
    };

    const isVoucherEligible = (discount) => {
        if (!discount || discount.code === 'none') return true;
        const currentPrice = parseInt(price) || 0;
        return currentPrice >= (discount.minPrice || 0);
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ flex: 1 }}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
        >
            <BackgroundWrapper>
                <AdminHeader title={isEdit ? 'Edit Movie' : 'New Movie'} showClose={true} />
                
                <ScrollView className="flex-1" contentContainerClassName="p-6 pb-20">
                    <Text className="text-[10px] font-black text-gray-500 mb-3 uppercase tracking-widest ml-1">Movie Title*</Text>
                    <TextInput 
                        className="bg-white/5 text-white p-5 rounded-2xl border border-white/10 font-black italic mb-6 focus:border-[#c04444]" 
                        value={title} 
                        onChangeText={setTitle} 
                        placeholder="e.g. Inception" 
                        placeholderTextColor="#4b5563"
                        returnKeyType="next"
                        onSubmitEditing={() => descRef.current?.focus()}
                        blurOnSubmit={false}
                    />

                    <Text className="text-[10px] font-black text-gray-500 mb-3 uppercase tracking-widest ml-1">Description*</Text>
                    <TextInput 
                        ref={descRef}
                        className="bg-white/5 text-white p-5 rounded-2xl border border-white/10 font-black italic mb-6 h-32 text-top focus:border-[#c04444]" 
                        value={description} 
                        onChangeText={setDescription} 
                        placeholder="Write something compelling..." 
                        placeholderTextColor="#4b5563" 
                        multiline 
                        numberOfLines={4} 
                    />

                    <Text className="text-[10px] font-black text-gray-500 mb-3 uppercase tracking-widest ml-1">Base Price (VND)*</Text>
                    <TextInput 
                        ref={priceRef}
                        className="bg-white/5 text-white p-5 rounded-2xl border border-white/10 font-black italic mb-6 focus:border-[#c04444]" 
                        value={price} 
                        onChangeText={setPrice} 
                        placeholder="e.g. 120000" 
                        placeholderTextColor="#4b5563" 
                        keyboardType="numeric"
                    />

                    <Text className="text-[10px] font-black text-gray-500 mb-4 uppercase tracking-widest ml-1">Eligible Vouchers</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row mb-8">
                        <TouchableOpacity
                            onPress={() => setAvailableVouchers([])}
                            className={`py-4 px-8 mr-3 rounded-2xl items-center border ${availableVouchers.length === 0
                                    ? 'bg-[#c04444] border-[#c04444] shadow-lg shadow-[#c04444]/30'
                                    : 'bg-white/5 border-white/10'
                                }`}
                        >
                            <Text className={`font-black text-[10px] uppercase tracking-widest ${availableVouchers.length === 0 ? 'text-white' : 'text-gray-500'}`}>
                                None
                            </Text>
                        </TouchableOpacity>

                        {discounts.map((discount) => {
                            const eligible = isVoucherEligible(discount);
                            const isSelected = availableVouchers.includes(discount.code);
                            
                            const toggleVoucher = () => {
                                if (isSelected) {
                                    setAvailableVouchers(prev => prev.filter(c => c !== discount.code));
                                } else {
                                    setAvailableVouchers(prev => [...prev, discount.code]);
                                }
                            };

                            return (
                                <TouchableOpacity
                                    key={discount._id}
                                    onPress={() => eligible && toggleVoucher()}
                                    className={`py-4 px-6 mr-3 rounded-2xl items-center border ${isSelected
                                            ? 'bg-[#c04444] border-[#c04444] shadow-lg shadow-[#c04444]/30'
                                            : eligible
                                                ? 'bg-white/5 border-white/10'
                                                : 'bg-transparent border-red-900/20 opacity-30'
                                        }`}
                                >
                                    <Text className={`font-black text-[10px] uppercase tracking-widest ${isSelected ? 'text-white' : eligible ? 'text-white/60' : 'text-red-500'}`}>
                                        {discount.code} (-{discount.percentage}%)
                                    </Text>
                                    {!eligible && (
                                        <Text className="text-[7px] text-red-500 mt-1 font-black">Min {discount.minPrice / 1000}K</Text>
                                    )}
                                </TouchableOpacity>
                            );
                        })}
                    </ScrollView>

                    <Text className="text-[10px] font-black text-gray-500 mb-3 uppercase tracking-widest ml-1">Poster URL</Text>
                    <TextInput 
                        ref={posterRef}
                        className="bg-white/5 text-white p-5 rounded-2xl border border-white/10 font-black italic mb-6 focus:border-[#c04444]" 
                        value={poster} 
                        onChangeText={setPoster} 
                        placeholder="https://..." 
                        placeholderTextColor="#4b5563"
                    />

                    {poster ? (
                        <View className="mb-8 items-center">
                            <Image
                                source={{ uri: poster }}
                                className="w-48 h-72 rounded-[32px] border border-white/10 shadow-2xl"
                                resizeMode="cover"
                            />
                        </View>
                    ) : null}

                    <View className="flex-row gap-4 mb-6">
                        <View className="flex-1">
                            <Text className="text-[10px] font-black text-gray-500 mb-3 uppercase tracking-widest ml-1">Duration (min)*</Text>
                            <TextInput 
                                ref={durationRef}
                                className="bg-white/5 text-white p-5 rounded-2xl border border-white/10 font-black italic focus:border-[#c04444]" 
                                value={duration} 
                                onChangeText={setDuration} 
                                placeholder="120" 
                                placeholderTextColor="#4b5563" 
                                keyboardType="numeric"
                            />
                        </View>
                        <View className="flex-1">
                            <Text className="text-[10px] font-black text-gray-500 mb-3 uppercase tracking-widest ml-1">Genre*</Text>
                            <TextInput 
                                ref={genreRef}
                                className="bg-white/5 text-white p-5 rounded-2xl border border-white/10 font-black italic focus:border-[#c04444]" 
                                value={genre} 
                                onChangeText={setGenre} 
                                placeholder="e.g. Action" 
                                placeholderTextColor="#4b5563"
                            />
                        </View>
                    </View>

                    <Text className="text-[10px] font-black text-gray-500 mb-3 uppercase tracking-widest ml-1">Release Date (YYYY-MM-DD)*</Text>
                    <TextInput 
                        ref={releaseDateRef}
                        className="bg-white/5 text-white p-5 rounded-2xl border border-white/10 font-black italic mb-10 focus:border-[#c04444]" 
                        value={releaseDate} 
                        onChangeText={setReleaseDate} 
                        placeholder="2024-01-01" 
                        placeholderTextColor="#4b5563"
                    />

                    <TouchableOpacity 
                        className="bg-[#c04444] p-6 rounded-[24px] items-center shadow-2xl shadow-[#c04444]/40" 
                        onPress={handleSave} 
                        disabled={loading}
                    >
                        {loading ? <ActivityIndicator color="#fff" /> : <Text className="text-white text-lg font-black uppercase italic tracking-widest">{isEdit ? 'Update Movie' : 'Launch Movie'}</Text>}
                    </TouchableOpacity>
                </ScrollView>
            </BackgroundWrapper>
        </KeyboardAvoidingView>
    );
}
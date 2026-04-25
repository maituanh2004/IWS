import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    ActivityIndicator,
    Image,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import * as api from '../services/api';
import * as discountService from '../services/discountService';
import * as movieService from '../services/movieService';

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
    const [selectedVouchers, setSelectedVouchers] = useState(movie?.availableVouchers || []);
    const [discounts, setDiscounts] = useState([]);
    const [loading, setLoading] = useState(false);

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
            // Only show active discounts
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
            availableVouchers: selectedVouchers
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
            <ScrollView className="flex-1 bg-gray-50">
                <View className="p-5 pb-10">
                    <Text className="text-base font-bold text-gray-900 mt-2 mb-1">Title*</Text>
                    <TextInput
                        className="bg-white text-gray-900 p-4 rounded-lg text-base border border-gray-100"
                        value={title}
                        onChangeText={setTitle}
                        placeholder="Movie title"
                        placeholderTextColor="#9ca3af"
                        returnKeyType="next"
                        onSubmitEditing={() => descRef.current?.focus()}
                        blurOnSubmit={false}
                    />

                    <Text className="text-base font-bold text-gray-900 mt-4 mb-1">Description*</Text>
                    <TextInput
                        ref={descRef}
                        className="bg-white text-gray-900 p-4 rounded-lg text-base h-24 text-top border border-gray-100"
                        value={description}
                        onChangeText={setDescription}
                        placeholder="Movie description"
                        placeholderTextColor="#9ca3af"
                        multiline
                        numberOfLines={4}
                    />

                    <Text className="text-base font-bold text-gray-900 mt-4 mb-1">Price (VND)*</Text>
                    <TextInput
                        ref={priceRef}
                        className="bg-white text-gray-900 p-4 rounded-lg text-base border border-gray-100"
                        value={price}
                        onChangeText={setPrice}
                        placeholder="e.g. 120000"
                        placeholderTextColor="#9ca3af"
                        keyboardType="numeric"
                        returnKeyType="next"
                        onSubmitEditing={() => posterRef.current?.focus()}
                    />

                    <Text className="text-base font-bold text-gray-900 mt-4 mb-2">Available Vouchers (Multi-select)</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row mb-4">
                        <TouchableOpacity
                            onPress={() => setSelectedVouchers([])}
                            className={`py-3 px-6 mr-2 rounded-xl items-center border ${selectedVouchers.length === 0
                                ? 'bg-[#e50914] border-[#e50914]'
                                : 'bg-white border-gray-200'
                                }`}
                        >
                            <Text className={`font-bold text-xs ${selectedVouchers.length === 0 ? 'text-white' : 'text-gray-700'}`}>
                                None
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => {
                                const allCodes = discounts.map(d => d.code);
                                setSelectedVouchers(allCodes);
                            }}
                            className={`py-3 px-6 mr-2 rounded-xl items-center border ${selectedVouchers.length > 0 && selectedVouchers.length === discounts.length
                                ? 'bg-[#e50914] border-[#e50914]'
                                : 'bg-white border-gray-200'
                                }`}
                        >
                            <Text className={`font-bold text-xs ${selectedVouchers.length > 0 && selectedVouchers.length === discounts.length ? 'text-white' : 'text-gray-700'}`}>
                                Select All
                            </Text>
                        </TouchableOpacity>

                        {discounts.map((discount) => {
                            const eligible = isVoucherEligible(discount);
                            const isSelected = selectedVouchers.includes(discount.code);
                            const minPriceK = (discount.minPrice / 1000) + 'K';

                            const toggleVoucher = () => {
                                if (isSelected) {
                                    setSelectedVouchers(prev => prev.filter(code => code !== discount.code));
                                } else {
                                    setSelectedVouchers(prev => [...prev, discount.code]);
                                }
                            };

                            return (
                                <TouchableOpacity
                                    key={discount._id || discount.id}
                                    onPress={toggleVoucher}
                                    className={`py-3 px-4 mr-2 rounded-xl items-center border ${isSelected
                                        ? 'bg-[#e50914] border-[#e50914]'
                                        : 'bg-white border-gray-200'
                                        }`}
                                >
                                    <Text className={`font-bold text-xs ${isSelected ? 'text-white' : 'text-gray-700'}`}>
                                        {discount.code} ({discount.percentage}%)
                                    </Text>
                                    <Text className={`text-[10px] mt-1 ${isSelected ? 'text-white/80' : 'text-gray-400'}`}>
                                        Min {minPriceK}
                                    </Text>
                                    {!eligible && !isSelected && (
                                        <View className="absolute -top-1 -right-1 bg-yellow-500 w-3 h-3 rounded-full border border-white" />
                                    )}
                                </TouchableOpacity>
                            );
                        })}
                    </ScrollView>

                    <Text className="text-base font-bold text-gray-900 mt-2 mb-1">Poster URL</Text>
                    <TextInput
                        ref={posterRef}
                        className="bg-white text-gray-900 p-4 rounded-lg text-base border border-gray-100"
                        value={poster}
                        onChangeText={setPoster}
                        placeholder="https://..."
                        placeholderTextColor="#9ca3af"
                        returnKeyType="next"
                        onSubmitEditing={() => durationRef.current?.focus()}
                    />

                    {poster ? (
                        <View className="mt-3 items-center">
                            <Image
                                source={{ uri: poster }}
                                className="w-32 h-48 rounded-lg border border-gray-100"
                                resizeMode="cover"
                            />
                        </View>
                    ) : null}

                    <Text className="text-base font-bold text-gray-900 mt-4 mb-1">Duration (minutes)*</Text>
                    <TextInput
                        ref={durationRef}
                        className="bg-white text-gray-900 p-4 rounded-lg text-base border border-gray-100"
                        value={duration}
                        onChangeText={setDuration}
                        placeholder="120"
                        placeholderTextColor="#9ca3af"
                        keyboardType="numeric"
                        returnKeyType="next"
                        onSubmitEditing={() => genreRef.current?.focus()}
                    />

                    <Text className="text-base font-bold text-gray-900 mt-4 mb-1">Genre*</Text>
                    <TextInput
                        ref={genreRef}
                        className="bg-white text-gray-900 p-4 rounded-lg text-base border border-gray-100"
                        value={genre}
                        onChangeText={setGenre}
                        placeholder="Action, Comedy, etc."
                        placeholderTextColor="#9ca3af"
                        returnKeyType="next"
                        onSubmitEditing={() => releaseDateRef.current?.focus()}
                    />

                    <Text className="text-base font-bold text-gray-900 mt-4 mb-1">Release Date* (YYYY-MM-DD)</Text>
                    <TextInput
                        ref={releaseDateRef}
                        className="bg-white text-gray-900 p-4 rounded-lg text-base border border-gray-100"
                        value={releaseDate}
                        onChangeText={setReleaseDate}
                        placeholder="2024-01-01"
                        placeholderTextColor="#9ca3af"
                        returnKeyType="go"
                        onSubmitEditing={handleSave}
                    />

                    <TouchableOpacity className="bg-[#e50914] p-4 rounded-lg items-center mt-8" onPress={handleSave} disabled={loading}>
                        {loading ? <ActivityIndicator color="#fff" /> : <Text className="text-white text-base font-bold">{isEdit ? 'Update Movie' : 'Create Movie'}</Text>}
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}
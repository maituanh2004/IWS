import React, { useState, useEffect } from 'react';
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
    const [voucherCode, setVoucherCode] = useState(movie?.voucherCode || 'none');
    const [discounts, setDiscounts] = useState([]);
    const [loading, setLoading] = useState(false);

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
            voucherCode: voucherCode
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
                    <TextInput className="bg-white text-gray-900 p-4 rounded-lg text-base border border-gray-100" value={title} onChangeText={setTitle} placeholder="Movie title" placeholderTextColor="#9ca3af" />

                    <Text className="text-base font-bold text-gray-900 mt-4 mb-1">Description*</Text>
                    <TextInput className="bg-white text-gray-900 p-4 rounded-lg text-base h-24 text-top border border-gray-100" value={description} onChangeText={setDescription} placeholder="Movie description" placeholderTextColor="#9ca3af" multiline numberOfLines={4} />

                    <Text className="text-base font-bold text-gray-900 mt-4 mb-1">Price (VND)*</Text>
                    <TextInput className="bg-white text-gray-900 p-4 rounded-lg text-base border border-gray-100" value={price} onChangeText={setPrice} placeholder="e.g. 120000" placeholderTextColor="#9ca3af" keyboardType="numeric" />

                    <Text className="text-base font-bold text-gray-900 mt-4 mb-2">Apply Voucher</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row mb-4">
                        <TouchableOpacity
                            onPress={() => setVoucherCode('none')}
                            className={`py-3 px-6 mr-2 rounded-xl items-center border ${voucherCode === 'none'
                                    ? 'bg-[#e50914] border-[#e50914]'
                                    : 'bg-white border-gray-200'
                                }`}
                        >
                            <Text className={`font-bold text-xs ${voucherCode === 'none' ? 'text-white' : 'text-gray-700'}`}>
                                None
                            </Text>
                        </TouchableOpacity>

                        {discounts.map((discount) => {
                            const eligible = isVoucherEligible(discount);
                            const isSelected = voucherCode === discount.code;
                            const minPriceK = (discount.minPrice / 1000) + 'K';

                            return (
                                <TouchableOpacity
                                    key={discount.id}
                                    onPress={() => eligible && setVoucherCode(discount.code)}
                                    className={`py-3 px-4 mr-2 rounded-xl items-center border ${isSelected
                                            ? 'bg-[#e50914] border-[#e50914]'
                                            : eligible
                                                ? 'bg-white border-gray-200'
                                                : 'bg-gray-100 border-gray-100 opacity-50'
                                        }`}
                                >
                                    <Text className={`font-bold text-xs ${isSelected ? 'text-white' : eligible ? 'text-gray-700' : 'text-gray-400'}`}>
                                        {discount.code} ({discount.percentage}%)
                                    </Text>
                                    {!eligible && (
                                        <Text className="text-[10px] text-red-500 mt-1">Min {minPriceK}</Text>
                                    )}
                                </TouchableOpacity>
                            );
                        })}
                    </ScrollView>

                    <Text className="text-base font-bold text-gray-900 mt-2 mb-1">Poster URL</Text>
                    <TextInput className="bg-white text-gray-900 p-4 rounded-lg text-base border border-gray-100" value={poster} onChangeText={setPoster} placeholder="https://..." placeholderTextColor="#9ca3af" />

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
                    <TextInput className="bg-white text-gray-900 p-4 rounded-lg text-base border border-gray-100" value={duration} onChangeText={setDuration} placeholder="120" placeholderTextColor="#9ca3af" keyboardType="numeric" />

                    <Text className="text-base font-bold text-gray-900 mt-4 mb-1">Genre*</Text>
                    <TextInput className="bg-white text-gray-900 p-4 rounded-lg text-base border border-gray-100" value={genre} onChangeText={setGenre} placeholder="Action, Comedy, etc." placeholderTextColor="#9ca3af" />

                    <Text className="text-base font-bold text-gray-900 mt-4 mb-1">Release Date* (YYYY-MM-DD)</Text>
                    <TextInput className="bg-white text-gray-900 p-4 rounded-lg text-base border border-gray-100" value={releaseDate} onChangeText={setReleaseDate} placeholder="2024-01-01" placeholderTextColor="#9ca3af" />

                    <TouchableOpacity className="bg-[#e50914] p-4 rounded-lg items-center mt-8" onPress={handleSave} disabled={loading}>
                        {loading ? <ActivityIndicator color="#fff" /> : <Text className="text-white text-base font-bold">{isEdit ? 'Update Movie' : 'Create Movie'}</Text>}
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}
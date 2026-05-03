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
import DateTimePicker from '@react-native-community/datetimepicker';
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
    const [selectedDiscounts, setSelectedDiscounts] = useState(movie?.availableDiscounts || []);
    const [discounts, setDiscounts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [dateValue, setDateValue] = useState(movie?.releaseDate ? new Date(movie.releaseDate) : new Date());

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

            const data = response?.data?.data;

            if (!Array.isArray(data)) {
                throw new Error("Invalid discount data");
            }

            const activeDiscounts = data.filter(
                d => new Date(d.expiryDate) > new Date()
            );

            setDiscounts(activeDiscounts);

        } catch (error) {
            console.log("🔥 LOAD ERROR:", error);
            setDiscounts([]); // 🔥 QUAN TRỌNG
            handleApiError(error, navigation);
        }
    };
    const onChangeDate = (event, selectedDate) => {
            setShowDatePicker(false); 
            if (selectedDate) {
                if (selectedDate < new Date()) {
                    alert("Release date cannot be in the past");
                    return;
                }
                setDateValue(selectedDate);
                setReleaseDate(selectedDate.toISOString().split('T')[0]);
            }
        };
    const handleSave = async () => {

        if (!title || !description || !duration || !genre || !releaseDate || !price) {
            alert('Please fill all fields');
            return;
        }

        const parsedPrice = parseInt(price);
        const parsedDuration = parseInt(duration);

        if (isNaN(parsedPrice)) {
            alert("Price must be a valid number");
            return;
        }

        if (isNaN(parsedDuration)) {
            alert("Duration must be a number");
            return;
        }

        // validate date
        const parsedDate = new Date(releaseDate);
        if (isNaN(parsedDate.getTime())) {
            alert("Invalid release date");
            return;
        }

        const movieData = {
            title,
            description,
            duration: parsedDuration,
            genre,
            releaseDate: parsedDate,
            price: parsedPrice,

            // 🔥 FIX POSTER
            ...(poster ? { poster } : {}),

            // 🔥 FIX DISCOUNT (bạn làm đúng rồi)
            availableDiscounts: discounts
                .filter(d => selectedDiscounts.includes(d.code))
                .map(d => d._id)
        };

        console.log("🔥 FINAL PAYLOAD:", movieData);

        setLoading(true);
        try {
            if (isEdit) {
                await movieService.updateMovie(movie._id, movieData);
            } else {
                await movieService.createMovie(movieData);
            }

            alert('Movie created successfully');
            navigation.goBack();

        } catch (error) {
            console.log("🔥 BACKEND ERROR:", error.response?.data);
            alert(error.response?.data?.error || 'Failed to save movie');
        } finally {
            setLoading(false);
        }
    };

    const isDiscountEligible = (discount) => {
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
                <AdminHeader title={isEdit ? 'Edit Movie' : 'New Movie'} showClose />

                <ScrollView className="flex-1" contentContainerClassName="p-6 pb-20">

                    {/* TITLE */}
                    <Text className="text-[10px] font-black text-gray-500 mb-3 uppercase tracking-widest ml-1">
                        Movie Title*
                    </Text>
                    <TextInput
                        className="bg-white/5 text-white p-5 rounded-2xl border border-white/10 mb-6"
                        value={title}
                        onChangeText={setTitle}
                        placeholder="e.g. Inception"
                        placeholderTextColor="#4b5563"
                    />

                    {/* DESCRIPTION */}
                    <Text className="text-[10px] font-black text-gray-500 mb-3 uppercase ml-1">
                        Description*
                    </Text>
                    <TextInput
                        className="bg-white/5 text-white p-5 rounded-2xl border border-white/10 mb-6 h-32"
                        value={description}
                        onChangeText={setDescription}
                        multiline
                    />

                    {/* PRICE */}
                    <Text className="text-[10px] font-black text-gray-500 mb-3 uppercase ml-1">
                        Base Price (VND)*
                    </Text>
                    <TextInput
                        className="bg-white/5 text-white p-5 rounded-2xl border border-white/10 mb-6"
                        value={price}
                        onChangeText={setPrice}
                        keyboardType="numeric"
                    />

                    {/* DISCOUNTS */}
                    <Text className="text-[10px] font-black text-gray-500 mb-4 uppercase ml-1">
                        Eligible Vouchers
                    </Text>

                    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row mb-8">

                        {/* NONE */}
                        <View className={`mr-3 rounded-2xl border ${
                            selectedDiscounts.length === 0
                                ? 'bg-[#c04444] border-[#c04444]'
                                : 'bg-white/5 border-white/10'
                        }`}>
                            <TouchableOpacity
                                onPress={() => setSelectedDiscounts([])}
                                className="py-4 px-8 items-center"
                            >
                                <Text className="text-white text-[10px] font-black uppercase">
                                    None
                                </Text>
                            </TouchableOpacity>
                        </View>

                        {/* SELECT ALL */}
                        <View className="mr-2 rounded-xl border bg-white">
                            <TouchableOpacity
                                onPress={() => {
                                    const allCodes = Array.isArray(discounts)
                                        ? discounts.map(d => d.code)
                                        : [];
                                    setSelectedDiscounts(allCodes);
                                }}
                                className="py-3 px-6 items-center"
                            >
                                <Text className="text-gray-700 text-xs font-bold">
                                    Select All
                                </Text>
                            </TouchableOpacity>
                        </View>

                        {/* LIST */}
                        {Array.isArray(discounts) && discounts.map((discount) => {
                            const eligible = isDiscountEligible(discount);
                            const isSelected = selectedDiscounts?.includes(discount?.code);

                            const toggle = () => {
                                if (isSelected) {
                                    setSelectedDiscounts(prev =>
                                        (prev || []).filter(c => c !== discount.code)
                                    );
                                } else {
                                    setSelectedDiscounts(prev =>
                                        [...(prev || []), discount.code]
                                    );
                                }
                            };

                            return (
                                <View
                                    key={discount?._id || discount?.code || Math.random()}
                                    className={`mr-3 rounded-2xl border ${
                                        isSelected
                                            ? 'bg-[#c04444] border-[#c04444]'
                                            : eligible
                                                ? 'bg-white/5 border-white/10'
                                                : 'opacity-30 border-red-900/20'
                                    }`}>
                                    <TouchableOpacity
                                        onPress={() => eligible && toggle()}
                                        className="py-4 px-6 items-center"
                                    >
                                        <Text className="text-[10px] font-black uppercase text-white">
                                            {discount?.code || 'N/A'} (-{discount?.percentage || 0}%)
                                        </Text>

                                        {!eligible && (
                                            <Text className="text-[7px] text-red-500 mt-1">
                                                Min {discount.minPrice / 1000}K
                                            </Text>
                                        )}
                                    </TouchableOpacity>
                                </View>
                            );
                        })}
                    </ScrollView>

                    {/* POSTER */}
                    <Text className="text-[10px] font-black text-gray-500 mb-3 uppercase tracking-widest ml-1">
                    Poster URL
                    </Text>

                    <TextInput
                    ref={posterRef}
                    className="bg-white/5 text-white p-5 rounded-2xl border border-white/10 mb-6"
                    value={poster}
                    onChangeText={setPoster}
                    placeholder="https://..."
                    placeholderTextColor="#4b5563"
                    />

                    {poster ? (
                    <View className="mb-8 items-center">
                        <Image
                        source={{ uri: poster }}
                        className="w-48 h-72 rounded-[32px]"
                        resizeMode="cover"
                        />
                    </View>
                    ) : null}


                    {/* DURATION + GENRE */}
                    <View className="flex-row gap-4 mb-6">
                    <View className="flex-1">
                        <Text className="text-[10px] font-black text-gray-500 mb-3 uppercase ml-1">
                        Duration (min)*
                        </Text>
                        <TextInput
                        ref={durationRef}
                        className="bg-white/5 text-white p-5 rounded-2xl border border-white/10"
                        value={duration}
                        onChangeText={setDuration}
                        keyboardType="numeric"
                        />
                    </View>

                    <View className="flex-1">
                        <Text className="text-[10px] font-black text-gray-500 mb-3 uppercase ml-1">
                        Genre*
                        </Text>
                        <TextInput
                        ref={genreRef}
                        className="bg-white/5 text-white p-5 rounded-2xl border border-white/10"
                        value={genre}
                        onChangeText={setGenre}
                        />
                    </View>
                    </View>


                    <Text className="text-[10px] font-black text-gray-500 mb-3 uppercase ml-1">
                        Release Date*
                    </Text>
                    <TouchableOpacity 
            onPress={() => setShowDatePicker(true)}
            className="bg-white/5 p-5 rounded-2xl border border-white/10 mb-10 flex-row justify-between items-center"
        >
            <Text className="text-white font-black italic">
                {releaseDate || "Select Date"}
            </Text>
            <Text className="text-gray-400">📅</Text>
        </TouchableOpacity>

        {showDatePicker && (
            <DateTimePicker
                value={dateValue}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={onChangeDate}
            />
        )}

                

                    {/* SAVE BUTTON */}
                    <View className="rounded-[24px] bg-[#c04444]">
                        <TouchableOpacity
                            onPress={handleSave}
                            disabled={loading}
                            className="p-6 items-center"
                        >
                            {loading
                                ? <ActivityIndicator color="#fff" />
                                : <Text className="text-white font-black text-lg">
                                    {isEdit ? 'Update Movie' : 'Launch Movie'}
                                </Text>
                            }
                        </TouchableOpacity>
                    </View>

                </ScrollView>
            </BackgroundWrapper>
        </KeyboardAvoidingView>
    );
}
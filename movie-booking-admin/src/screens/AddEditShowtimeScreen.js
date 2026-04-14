import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Alert,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import * as api from '../services/api';

const ROOMS = Array.from({ length: 10 }, (_, i) => (i + 1).toString());

export default function AddEditShowtimeScreen({ route, navigation }) {
    const { showtime } = route.params || {};
    const isEdit = !!showtime;

    const [movies, setMovies] = useState([]);
    const [selectedMovieId, setSelectedMovieId] = useState(showtime?.movie?._id || '');
    const [startDate, setStartDate] = useState(
        showtime?.startTime ? new Date(showtime.startTime).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
    );
    const [startTime, setStartTime] = useState(
        showtime?.startTime ? new Date(showtime.startTime).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) : '14:00'
    );
    const [endDate, setEndDate] = useState(
        showtime?.endTime ? new Date(showtime.endTime).toISOString().split('T')[0] : ''
    );
    const [endTime, setEndTime] = useState(
        showtime?.endTime ? new Date(showtime.endTime).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) : ''
    );
    const [room, setRoom] = useState(showtime?.room?.toString() || '1');
    const [totalSeats, setTotalSeats] = useState(showtime?.totalSeats?.toString() || '100');
    const [price, setPrice] = useState(showtime?.price?.toString() || '95000');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadMovies();
    }, []);

    // ✨ Auto-calculate end time when movie or start time changes
    useEffect(() => {
        if (selectedMovieId && startDate && startTime) {
            const movie = movies.find(m => m._id === selectedMovieId);
            if (movie && movie.duration) {
                try {
                    const [hours, minutes] = startTime.split(':').map(Number);
                    const start = new Date(startDate);
                    start.setHours(hours, minutes, 0, 0);
                    
                    if (!isNaN(start.getTime())) {
                        const end = new Date(start.getTime() + movie.duration * 60 * 1000);
                        setEndDate(end.toISOString().split('T')[0]);
                        setEndTime(end.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }));
                    }
                } catch (e) {
                    console.log("Error calculating end time", e);
                }
            }
        }
    }, [selectedMovieId, startDate, startTime, movies]);
    
    // ✨ Auto-fill price when movie changes (for new showtimes)
    useEffect(() => {
        if (selectedMovieId && !isEdit && movies.length > 0) {
            const movie = movies.find(m => m._id === selectedMovieId);
            if (movie && movie.price) {
                setPrice(movie.price.toString());
            }
        }
    }, [selectedMovieId, movies, isEdit]);

    const loadMovies = async () => {
        try {
            const response = await api.getMovies();
            setMovies(response.data.data);
            if (!selectedMovieId && response.data.data.length > 0) {
                setSelectedMovieId(response.data.data[0]._id);
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to load movies');
        }
    };

    const handleSave = async () => {
        if (!selectedMovieId || !startDate || !startTime || !endDate || !endTime || !room || !price) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        const showtimeData = {
            movie: selectedMovieId,
            startTime: new Date(`${startDate}T${startTime}:00`),
            endTime: new Date(`${endDate}T${endTime}:00`),
            room: parseInt(room),
            totalSeats: parseInt(totalSeats),
            price: parseFloat(price),
        };

        setLoading(true);
        try {
            if (isEdit) {
                await api.updateShowtime(showtime._id, showtimeData);
                Alert.alert('Success', 'Showtime updated');
            } else {
                await api.createShowtime(showtimeData);
                Alert.alert('Success', 'Showtime created');
            }
            navigation.goBack();
        } catch (error) {
            Alert.alert('Error', error.response?.data?.error || error.response?.data?.message || 'Failed to save showtime');
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ flex: 1 }}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
        >
            <ScrollView className="flex-1 bg-gray-50">
                <View className="p-5">
                    <Text className="text-base font-bold text-gray-900 mt-2 mb-1">Movie*</Text>
                    <View className="bg-white rounded-lg overflow-hidden border border-gray-100">
                        <Picker selectedValue={selectedMovieId} onValueChange={setSelectedMovieId} style={{ color: '#111827' }} dropdownIconColor="#111827">
                            {movies.map((movie) => <Picker.Item key={movie._id} label={`${movie.title} (${movie.duration}m)`} value={movie._id} />)}
                        </Picker>
                    </View>

                    <Text className="text-base font-bold text-gray-900 mt-4 mb-1">Start Date* (YYYY-MM-DD)</Text>
                    <TextInput className="bg-white text-gray-900 p-4 rounded-lg text-base border border-gray-100" value={startDate} onChangeText={setStartDate} placeholder="2024-01-01" placeholderTextColor="#9ca3af" />

                    <Text className="text-base font-bold text-gray-900 mt-4 mb-1">Start Time* (HH:MM)</Text>
                    <TextInput className="bg-white text-gray-900 p-4 rounded-lg text-base border border-gray-100" value={startTime} onChangeText={setStartTime} placeholder="14:30" placeholderTextColor="#9ca3af" />

                    <View className="flex-row gap-4 mt-4">
                        <View className="flex-1">
                            <Text className="text-base font-bold text-gray-900 mb-1">End Date (Auto)</Text>
                            <TextInput 
                                className="bg-gray-100 text-gray-500 p-4 rounded-lg text-base border border-gray-200" 
                                value={endDate} 
                                editable={false}
                                placeholder="Auto-calculated" 
                                placeholderTextColor="#9ca3af" 
                            />
                        </View>
                        <View className="flex-1">
                            <Text className="text-base font-bold text-gray-900 mb-1">End Time (Auto)</Text>
                            <TextInput 
                                className="bg-gray-100 text-gray-500 p-4 rounded-lg text-base border border-gray-200" 
                                value={endTime} 
                                editable={false}
                                placeholder="Auto-calculated" 
                                placeholderTextColor="#9ca3af" 
                            />
                        </View>
                    </View>

                    <Text className="text-base font-bold text-gray-900 mt-4 mb-1">Room* (1-10)</Text>
                    <View className="bg-white rounded-lg overflow-hidden border border-gray-100">
                        <Picker selectedValue={room} onValueChange={setRoom} style={{ color: '#111827' }} dropdownIconColor="#111827">
                            {ROOMS.map((r) => <Picker.Item key={r} label={`Room ${r}`} value={r} />)}
                        </Picker>
                    </View>

                    <Text className="text-base font-bold text-gray-900 mt-4 mb-1">Total Seats*</Text>
                    <TextInput className="bg-white text-gray-900 p-4 rounded-lg text-base border border-gray-100" value={totalSeats} onChangeText={setTotalSeats} keyboardType="numeric" placeholderTextColor="#9ca3af" />

                    <Text className="text-base font-bold text-gray-900 mt-4 mb-1">Price (VND)*</Text>
                    <TextInput className="bg-white text-gray-900 p-4 rounded-lg text-base border border-gray-100" value={price} onChangeText={setPrice} keyboardType="numeric" placeholder="e.g. 95000" placeholderTextColor="#9ca3af" />

                    <TouchableOpacity className="bg-[#e50914] p-4 rounded-lg items-center mt-8 mb-5" onPress={handleSave} disabled={loading}>
                        {loading ? <ActivityIndicator color="#fff" /> : <Text className="text-white text-base font-bold">{isEdit ? 'Update Showtime' : 'Create Showtime'}</Text>}
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}
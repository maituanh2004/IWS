import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    Alert,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import * as movieApi from '../services/movieService';
import * as showtimeApi from '../services/showtimeService';
import AdminHeader from '../components/AdminHeader';
import BackgroundWrapper from '../components/BackgroundWrapper';

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
        showtime?.endTime ? new Date(showtime.endTime).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) : '16:00'
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
            const response = await movieApi.getMovies();
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
            room: room.toString(),
            totalSeats: parseInt(totalSeats),
            price: parseFloat(price),
        };

        setLoading(true);
        try {
            if (isEdit) {
                await showtimeApi.updateShowtime(showtime._id, showtimeData);
                Alert.alert('Success', 'Showtime updated');
            } else {
                await showtimeApi.createShowtime(showtimeData);
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
            <BackgroundWrapper>
                <AdminHeader title={isEdit ? 'Edit Showtime' : 'New Showtime'} showClose={true} />
                
                <ScrollView className="flex-1" contentContainerClassName="p-6 pb-20">
                    <Text className="text-[10px] font-black text-gray-500 mb-3 uppercase tracking-widest ml-1">Select Movie*</Text>
                    <View className="bg-white/5 rounded-2xl overflow-hidden border border-white/10 mb-6">
                        <Picker 
                            selectedValue={selectedMovieId} 
                            onValueChange={setSelectedMovieId} 
                            style={{ color: '#fff' }} 
                            dropdownIconColor="#fff"
                        >
                            {movies.map((movie) => <Picker.Item key={movie._id} label={`${movie.title} (${movie.duration}m)`} value={movie._id} color={Platform.OS === 'ios' ? '#fff' : '#111827'} />)}
                        </Picker>
                    </View>

                    <Text className="text-[10px] font-black text-gray-500 mb-3 uppercase tracking-widest ml-1">Start Date* (YYYY-MM-DD)</Text>
                    <TextInput className="bg-white/5 text-white p-5 rounded-2xl border border-white/10 font-black italic mb-6 focus:border-[#c04444]" value={startDate} onChangeText={setStartDate} placeholder="2024-01-01" placeholderTextColor="#4b5563" />

                    <Text className="text-[10px] font-black text-gray-500 mb-3 uppercase tracking-widest ml-1">Start Time* (HH:MM)</Text>
                    <TextInput className="bg-white/5 text-white p-5 rounded-2xl border border-white/10 font-black italic mb-6 focus:border-[#c04444]" value={startTime} onChangeText={setStartTime} placeholder="14:30" placeholderTextColor="#4b5563" />

                    <View className="flex-row gap-4 mb-6">
                        <View className="flex-1">
                            <Text className="text-[10px] font-black text-gray-400 mb-3 uppercase tracking-widest ml-1">End Date (Auto)</Text>
                            <TextInput 
                                className="bg-white/5 text-white/40 p-5 rounded-2xl border border-white/5 font-black italic" 
                                value={endDate} 
                                editable={false}
                                placeholder="Auto" 
                                placeholderTextColor="#4b5563" 
                            />
                        </View>
                        <View className="flex-1">
                            <Text className="text-[10px] font-black text-gray-400 mb-3 uppercase tracking-widest ml-1">End Time (Auto)</Text>
                            <TextInput 
                                className="bg-white/5 text-white/40 p-5 rounded-2xl border border-white/5 font-black italic" 
                                value={endTime} 
                                editable={false}
                                placeholder="Auto" 
                                placeholderTextColor="#4b5563" 
                            />
                        </View>
                    </View>

                    <Text className="text-[10px] font-black text-gray-500 mb-3 uppercase tracking-widest ml-1">Theater Room*</Text>
                    <View className="bg-white/5 rounded-2xl overflow-hidden border border-white/10 mb-6">
                        <Picker 
                            selectedValue={room} 
                            onValueChange={setRoom} 
                            style={{ color: '#fff' }} 
                            dropdownIconColor="#fff"
                        >
                            {ROOMS.map((r) => <Picker.Item key={r} label={`Room ${r}`} value={r} color={Platform.OS === 'ios' ? '#fff' : '#111827'} />)}
                        </Picker>
                    </View>

                    <View className="flex-row gap-4 mb-10">
                        <View className="flex-1">
                            <Text className="text-[10px] font-black text-gray-500 mb-3 uppercase tracking-widest ml-1">Total Seats*</Text>
                            <TextInput className="bg-white/5 text-white p-5 rounded-2xl border border-white/10 font-black italic focus:border-[#c04444]" value={totalSeats} onChangeText={setTotalSeats} keyboardType="numeric" placeholderTextColor="#4b5563" />
                        </View>
                        <View className="flex-1">
                            <Text className="text-[10px] font-black text-gray-500 mb-3 uppercase tracking-widest ml-1">Price (VND)*</Text>
                            <TextInput className="bg-white/5 text-white p-5 rounded-2xl border border-white/10 font-black italic focus:border-[#c04444]" value={price} onChangeText={setPrice} keyboardType="numeric" placeholder="95000" placeholderTextColor="#4b5563" />
                        </View>
                    </View>

                    <TouchableOpacity 
                        className="bg-[#c04444] p-6 rounded-[24px] items-center shadow-2xl shadow-[#c04444]/40 mb-10" 
                        onPress={handleSave} 
                        disabled={loading}
                    >
                        {loading ? <ActivityIndicator color="#fff" /> : <Text className="text-white text-lg font-black uppercase italic tracking-widest">{isEdit ? 'Update Schedule' : 'Create Schedule'}</Text>}
                    </TouchableOpacity>
                </ScrollView>
            </BackgroundWrapper>
        </KeyboardAvoidingView>
    );
}
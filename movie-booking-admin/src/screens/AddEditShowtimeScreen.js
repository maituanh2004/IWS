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
    FlatList
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import * as movieApi from '../services/movieService';
import * as showtimeApi from '../services/showtimeService';
import AdminHeader from '../components/AdminHeader';
import BackgroundWrapper from '../components/BackgroundWrapper';
import DateTimePicker from '@react-native-community/datetimepicker';

const ROOMS = Array.from({ length: 10 }, (_, i) => (i + 1).toString());

export default function AddEditShowtimeScreen({ route, navigation }) {
    const { showtime } = route.params || {};
    const isEdit = !!showtime;
    const [showMovieDropdown, setShowMovieDropdown] = useState(false);

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
    const [price, setPrice] = useState(showtime?.basePrice?.toString() || '');
    const [loading, setLoading] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);

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
    const [totalSeats, setTotalSeats] = useState(
            (showtime?.totalSeats === 80 || showtime?.totalSeats === 100) 
            ? showtime.totalSeats.toString() 
            : '100'
        );
    const handleSave = async () => {
        if (!selectedMovieId || !startDate || !startTime || !endDate || !endTime || !room || !price) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }
        if (!price || isNaN(price) || Number(price) <= 0) {
            Alert.alert('Error', 'Please enter a valid base price');
            return;
        }

        const showtimeData = {
            movieId: selectedMovieId,
            startTime: new Date(`${startDate}T${startTime}:00`),
            endTime: new Date(`${endDate}T${endTime}:00`),
            roomId: room,
            totalSeats: parseInt(totalSeats),
            basePrice: parseFloat(price),
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
            <AdminHeader
                title={isEdit ? 'Edit Showtime' : 'New Showtime'}
                showClose={true}
            />

            <View style={{ flex: 1 }}>
                <ScrollView
                className="flex-1"
                contentContainerClassName="p-6 pb-20"
                >
                {/* MOVIE */}
                <Text className="text-[10px] font-black text-gray-500 mb-3 uppercase tracking-widest ml-1">
                    Select Movie*
                </Text>

                <View className="relative mb-6">
                    <TouchableOpacity
                    onPress={() => setShowMovieDropdown(!showMovieDropdown)}
                    className="bg-white/5 p-5 rounded-2xl border border-white/10 flex-row justify-between items-center"
                    >
                    <Text className="text-white font-black">
                        {movies.find(m => m._id === selectedMovieId)?.title ||
                        'Select Movie'}
                    </Text>
                    <Text className="text-gray-400">▼</Text>
                    </TouchableOpacity>
                </View>

                {/* START DATE */}
                <TouchableOpacity
                onPress={() => setShowDatePicker(true)}
                className="bg-white/5 p-5 rounded-2xl border border-white/10 mb-6 flex-row justify-between items-center"
                >
                <Text className="text-white font-black italic">
                    {startDate || 'Select Date'}
                </Text>
                <Text className="text-gray-400">📅</Text>
                </TouchableOpacity>

                {showDatePicker && (
                <DateTimePicker
                    value={startDate ? new Date(startDate) : new Date()}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={(event, selectedDate) => {
                    setShowDatePicker(false);

                    if (selectedDate) {
                        setStartDate(selectedDate.toISOString().split('T')[0]);
                    }
                    }}
                />
                )}

                {/* START TIME */}
                <TouchableOpacity
                onPress={() => setShowTimePicker(true)}
                className="bg-white/5 p-5 rounded-2xl border border-white/10 mb-6 flex-row justify-between items-center"
                >
                <Text className="text-white font-black italic">
                    {startTime || 'Select Time'}
                </Text>
                <Text className="text-gray-400">🕒</Text>
                </TouchableOpacity>

                {showTimePicker && (
                <DateTimePicker
                    value={new Date(`${startDate || new Date().toISOString().split('T')[0]}T${startTime || '14:00'}:00`)}
                    mode="time"
                    is24Hour={true}
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={(event, selectedTime) => {
                    setShowTimePicker(false);

                    if (selectedTime) {
                        const h = String(selectedTime.getHours()).padStart(2, '0');
                        const m = String(selectedTime.getMinutes()).padStart(2, '0');
                        setStartTime(`${h}:${m}`);
                    }
                    }}
                />
                )}
                {/* END TIME */}
                <View className="flex-row gap-4 mb-6">
                    <View className="flex-1">
                    <Text className="text-[10px] font-black text-gray-400 mb-3 uppercase tracking-widest ml-1">
                        End Date (Auto)
                    </Text>
                    <TextInput
                        className="bg-white/5 text-white/40 p-5 rounded-2xl border border-white/5 font-black italic"
                        value={endDate}
                        editable={false}
                    />
                    </View>
                    <View className="flex-1">
                    <Text className="text-[10px] font-black text-gray-400 mb-3 uppercase tracking-widest ml-1">
                        End Time (Auto)
                    </Text>
                    <TextInput
                        className="bg-white/5 text-white/40 p-5 rounded-2xl border border-white/5 font-black italic"
                        value={endTime}
                        editable={false}
                    />
                    </View>
                </View>

                {/* ROOM */}
                <Text className="text-[10px] font-black text-gray-500 mb-3 uppercase tracking-widest ml-1">
                    Theater Room*
                </Text>
                <View className="bg-white/5 rounded-2xl overflow-hidden border border-white/10 mb-6">
                    <Picker
                    selectedValue={room}
                    onValueChange={setRoom}
                    style={{ color: '#fff' }}
                    >
                    {ROOMS.map(r => (
                        <Picker.Item
                        key={r}
                        label={`Room ${r}`}
                        value={r}
                        />
                    ))}
                    </Picker>
                </View>

            <View className="flex-1">
                <Text className="text-[10px] font-black text-gray-500 mb-3 uppercase tracking-widest ml-1">
                    Total Seats*
                </Text>
                <View className="flex-row bg-white/5 p-1 rounded-2xl border border-white/10">
                    <TouchableOpacity 
                        onPress={() => setTotalSeats('80')}
                        className={`flex-1 py-4 items-center rounded-xl ${totalSeats === '80' ? 'bg-[#c04444]' : ''}`}
                    >
                        <Text className={`font-black ${totalSeats === '80' ? 'text-white' : 'text-gray-500'}`}>80</Text>
                    </TouchableOpacity>
                    
                    
                    <TouchableOpacity 
                        onPress={() => setTotalSeats('100')}
                        className={`flex-1 py-4 items-center rounded-xl ${totalSeats === '100' ? 'bg-[#c04444]' : ''}`}
                    >
                        <Text className={`font-black ${totalSeats === '100' ? 'text-white' : 'text-gray-500'}`}>100</Text>
                    </TouchableOpacity>
                </View>
                {/* BASE PRICE */}
                    <Text className="text-[10px] font-black text-gray-500 mb-3 uppercase tracking-widest ml-1">
                        Base Price (VND)*
                    </Text>
                    <TextInput
                        className="bg-white/5 text-white p-5 rounded-2xl border border-white/10 font-black italic mb-6"
                        value={price}
                        onChangeText={setPrice}
                        placeholder="e.g. 80000"
                        placeholderTextColor="#4b5563"
                        keyboardType="numeric" // Hiển thị bàn phím số
                        returnKeyType="done"
                    />
            </View>

                {/* BUTTON */}
                <TouchableOpacity
                    className="bg-[#c04444] p-6 rounded-[24px] items-center mb-10"
                    onPress={handleSave}
                    disabled={loading}
                >
                    {loading ? (
                    <ActivityIndicator color="#fff" />
                    ) : (
                    <Text className="text-white text-lg font-bold uppercase">
                        {isEdit ? 'Update Showtime' : 'Create Showtime'}
                    </Text>
                    )}
                </TouchableOpacity>
                </ScrollView>

                {/* 🔥 DROPDOWN OVERLAY (tách khỏi ScrollView → FIX LAG + CLICK) */}
                {showMovieDropdown && (
                <>
                    {/* Click outside */}
                    <TouchableOpacity
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        zIndex: 10,
                    }}
                    onPress={() => setShowMovieDropdown(false)}
                    />

                    {/* Dropdown */}
                    <View
                    style={{
                        position: 'absolute',
                        top: 120,
                        left: 20,
                        right: 20,
                        backgroundColor: '#000',
                        borderRadius: 16,
                        zIndex: 20,
                        elevation: 20,
                        maxHeight: 250,
                    }}
                    >
                    <ScrollView>
                        {movies.map(movie => (
                        <TouchableOpacity
                            key={movie._id}
                            onPress={() => {
                            setSelectedMovieId(movie._id);
                            setShowMovieDropdown(false);
                            }}
                            style={{
                            padding: 16,
                            borderBottomWidth: 1,
                            borderBottomColor: '#222',
                            }}
                        >
                            <Text style={{ color: '#fff' }}>
                            {movie.title} ({movie.duration}m)
                            </Text>
                        </TouchableOpacity>
                        ))}
                    </ScrollView>
                    </View>
                </>
                )}
            </View>
            </BackgroundWrapper>
        </KeyboardAvoidingView>
    );
}
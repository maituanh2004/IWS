import React, { useState, useEffect, useMemo } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ActivityIndicator,
<<<<<<< Updated upstream
=======
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    Alert
>>>>>>> Stashed changes
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import * as movieService from '../services/movieService';
import * as showtimeService from '../services/showtimeService';

export default function AddEditShowtimeScreen({ route, navigation }) {
    const { showtime } = route.params || {};
    const isEdit = !!showtime;

    const [movies, setMovies] = useState([]);
    const [selectedMovieId, setSelectedMovieId] = useState(showtime?.movie?._id || '');
    const [startDate, setStartDate] = useState(
        showtime?.startTime ? new Date(showtime.startTime).toISOString().split('T')[0] : ''
    );
    const [startTime, setStartTime] = useState(
<<<<<<< Updated upstream
        showtime?.startTime ? new Date(showtime.startTime).toTimeString().substring(0, 5) : ''
    );
    const [endDate, setEndDate] = useState(
        showtime?.endTime ? new Date(showtime.endTime).toISOString().split('T')[0] : ''
    );
    const [endTime, setEndTime] = useState(
        showtime?.endTime ? new Date(showtime.endTime).toTimeString().substring(0, 5) : ''
    );
    const [room, setRoom] = useState(showtime?.room || '');
    const [totalSeats, setTotalSeats] = useState(showtime?.totalSeats?.toString() || '100');
=======
        showtime?.startTime
            ? new Date(showtime.startTime).toTimeString().slice(0, 5)
            : ''
    );
    const [room, setRoom] = useState(showtime?.room?.toString() || '1');
    const [totalSeats, setTotalSeats] = useState(showtime?.totalSeats?.toString() || '');
>>>>>>> Stashed changes
    const [price, setPrice] = useState(showtime?.price?.toString() || '');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadMovies();
    }, []);

    const loadMovies = async () => {
        try {
            const response = await movieService.getMovies();
            const movieList = response.data.data || [];
            setMovies(movieList);

            if (!selectedMovieId && movieList.length > 0) {
                setSelectedMovieId(movieList[0]._id);
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to load movies');
        }
    };

    const selectedMovie = movies.find((m) => m._id === selectedMovieId);

    const endDateTime = useMemo(() => {
        if (!startDate || !startTime || !selectedMovie?.duration) return null;

        const start = new Date(`${startDate}T${startTime}:00`);
        if (isNaN(start.getTime())) return null;

        return new Date(start.getTime() + selectedMovie.duration * 60000);
    }, [startDate, startTime, selectedMovie]);

    const endDate = endDateTime ? endDateTime.toISOString().split('T')[0] : '';
    const endTime = endDateTime
        ? `${String(endDateTime.getHours()).padStart(2, '0')}:${String(endDateTime.getMinutes()).padStart(2, '0')}`
        : '';

    const handleSave = async () => {
        if (!selectedMovieId || !startDate || !startTime || !room || !totalSeats || !price) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        const start = new Date(`${startDate}T${startTime}:00`);
        if (isNaN(start.getTime()) || !endDateTime) {
            Alert.alert('Error', 'Invalid start date/time');
            return;
        }

        const showtimeData = {
            movie: selectedMovieId,
<<<<<<< Updated upstream
            startTime: new Date(`${startDate}T${startTime}`),
            endTime: new Date(`${endDate}T${endTime}`),
=======
            startTime: start.toISOString(),
            endTime: endDateTime.toISOString(),
>>>>>>> Stashed changes
            room,
            totalSeats: parseInt(totalSeats),
            price: parseInt(price),
        };

        setLoading(true);
        try {
            if (isEdit) {
                await showtimeService.updateShowtime(showtime._id, showtimeData);
                Alert.alert('Success', 'Showtime updated');
            } else {
                await showtimeService.createShowtime(showtimeData);
                Alert.alert('Success', 'Showtime created');
            }
            navigation.goBack();
        } catch (error) {
<<<<<<< Updated upstream
            Alert.alert('Error', error.response?.data?.message || 'Failed to save showtime');
=======
            Alert.alert(
                'Error',
                error.response?.data?.error ||
                error.response?.data?.message ||
                'Failed to save showtime'
            );
>>>>>>> Stashed changes
        } finally {
            setLoading(false);
        }
    };

    return (
<<<<<<< Updated upstream
        <ScrollView style={styles.container}>
            <View style={styles.form}>
                <Text style={styles.label}>Movie*</Text>
                <View style={styles.pickerContainer}>
                    <Picker
                        selectedValue={selectedMovieId}
                        onValueChange={setSelectedMovieId}
                        style={styles.picker}
                        dropdownIconColor="#fff"
                    >
                        {movies.map((movie) => (
                            <Picker.Item
                                key={movie._id}
                                label={movie.title}
                                value={movie._id}
                            />
                        ))}
                    </Picker>
=======
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ flex: 1 }}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
        >
            <ScrollView className="flex-1 bg-gray-50">
                <View className="p-5">
                    <Text className="text-base font-bold text-gray-900 mt-2 mb-1">Movie*</Text>
                    <View className="bg-white rounded-lg overflow-hidden border border-gray-100">
                        <Picker
                            selectedValue={selectedMovieId}
                            onValueChange={setSelectedMovieId}
                            style={{ color: '#111827' }}
                            dropdownIconColor="#111827"
                        >
                            {movies.map((movie) => (
                                <Picker.Item
                                    key={movie._id}
                                    label={`${movie.title} (${movie.duration}m)`}
                                    value={movie._id}
                                />
                            ))}
                        </Picker>
                    </View>

                    <Text className="text-base font-bold text-gray-900 mt-4 mb-1">Start Date* (YYYY-MM-DD)</Text>
                    <TextInput
                        className="bg-white text-gray-900 p-4 rounded-lg text-base border border-gray-100"
                        value={startDate}
                        onChangeText={setStartDate}
                        placeholder="2024-01-01"
                        placeholderTextColor="#9ca3af"
                    />

                    <Text className="text-base font-bold text-gray-900 mt-4 mb-1">Start Time* (HH:MM)</Text>
                    <TextInput
                        className="bg-white text-gray-900 p-4 rounded-lg text-base border border-gray-100"
                        value={startTime}
                        onChangeText={setStartTime}
                        placeholder="14:30"
                        placeholderTextColor="#9ca3af"
                    />

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
                        <Picker
                            selectedValue={room}
                            onValueChange={setRoom}
                            style={{ color: '#111827' }}
                            dropdownIconColor="#111827"
                        >
                            {ROOMS.map((r) => (
                                <Picker.Item key={r} label={`Room ${r}`} value={r} />
                            ))}
                        </Picker>
                    </View>

                    <Text className="text-base font-bold text-gray-900 mt-4 mb-1">Total Seats*</Text>
                    <TextInput
                        className="bg-white text-gray-900 p-4 rounded-lg text-base border border-gray-100"
                        value={totalSeats}
                        onChangeText={setTotalSeats}
                        keyboardType="numeric"
                        placeholderTextColor="#9ca3af"
                    />

                    <Text className="text-base font-bold text-gray-900 mt-4 mb-1">Price (VND)*</Text>
                    <TextInput
                        className="bg-white text-gray-900 p-4 rounded-lg text-base border border-gray-100"
                        value={price}
                        onChangeText={setPrice}
                        keyboardType="numeric"
                        placeholder="e.g. 95000"
                        placeholderTextColor="#9ca3af"
                    />

                    <TouchableOpacity
                        className="bg-[#e50914] p-4 rounded-lg items-center mt-8 mb-5"
                        onPress={handleSave}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text className="text-white text-base font-bold">
                                {isEdit ? 'Update Showtime' : 'Create Showtime'}
                            </Text>
                        )}
                    </TouchableOpacity>
>>>>>>> Stashed changes
                </View>

                <Text style={styles.label}>Start Date* (YYYY-MM-DD)</Text>
                <TextInput
                    style={styles.input}
                    value={startDate}
                    onChangeText={setStartDate}
                    placeholder="2024-01-01"
                    placeholderTextColor="#666"
                />

                <Text style={styles.label}>Start Time* (HH:MM)</Text>
                <TextInput
                    style={styles.input}
                    value={startTime}
                    onChangeText={setStartTime}
                    placeholder="14:30"
                    placeholderTextColor="#666"
                />

                <Text style={styles.label}>End Date* (YYYY-MM-DD)</Text>
                <TextInput
                    style={styles.input}
                    value={endDate}
                    onChangeText={setEndDate}
                    placeholder="2024-01-01"
                    placeholderTextColor="#666"
                />

                <Text style={styles.label}>End Time* (HH:MM)</Text>
                <TextInput
                    style={styles.input}
                    value={endTime}
                    onChangeText={setEndTime}
                    placeholder="16:30"
                    placeholderTextColor="#666"
                />

                <Text style={styles.label}>Room*</Text>
                <TextInput
                    style={styles.input}
                    value={room}
                    onChangeText={setRoom}
                    placeholder="1"
                    placeholderTextColor="#666"
                />

                <Text style={styles.label}>Total Seats*</Text>
                <TextInput
                    style={styles.input}
                    value={totalSeats}
                    onChangeText={setTotalSeats}
                    placeholder="100"
                    placeholderTextColor="#666"
                    keyboardType="numeric"
                />

                <Text style={styles.label}>Price*</Text>
                <TextInput
                    style={styles.input}
                    value={price}
                    onChangeText={setPrice}
                    placeholder="10.00"
                    placeholderTextColor="#666"
                    keyboardType="decimal-pad"
                />

                <TouchableOpacity
                    style={styles.saveButton}
                    onPress={handleSave}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.saveButtonText}>
                            {isEdit ? 'Update Showtime' : 'Create Showtime'}
                        </Text>
                    )}
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1a1a1a',
    },
    form: {
        padding: 20,
    },
    label: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 5,
        marginTop: 10,
    },
    input: {
        backgroundColor: '#2a2a2a',
        color: '#fff',
        padding: 15,
        borderRadius: 8,
        fontSize: 16,
    },
    pickerContainer: {
        backgroundColor: '#2a2a2a',
        borderRadius: 8,
        overflow: 'hidden',
    },
    picker: {
        color: '#fff',
    },
    saveButton: {
        backgroundColor: '#e50914',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 30,
    },
    saveButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

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
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import * as api from '../services/api';

export default function AddEditShowtimeScreen({ route, navigation }) {
    const { showtime } = route.params || {};
    const isEdit = !!showtime;

    const [movies, setMovies] = useState([]);
    const [selectedMovieId, setSelectedMovieId] = useState(showtime?.movie?._id || '');
    const [startDate, setStartDate] = useState(
        showtime?.startTime ? new Date(showtime.startTime).toISOString().split('T')[0] : ''
    );
    const [startTime, setStartTime] = useState(
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
    const [price, setPrice] = useState(showtime?.price?.toString() || '');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadMovies();
    }, []);

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
            startTime: new Date(`${startDate}T${startTime}`),
            endTime: new Date(`${endDate}T${endTime}`),
            room,
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
            Alert.alert('Error', error.response?.data?.message || 'Failed to save showtime');
        } finally {
            setLoading(false);
        }
    };

    return (
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

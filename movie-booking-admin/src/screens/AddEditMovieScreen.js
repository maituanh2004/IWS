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
import * as api from '../services/api';
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
    const [loading, setLoading] = useState(false);

    const handleSave = async () => {
        if (!title || !description || !duration || !genre || !releaseDate) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        const movieData = {
            title,
            description,
            poster: poster || undefined,
            duration: parseInt(duration),
            genre,
            releaseDate: new Date(releaseDate),
        };

        setLoading(true);
        try {
            if (isEdit) {
                await movieService.updateMovie(movie._id, movieData);
                Alert.alert('Success', 'Movie updated');
            } else {
                await movieService.createMovie(movieData);
                Alert.alert('Success', 'Movie created');
            }

            navigation.goBack();
        } catch (error) {
            Alert.alert('Error', error.response?.data?.message || 'Failed to save movie');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.form}>
                <Text style={styles.label}>Title*</Text>
                <TextInput
                    style={styles.input}
                    value={title}
                    onChangeText={setTitle}
                    placeholder="Movie title"
                    placeholderTextColor="#666"
                />

                <Text style={styles.label}>Description*</Text>
                <TextInput
                    style={[styles.input, styles.textArea]}
                    value={description}
                    onChangeText={setDescription}
                    placeholder="Movie description"
                    placeholderTextColor="#666"
                    multiline
                    numberOfLines={4}
                />

                <Text style={styles.label}>Poster URL</Text>
                <TextInput
                    style={styles.input}
                    value={poster}
                    onChangeText={setPoster}
                    placeholder="https://..."
                    placeholderTextColor="#666"
                />

                <Text style={styles.label}>Duration (minutes)*</Text>
                <TextInput
                    style={styles.input}
                    value={duration}
                    onChangeText={setDuration}
                    placeholder="120"
                    placeholderTextColor="#666"
                    keyboardType="numeric"
                />

                <Text style={styles.label}>Genre*</Text>
                <TextInput
                    style={styles.input}
                    value={genre}
                    onChangeText={setGenre}
                    placeholder="Action, Comedy, etc."
                    placeholderTextColor="#666"
                />

<<<<<<< Updated upstream
                <Text style={styles.label}>Release Date* (YYYY-MM-DD)</Text>
                <TextInput
                    style={styles.input}
                    value={releaseDate}
                    onChangeText={setReleaseDate}
                    placeholder="2024-01-01"
                    placeholderTextColor="#666"
                />
=======
                            return (
                                <TouchableOpacity
                                    key={discount._id}
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
>>>>>>> Stashed changes

                <TouchableOpacity
                    style={styles.saveButton}
                    onPress={handleSave}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.saveButtonText}>
                            {isEdit ? 'Update Movie' : 'Create Movie'}
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
    textArea: {
        height: 100,
        textAlignVertical: 'top',
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

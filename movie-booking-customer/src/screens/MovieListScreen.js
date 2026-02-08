import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    Image,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import * as api from '../services/api';

export default function MovieListScreen({ navigation }) {
    const [movies, setMovies] = useState([]);
    const [loading, setLoading] = useState(true);
    const { signOut } = useAuth();

    useEffect(() => {
        loadMovies();
    }, []);

    const loadMovies = async () => {
        try {
            const response = await api.getMovies();
            setMovies(response.data.data);
        } catch (error) {
            Alert.alert('Error', 'Failed to load movies');
        } finally {
            setLoading(false);
        }
    };

    const renderMovie = ({ item }) => (
        <TouchableOpacity
            style={styles.movieCard}
            onPress={() => navigation.navigate('MovieDetail', { movie: item })}
        >
            <Image source={{ uri: item.poster }} style={styles.poster} />
            <View style={styles.movieInfo}>
                <Text style={styles.movieTitle}>{item.title}</Text>
                <Text style={styles.genre}>{item.genre}</Text>
                <Text style={styles.duration}>{item.duration} min</Text>
            </View>
        </TouchableOpacity>
    );

    if (loading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#e50914" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Movies</Text>
                <View style={styles.headerButtons}>
                    <TouchableOpacity
                        onPress={() => navigation.navigate('BookingHistory')}
                        style={styles.headerButton}
                    >
                        <Text style={styles.headerButtonText}>History</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={signOut} style={styles.headerButton}>
                        <Text style={styles.headerButtonText}>Logout</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <FlatList
                data={movies}
                renderItem={renderMovie}
                keyExtractor={(item) => item._id}
                contentContainerStyle={styles.listContent}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        backgroundColor: '#e50914',
        padding: 15,
        paddingTop: 50,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
    },
    headerButtons: {
        flexDirection: 'row',
        gap: 10,
    },
    headerButton: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 5,
    },
    headerButtonText: {
        color: '#fff',
        fontSize: 14,
    },
    listContent: {
        padding: 15,
    },
    movieCard: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderRadius: 8,
        marginBottom: 15,
        overflow: 'hidden',
        elevation: 2,
    },
    poster: {
        width: 100,
        height: 150,
        resizeMode: 'cover',
    },
    movieInfo: {
        flex: 1,
        padding: 15,
    },
    movieTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 5,
        color: '#333',
    },
    genre: {
        fontSize: 14,
        color: '#666',
        marginBottom: 3,
    },
    duration: {
        fontSize: 14,
        color: '#999',
    },
});

import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    Alert,
} from 'react-native';
import * as api from '../services/api';

export default function ShowtimeListScreen({ route, navigation }) {
    const { movie } = route.params;
    const [showtimes, setShowtimes] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadShowtimes();
    }, []);

    const loadShowtimes = async () => {
        try {
            const response = await api.getShowtimesByMovie(movie._id);
            setShowtimes(response.data.data);
        } catch (error) {
            Alert.alert('Error', 'Failed to load showtimes');
        } finally {
            setLoading(false);
        }
    };

    const renderShowtime = ({ item }) => {
        const startTime = new Date(item.startTime);

        return (
            <TouchableOpacity
                style={styles.showtimeCard}
                onPress={() => navigation.navigate('SeatSelection', { showtime: item })}
            >
                <View style={styles.timeInfo}>
                    <Text style={styles.date}>
                        {startTime.toLocaleDateString()}
                    </Text>
                    <Text style={styles.time}>
                        {startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                </View>

                <View style={styles.showtimeDetails}>
                    <Text style={styles.room}>Room {item.room}</Text>
                    <Text style={styles.price}>${item.price}</Text>
                </View>
            </TouchableOpacity>
        );
    };

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
                <Text style={styles.movieTitle}>{movie.title}</Text>
                <Text style={styles.subtitle}>Select a showtime</Text>
            </View>

            {showtimes.length === 0 ? (
                <View style={styles.centerContainer}>
                    <Text style={styles.emptyText}>No showtimes available</Text>
                </View>
            ) : (
                <FlatList
                    data={showtimes}
                    renderItem={renderShowtime}
                    keyExtractor={(item) => item._id}
                    contentContainerStyle={styles.listContent}
                />
            )}
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
        padding: 20,
        paddingTop: 60,
    },
    movieTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 5,
    },
    subtitle: {
        fontSize: 14,
        color: '#fff',
        opacity: 0.9,
    },
    listContent: {
        padding: 15,
    },
    showtimeCard: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 15,
        marginBottom: 10,
        elevation: 2,
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    timeInfo: {
        flex: 1,
    },
    date: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 3,
    },
    time: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#e50914',
    },
    showtimeDetails: {
        alignItems: 'flex-end',
    },
    room: {
        fontSize: 14,
        color: '#666',
        marginBottom: 3,
    },
    price: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    emptyText: {
        fontSize: 16,
        color: '#999',
    },
});

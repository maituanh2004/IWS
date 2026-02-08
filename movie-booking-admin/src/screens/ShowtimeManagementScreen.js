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

export default function ShowtimeManagementScreen({ navigation }) {
    const [showtimes, setShowtimes] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadShowtimes();
    }, []);

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            loadShowtimes();
        });
        return unsubscribe;
    }, [navigation]);

    const loadShowtimes = async () => {
        try {
            const response = await api.getShowtimes();
            setShowtimes(response.data.data);
        } catch (error) {
            Alert.alert('Error', 'Failed to load showtimes');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        Alert.alert(
            'Delete Showtime',
            'Are you sure you want to delete this showtime?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await api.deleteShowtime(id);
                            loadShowtimes();
                            Alert.alert('Success', 'Showtime deleted');
                        } catch (error) {
                            Alert.alert('Error', 'Failed to delete showtime');
                        }
                    },
                },
            ]
        );
    };

    const renderShowtime = ({ item }) => {
        const startTime = new Date(item.startTime);

        return (
            <View style={styles.card}>
                <View style={styles.cardContent}>
                    <Text style={styles.movieTitle}>{item.movie?.title || 'Unknown'}</Text>
                    <Text style={styles.details}>
                        {startTime.toLocaleString()}
                    </Text>
                    <Text style={styles.details}>
                        Room {item.room} • ${item.price} • {item.totalSeats} seats
                    </Text>
                </View>
                <View style={styles.actions}>
                    <TouchableOpacity
                        style={styles.editButton}
                        onPress={() => navigation.navigate('AddEditShowtime', { showtime: item })}
                    >
                        <Text style={styles.buttonText}>Edit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.deleteButton}
                        onPress={() => handleDelete(item._id)}
                    >
                        <Text style={styles.buttonText}>Delete</Text>
                    </TouchableOpacity>
                </View>
            </View>
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
            <FlatList
                data={showtimes}
                renderItem={renderShowtime}
                keyExtractor={(item) => item._id}
                contentContainerStyle={styles.listContent}
            />

            <TouchableOpacity
                style={styles.fab}
                onPress={() => navigation.navigate('AddEditShowtime', {})}
            >
                <Text style={styles.fabText}>+</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1a1a1a',
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#1a1a1a',
    },
    listContent: {
        padding: 15,
    },
    card: {
        backgroundColor: '#2a2a2a',
        borderRadius: 8,
        padding: 15,
        marginBottom: 10,
    },
    cardContent: {
        marginBottom: 10,
    },
    movieTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 5,
    },
    details: {
        fontSize: 14,
        color: '#999',
        marginTop: 2,
    },
    actions: {
        flexDirection: 'row',
        gap: 10,
    },
    editButton: {
        flex: 1,
        backgroundColor: '#4caf50',
        padding: 10,
        borderRadius: 5,
        alignItems: 'center',
    },
    deleteButton: {
        flex: 1,
        backgroundColor: '#f44336',
        padding: 10,
        borderRadius: 5,
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    fab: {
        position: 'absolute',
        right: 20,
        bottom: 20,
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#e50914',
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5,
    },
    fabText: {
        fontSize: 30,
        color: '#fff',
    },
});

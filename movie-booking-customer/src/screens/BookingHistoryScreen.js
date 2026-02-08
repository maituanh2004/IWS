import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import * as api from '../services/api';

export default function BookingHistoryScreen() {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

    useEffect(() => {
        loadBookings();
    }, []);

    const loadBookings = async () => {
        try {
            const response = await api.getUserBookings(user.id);
            setBookings(response.data.data);
        } catch (error) {
            Alert.alert('Error', 'Failed to load bookings');
        } finally {
            setLoading(false);
        }
    };

    const renderBooking = ({ item }) => {
        const bookingDate = new Date(item.bookingDate);
        const showtimeDate = new Date(item.showtime.startTime);

        return (
            <View style={styles.bookingCard}>
                <View style={styles.movieInfo}>
                    <Text style={styles.movieTitle}>
                        {item.showtime.movie.title}
                    </Text>
                    <Text style={styles.bookingDate}>
                        Booked on: {bookingDate.toLocaleDateString()}
                    </Text>
                </View>

                <View style={styles.detailsRow}>
                    <Text style={styles.label}>Showtime:</Text>
                    <Text style={styles.value}>
                        {showtimeDate.toLocaleString()}
                    </Text>
                </View>

                <View style={styles.detailsRow}>
                    <Text style={styles.label}>Room:</Text>
                    <Text style={styles.value}>{item.showtime.room}</Text>
                </View>

                <View style={styles.detailsRow}>
                    <Text style={styles.label}>Seats:</Text>
                    <Text style={styles.value}>{item.seats.join(', ')}</Text>
                </View>

                <View style={styles.detailsRow}>
                    <Text style={styles.label}>Total:</Text>
                    <Text style={styles.totalPrice}>${item.totalPrice}</Text>
                </View>

                <View style={styles.statusContainer}>
                    <Text style={[
                        styles.status,
                        item.status === 'confirmed' ? styles.statusConfirmed : styles.statusCancelled
                    ]}>
                        {item.status.toUpperCase()}
                    </Text>
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
            {bookings.length === 0 ? (
                <View style={styles.centerContainer}>
                    <Text style={styles.emptyText}>No bookings yet</Text>
                </View>
            ) : (
                <FlatList
                    data={bookings}
                    renderItem={renderBooking}
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
    listContent: {
        padding: 15,
    },
    bookingCard: {
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 15,
        marginBottom: 15,
        elevation: 2,
    },
    movieInfo: {
        marginBottom: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        paddingBottom: 10,
    },
    movieTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 5,
    },
    bookingDate: {
        fontSize: 12,
        color: '#999',
    },
    detailsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    label: {
        fontSize: 14,
        color: '#666',
    },
    value: {
        fontSize: 14,
        color: '#333',
        flex: 1,
        textAlign: 'right',
    },
    totalPrice: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#e50914',
    },
    statusContainer: {
        marginTop: 10,
        alignItems: 'flex-end',
    },
    status: {
        fontSize: 12,
        fontWeight: 'bold',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 4,
    },
    statusConfirmed: {
        backgroundColor: '#4caf50',
        color: '#fff',
    },
    statusCancelled: {
        backgroundColor: '#f44336',
        color: '#fff',
    },
    emptyText: {
        fontSize: 16,
        color: '#999',
    },
});

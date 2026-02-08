import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    ActivityIndicator,
    Alert,
} from 'react-native';
import * as api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function SeatSelectionScreen({ route, navigation }) {
    const { showtime } = route.params;
    const [bookedSeats, setBookedSeats] = useState([]);
    const [selectedSeats, setSelectedSeats] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

    useEffect(() => {
        loadSeats();
    }, []);

    const loadSeats = async () => {
        try {
            const response = await api.getAvailableSeats(showtime._id);
            setBookedSeats(response.data.data.bookedSeats);
        } catch (error) {
            Alert.alert('Error', 'Failed to load seats');
        } finally {
            setLoading(false);
        }
    };

    const toggleSeat = (seatNumber) => {
        if (bookedSeats.includes(seatNumber)) return;

        if (selectedSeats.includes(seatNumber)) {
            setSelectedSeats(selectedSeats.filter((s) => s !== seatNumber));
        } else {
            setSelectedSeats([...selectedSeats, seatNumber]);
        }
    };

    const handleBooking = async () => {
        if (selectedSeats.length === 0) {
            Alert.alert('Error', 'Please select at least one seat');
            return;
        }

        setLoading(true);
        try {
            await api.createBooking(showtime._id, selectedSeats);
            Alert.alert('Success', 'Booking confirmed!', [
                {
                    text: 'OK',
                    onPress: () => navigation.navigate('MovieList'),
                },
            ]);
        } catch (error) {
            Alert.alert('Error', error.response?.data?.message || 'Booking failed');
        } finally {
            setLoading(false);
        }
    };

    const renderSeats = () => {
        const rows = 8;
        const seatsPerRow = 10;
        const seats = [];

        for (let row = 0; row < rows; row++) {
            const rowSeats = [];
            for (let seat = 1; seat <= seatsPerRow; seat++) {
                const seatNumber = `${String.fromCharCode(65 + row)}${seat}`;
                const isBooked = bookedSeats.includes(seatNumber);
                const isSelected = selectedSeats.includes(seatNumber);

                rowSeats.push(
                    <TouchableOpacity
                        key={seatNumber}
                        style={[
                            styles.seat,
                            isBooked && styles.seatBooked,
                            isSelected && styles.seatSelected,
                        ]}
                        onPress={() => toggleSeat(seatNumber)}
                        disabled={isBooked}
                    >
                        <Text style={styles.seatText}>{seatNumber}</Text>
                    </TouchableOpacity>
                );
            }
            seats.push(
                <View key={row} style={styles.row}>
                    {rowSeats}
                </View>
            );
        }
        return seats;
    };

    if (loading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#e50914" />
            </View>
        );
    }

    const totalPrice = selectedSeats.length * showtime.price;

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.screen}>
                    <Text style={styles.screenText}>SCREEN</Text>
                </View>

                <View style={styles.seatsContainer}>{renderSeats()}</View>

                <View style={styles.legend}>
                    <View style={styles.legendItem}>
                        <View style={[styles.legendBox, styles.legendAvailable]} />
                        <Text>Available</Text>
                    </View>
                    <View style={styles.legendItem}>
                        <View style={[styles.legendBox, styles.legendSelected]} />
                        <Text>Selected</Text>
                    </View>
                    <View style={styles.legendItem}>
                        <View style={[styles.legendBox, styles.legendBooked]} />
                        <Text>Booked</Text>
                    </View>
                </View>
            </ScrollView>

            <View style={styles.footer}>
                <View style={styles.priceInfo}>
                    <Text style={styles.priceLabel}>Selected: {selectedSeats.length}</Text>
                    <Text style={styles.priceValue}>${totalPrice}</Text>
                </View>
                <TouchableOpacity
                    style={styles.bookButton}
                    onPress={handleBooking}
                    disabled={loading}
                >
                    <Text style={styles.bookButtonText}>Book Now</Text>
                </TouchableOpacity>
            </View>
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
    scrollContent: {
        padding: 20,
    },
    screen: {
        backgroundColor: '#333',
        padding: 10,
        marginBottom: 30,
        borderRadius: 5,
    },
    screenText: {
        color: '#fff',
        textAlign: 'center',
        fontSize: 16,
        fontWeight: 'bold',
    },
    seatsContainer: {
        alignItems: 'center',
    },
    row: {
        flexDirection: 'row',
        marginBottom: 8,
    },
    seat: {
        width: 30,
        height: 30,
        backgroundColor: '#4caf50',
        margin: 2,
        borderRadius: 4,
        alignItems: 'center',
        justifyContent: 'center',
    },
    seatBooked: {
        backgroundColor: '#999',
    },
    seatSelected: {
        backgroundColor: '#e50914',
    },
    seatText: {
        fontSize: 10,
        color: '#fff',
    },
    legend: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: 30,
        marginBottom: 20,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    legendBox: {
        width: 20,
        height: 20,
        borderRadius: 3,
        marginRight: 5,
    },
    legendAvailable: {
        backgroundColor: '#4caf50',
    },
    legendSelected: {
        backgroundColor: '#e50914',
    },
    legendBooked: {
        backgroundColor: '#999',
    },
    footer: {
        backgroundColor: '#fff',
        padding: 15,
        borderTopWidth: 1,
        borderTopColor: '#ddd',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    priceInfo: {
        flex: 1,
    },
    priceLabel: {
        fontSize: 14,
        color: '#666',
    },
    priceValue: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
    },
    bookButton: {
        backgroundColor: '#e50914',
        padding: 15,
        borderRadius: 8,
        paddingHorizontal: 40,
    },
    bookButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

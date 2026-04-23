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
    const [discounts, setDiscounts] = useState([]);
    const [selectedVoucher, setSelectedVoucher] = useState(null);
    const { user } = useAuth();

    useEffect(() => {
        loadSeatsAndDiscounts();
    }, []);

    const loadSeatsAndDiscounts = async () => {
        setLoading(true);
        try {
            const [seatsRes, discountsRes] = await Promise.all([
                api.getAvailableSeats(showtime._id),
                api.getDiscounts()
            ]);
            
            setBookedSeats(seatsRes.data.data.bookedSeats);
            
            // Filter only vouchers available for this movie and not expired
            const movieVouchers = showtime.movie?.availableVouchers || [];
            const activeDiscounts = (discountsRes.data.data || []).filter(d => 
                movieVouchers.includes(d.code) && new Date(d.expiryDate) > new Date()
            );
            setDiscounts(activeDiscounts);
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Failed to load screen data');
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
            await api.createBooking(showtime._id, selectedSeats, selectedVoucher?.code);
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
                <View style={styles.voucherSection}>
                    <Text style={styles.voucherTitle}>Apply Voucher (Optional)</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.voucherList}>
                        <TouchableOpacity
                            style={[
                                styles.voucherItem,
                                !selectedVoucher && styles.voucherSelected
                            ]}
                            onPress={() => setSelectedVoucher(null)}
                        >
                            <Text style={[styles.voucherText, !selectedVoucher && styles.voucherSelectedText]}>None</Text>
                        </TouchableOpacity>

                        {discounts.map(discount => {
                            const currentTotal = selectedSeats.length * showtime.price;
                            const isEligible = currentTotal >= (discount.minPrice || 0);
                            const isSelected = selectedVoucher?.code === discount.code;

                            return (
                                <TouchableOpacity
                                    key={discount._id}
                                    style={[
                                        styles.voucherItem,
                                        isSelected && styles.voucherSelected,
                                        !isEligible && styles.voucherDisabled
                                    ]}
                                    onPress={() => isEligible && setSelectedVoucher(discount)}
                                    disabled={!isEligible}
                                >
                                    <Text style={[
                                        styles.voucherText, 
                                        isSelected && styles.voucherSelectedText,
                                        !isEligible && styles.voucherDisabledText
                                    ]}>
                                        {discount.code} ({discount.percentage}%)
                                    </Text>
                                    {!isEligible && <Text style={styles.minPriceText}>Min ${discount.minPrice}</Text>}
                                </TouchableOpacity>
                            );
                        })}
                    </ScrollView>
                </View>

                <View style={styles.bottomBar}>
                    <View style={styles.priceInfo}>
                        <View>
                            <Text style={styles.priceLabel}>Seats: {selectedSeats.length}</Text>
                            {selectedVoucher && (
                                <Text style={styles.discountLabel}>Discount: -{selectedVoucher.percentage}%</Text>
                            )}
                        </View>
                        <View style={styles.priceContainer}>
                            {selectedVoucher && (
                                <Text style={styles.originalPrice}>${selectedSeats.length * showtime.price}</Text>
                            )}
                            <Text style={styles.priceValue}>
                                ${selectedVoucher 
                                    ? Math.floor(selectedSeats.length * showtime.price * (1 - selectedVoucher.percentage / 100))
                                    : selectedSeats.length * showtime.price}
                            </Text>
                        </View>
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
        borderTopWidth: 1,
        borderTopColor: '#ddd',
    },
    voucherSection: {
        backgroundColor: '#fff',
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    voucherTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 10,
    },
    voucherList: {
        flexDirection: 'row',
    },
    voucherItem: {
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#ddd',
        marginRight: 10,
        backgroundColor: '#f9f9f9',
        alignItems: 'center',
        justifyContent: 'center',
    },
    voucherSelected: {
        backgroundColor: '#e50914',
        borderColor: '#e50914',
    },
    voucherDisabled: {
        opacity: 0.5,
        backgroundColor: '#eee',
    },
    voucherText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#666',
    },
    voucherSelectedText: {
        color: '#fff',
    },
    voucherDisabledText: {
        color: '#999',
    },
    minPriceText: {
        fontSize: 8,
        color: '#e50914',
        marginTop: 2,
    },
    bottomBar: {
        flexDirection: 'row',
        padding: 15,
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    priceInfo: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginRight: 15,
    },
    priceLabel: {
        fontSize: 12,
        color: '#666',
    },
    priceContainer: {
        alignItems: 'flex-end',
    },
    originalPrice: {
        fontSize: 12,
        color: '#999',
        textDecorationLine: 'line-through',
    },
    priceValue: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
    },
    discountLabel: {
        fontSize: 10,
        color: '#4caf50',
        fontWeight: 'bold',
    },
    bookButton: {
        backgroundColor: '#e50914',
        paddingVertical: 12,
        paddingHorizontal: 25,
        borderRadius: 8,
    },
    bookButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

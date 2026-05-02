import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import MovieListScreen from '../screens/MovieListScreen';
import MovieDetailScreen from '../screens/MovieDetailScreen';
import ShowtimeListScreen from '../screens/ShowtimeListScreen';
import SeatSelectionScreen from '../screens/SeatSelectionScreen';
import BookingConfirmScreen from '../screens/BookingConfirmScreen';
import DiscountHistoryScreen from '../screens/DiscountHistoryScreen';
import ProfileScreen from '../screens/ProfileScreen';
import SystemErrorScreen from '../screens/SystemErrorScreen';
import BookingHistoryScreen from '../screens/BookingHistoryScreen';
import BookingDetailScreen from '../screens/BookingDetailScreen';
import PaymentFailScreen from '../screens/PaymentFailScreen';
import PaymentSuccessScreen from '../screens/PaymentSuccessScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
    const { user, loading } = useAuth();

    if (loading) return null;

    return user ? (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="MovieList" component={MovieListScreen} />
            <Stack.Screen name="MovieDetail" component={MovieDetailScreen} />
            <Stack.Screen name="ShowtimeList" component={ShowtimeListScreen} />
            <Stack.Screen name="SeatSelection" component={SeatSelectionScreen} />
            <Stack.Screen name="BookingConfirmScreen" component={BookingConfirmScreen} />
            <Stack.Screen name="BookingHistory" component={BookingHistoryScreen} />
            <Stack.Screen name="Profile" component={ProfileScreen} />
            <Stack.Screen name="SystemError" component={SystemErrorScreen} />
            <Stack.Screen name="PaymentFail" component={PaymentFailScreen} />
            <Stack.Screen name="BookingDetail" component={BookingDetailScreen} />
            <Stack.Screen name="PaymentSuccess" component={PaymentSuccessScreen} />
            <Stack.Screen name="DiscountHistory" component={DiscountHistoryScreen} />
        </Stack.Navigator>
    ) : (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
        </Stack.Navigator>
    );
}

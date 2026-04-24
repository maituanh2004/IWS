import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';

import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import MovieListScreen from '../screens/MovieListScreen';
import MovieDetailScreen from '../screens/MovieDetailScreen';
import ShowtimeListScreen from '../screens/ShowtimeListScreen';
import SeatSelectionScreen from '../screens/SeatSelectionScreen';
import BookingConfirmScreen from '../screens/BookingConfirm';
import BookingHistoryScreen from '../screens/BookingHistoryScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
    const { user, loading } = useAuth();

    if (loading) {
        return null;
    }

    return (
        <NavigationContainer>
            {user ? (
                <Stack.Navigator>
                    <Stack.Screen
                        name="MovieList"
                        component={MovieListScreen}
                        options={{ headerShown: false }}
                    />
                    <Stack.Screen
                        name="MovieDetail"
                        component={MovieDetailScreen}
                        options={{ title: 'Movie Details' }}
                        options={{ headerShown: false }}
                    />
                    <Stack.Screen
                        name="ShowtimeList"
                        component={ShowtimeListScreen}
                        options={{ headerShown: false }}
                    />
                    <Stack.Screen
                        name="SeatSelection"
                        component={SeatSelectionScreen}
                        options={{ title: 'Select Seats' }}
                        options={{ headerShown: false }}
                    />
                    <Stack.Screen
                        name="BookingConfirm"
                        component={BookingConfirmScreen}
                        options={{ headerShown: false }}
                    />
                    <Stack.Screen
                        name="BookingHistory"
                        component={BookingHistoryScreen}
                        options={{ title: 'My Bookings' }}
                        options={{ headerShown: false }}
                    />
                    <Stack.Screen
                        name="Profile"
                        component={ProfileScreen}
                        options={{ headerShown: false }}
                    />
                </Stack.Navigator>
            ) : (
                <Stack.Navigator>
                    <Stack.Screen
                        name="Login"
                        component={LoginScreen}
                        options={{ headerShown: false }}
                    />
                    <Stack.Screen
                        name="Register"
                        component={RegisterScreen}
                        options={{ title: 'Create Account' }}
                        options={{ headerShown: false }}
                    />
                </Stack.Navigator>
            )}
        </NavigationContainer>
    );
}

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
import BookingHistoryScreen from '../screens/BookingHistoryScreen';

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
                    />
                    <Stack.Screen
                        name="BookingHistory"
                        component={BookingHistoryScreen}
                        options={{ title: 'My Bookings' }}
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
                    />
                </Stack.Navigator>
            )}
        </NavigationContainer>
    );
}

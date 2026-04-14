import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';

import LoginScreen from '../screens/LoginScreen';
import MovieManagementScreen from '../screens/MovieManagementScreen';
import AddEditMovieScreen from '../screens/AddEditMovieScreen';
import ShowtimeManagementScreen from '../screens/ShowtimeManagementScreen';
import AddEditShowtimeScreen from '../screens/AddEditShowtimeScreen';
import DiscountManagementScreen from '../screens/DiscountManagementScreen';
import OccupancyScreen from '../screens/OccupancyScreen';
import SystemErrorScreen from '../screens/SystemErrorScreen';

import { navigationRef } from './NavigationService';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
    const { user, loading } = useAuth();

    if (loading) {
        return null;
    }

    return (
        <NavigationContainer ref={navigationRef}>
            {user ? (
                <Stack.Navigator
                    screenOptions={{
                        headerStyle: { backgroundColor: '#e50914' },
                        headerTintColor: '#000',
                        headerTitleStyle: { fontWeight: '900', color: '#000' },
                        headerTitleAlign: 'center',
                    }}
                >
                    <Stack.Screen
                        name="MovieManagement"
                        component={MovieManagementScreen}
                        options={{ headerShown: false }}
                    />
                    <Stack.Screen
                        name="AddEditMovie"
                        component={AddEditMovieScreen}
                        options={({ route }) => ({
                            title: route.params?.movie ? 'Edit Movie' : 'Add Movie',
                        })}
                    />
                    <Stack.Screen
                        name="ShowtimeManagement"
                        component={ShowtimeManagementScreen}
                        options={{ headerShown: false }}
                    />
                    <Stack.Screen
                        name="AddEditShowtime"
                        component={AddEditShowtimeScreen}
                        options={({ route }) => ({
                            title: route.params?.showtime ? 'Edit Showtime' : 'Add Showtime',
                        })}
                    />
                    <Stack.Screen
                        name="DiscountManagement"
                        component={DiscountManagementScreen}
                        options={{ headerShown: false }}
                    />
                    <Stack.Screen
                        name="Occupancy"
                        component={OccupancyScreen}
                        options={{ title: 'Theater Occupancy' }}
                    />
                    <Stack.Screen
                        name="SystemError"
                        component={SystemErrorScreen}
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
                </Stack.Navigator>
            )}
        </NavigationContainer>
    );
}
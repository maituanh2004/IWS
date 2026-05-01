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
import ProfileScreen from '../screens/ProfileScreen';
import BookingListScreen from '../screens/BookingListScreen';

import { navigationRef } from './NavigationService';

const Stack = createNativeStackNavigator();
const RootStack = createNativeStackNavigator();

function AuthStack() {
    return (
        <Stack.Navigator>
            <Stack.Screen
                name="Login"
                component={LoginScreen}
                options={{ headerShown: false }}
            />
        </Stack.Navigator>
    );
}

function AppStack() {
    return (
        <Stack.Navigator
            screenOptions={{
                headerStyle: { backgroundColor: '#0a0a0a' },
                headerTintColor: '#fff',
                headerTitleStyle: { fontWeight: '900', color: '#fff' },
                headerTitleAlign: 'center',
                headerShadowVisible: false,
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
                name="Profile"
                component={ProfileScreen}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="Occupancy"
                component={OccupancyScreen}
                options={{ title: 'Theater Occupancy' }}
            />
            <Stack.Screen
                name="BookingList"
                component={BookingListScreen}
                options={{ headerShown: false }}
            />
        </Stack.Navigator>
    );
}

export default function AppNavigator() {
    const { user, loading } = useAuth();

    if (loading) {
        return null;
    }

    return (
        <NavigationContainer ref={navigationRef}>
            {/* RootStack holds SystemError at the top level so it's
                reachable from both the unauthenticated (Login) and
                authenticated (App) stacks */}
            <RootStack.Navigator screenOptions={{ headerShown: false, animation: 'none' }}>
                {user ? (
                    <RootStack.Screen name="App" component={AppStack} />
                ) : (
                    <RootStack.Screen name="Auth" component={AuthStack} />
                )}
                <RootStack.Screen
                    name="SystemError"
                    component={SystemErrorScreen}
                    options={{ headerShown: false }}
                />
            </RootStack.Navigator>
        </NavigationContainer>
    );
}
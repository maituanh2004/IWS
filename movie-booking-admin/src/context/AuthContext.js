import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as api from '../services/api';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkUser();
    }, []);

    const checkUser = async () => {
        try {
            const token = await AsyncStorage.getItem('token');
            if (token) {
                const response = await api.getMe();
                // Only allow admin role
                if (response.data.data.role === 'admin') {
                    setUser(response.data.data);
                } else {
                    await AsyncStorage.removeItem('token');
                }
            }
        } catch (error) {
            await AsyncStorage.removeItem('token');
        } finally {
            setLoading(false);
        }
    };

    const signIn = async (email, password) => {
        const response = await api.login(email, password);

        // Check if user is admin
        if (response.data.user.role !== 'admin') {
            throw new Error('Access denied. Admin only.');
        }

        await AsyncStorage.setItem('token', response.data.token);
        setUser(response.data.user);
        return response.data;
    };

    const signOut = async () => {
        await AsyncStorage.removeItem('token');
        setUser(null);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                signIn,
                signOut,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);

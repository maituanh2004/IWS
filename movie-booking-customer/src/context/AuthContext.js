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
                setUser(response.data.data);
            }
        } catch (error) {
            await AsyncStorage.removeItem('token');
        } finally {
            setLoading(false);
        }
    };

    const signIn = async (email, password) => {
        const response = await api.login(email, password);
        await AsyncStorage.setItem('token', response.data.token);
        setUser(response.data.user);
        return response.data;
    };

    const signUp = async (name, email, password) => {
        const response = await api.register(name, email, password);
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
                setUser,
                loading,
                signIn,
                signUp,
                signOut,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);

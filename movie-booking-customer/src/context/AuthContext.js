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
                const raw = response.data?.data || response.data?.user || response.data;
                const normalized = normalizeUser(raw);
                setUser(normalized);
            }
        } catch (error) {
            await AsyncStorage.removeItem('token');
        } finally {
            setLoading(false);
        }
    };

    const signIn = async (email, password) => {
        const response = await api.login(email, password);
        const token = response.data?.token || response.data?.data?.token;
        const raw = response.data?.user || response.data?.data || response.data;
        await AsyncStorage.setItem('token', token);
        const normalized = normalizeUser(raw);
        setUser(normalized);
        return { ...response.data, user: normalized, token };
    };

    const signUp = async (name, email, password) => {
        const response = await api.register(name, email, password);
        const token = response.data?.token || response.data?.data?.token;
        const raw = response.data?.user || response.data?.data || response.data;
        await AsyncStorage.setItem('token', token);
        const normalized = normalizeUser(raw);
        setUser(normalized);
        return { ...response.data, user: normalized, token };
    };

    const normalizeUser = (u) => {
        if (!u) return null;
        const _id = u._id || u.id || (u.user && (u.user._id || u.user.id));
        const id = u.id || u._id || (u.user && (u.user.id || u.user._id));
        return { ...u, _id, id };
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

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
        try {
            const response = await api.login(email, password);

            console.log("🟢 FULL RESPONSE:", JSON.stringify(response.data, null, 2));

            const user =
                response.data.user ||
                response.data.data?.user ||
                response.data.data;

            const token =
                response.data.token ||
                response.data.data?.token;

            console.log("👤 USER:", user);
            console.log("🔑 TOKEN:", token);

            if (!user || !token) {
                console.log("❌ FORMAT ERROR:", response.data);
                throw new Error("Invalid API response format");
            }

            if (user.role !== 'admin') {
                throw new Error("Access denied. Admin only.");
            }

            await AsyncStorage.setItem('token', token);
            setUser(user);

            return { user, token };

        } catch (err) {
            console.log("❌ SIGNIN ERROR (DETAIL):", err.response?.data || err.message);
            throw err;
        }
    };


    const signOut = async () => {
        await AsyncStorage.removeItem('token');
        setUser(null);
    };

    const refreshUser = async () => {
        await checkUser();
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                signIn,
                signOut,
                refreshUser,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
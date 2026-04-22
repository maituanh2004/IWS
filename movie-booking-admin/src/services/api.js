import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';


const LOCAL_IP = "192.168.1.4"; 
const PUBLIC_URL = "";

const getBaseUrl = () => {
    if (PUBLIC_URL) return `${PUBLIC_URL}/api`;

    if (Platform.OS === 'web') return `http://localhost:5000/api`;

    if (Platform.OS === 'android') {
        const isLanIp = typeof LOCAL_IP === 'string' && /^\d+\.\d+\.\d+\.\d+$/.test(LOCAL_IP) && !LOCAL_IP.startsWith('127.');
        if (isLanIp) return `http://${LOCAL_IP}:5000/api`;
        // default emulator host
        return `http://10.0.2.2:5000/api`;
    }

    // iOS and other platforms: use LOCAL_IP if provided
    return `http://${LOCAL_IP || 'localhost'}:5000/api`;
};

const API_BASE = getBaseUrl();

console.log("📡 API BASE URL:", API_BASE);
console.log("📱 PLATFORM:", Platform.OS);

const api = axios.create({
    baseURL: API_BASE,
    timeout: 10000,
    headers: { "Content-Type": "application/json" }
});

// Automatic fallback: if requests to API_BASE fail with network error,
// retry once using emulator loopback (Android) or localhost.
api.interceptors.response.use(undefined, async (error) => {
    // Only attempt fallback for network errors (no response)
    if (!error.response && !error.config._retried) {
        const origConfig = error.config;
        origConfig._retried = true;

        let fallbackBase = API_BASE;
        try {
            if (Platform.OS === 'android') {
                fallbackBase = API_BASE.includes('10.0.2.2') ? (API_BASE.includes('192.168') ? API_BASE : `http://${LOCAL_IP}:5000/api`) : `http://10.0.2.2:5000/api`;
            } else {
                fallbackBase = `http://localhost:5000/api`;
            }
            console.log('📡 Falling back to', fallbackBase);
            const instance = axios.create({ baseURL: fallbackBase, timeout: 10000, headers: origConfig.headers });
            return instance.request({ ...origConfig, baseURL: fallbackBase });
        } catch (fallErr) {
            return Promise.reject(fallErr);
        }
    }
    return Promise.reject(error);
});

import * as NavigationService from '../navigation/NavigationService';

// ⭐ INTERCEPTOR 1 — REQUEST LOGGING & AUTH
api.interceptors.request.use(async (config) => {
    const token = await AsyncStorage.getItem("token");

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log("🔑 TOKEN SENT:", token);
    } else {
        console.log("❌ NO TOKEN FOUND");
    }

    console.log("➡️ REQUEST:", config.method.toUpperCase(), config.url);
    if (config.data) console.log("📤 BODY:", config.data);

    return config;
}, (error) => Promise.reject(error));

// ⭐ INTERCEPTOR 2 — RESPONSE ERROR HANDLING
api.interceptors.response.use(
    (response) => {
        console.log("✅ RESPONSE:", response.status, response.config.url);
        return response;
    },
    (error) => {
        console.log("❌ RESPONSE ERROR:", error.response?.status || "NETWORK_ERROR", error.config?.url);

        if (error.response) {
            const status = error.response.status;
            if (status === 404) {
                NavigationService.navigate('SystemError', { errorType: '404' });
            } else if (status >= 500) {
                NavigationService.navigate('SystemError', { errorType: '500' });
            }
        } else if (error.request) {
            // The request was made but no response was received (Network Error)
            NavigationService.navigate('SystemError', { errorType: 'generic' });
        }

        return Promise.reject(error);
    }
);

// AUTH
export const login = (email, password) =>
    api.post("auth/login", { email, password });

export const getMe = () => api.get("auth/me");

export const updateDetails = (userData) => api.put("auth/updatedetails", userData);

export const updatePassword = (passwordData) => api.put("auth/updatepassword", passwordData);

export default api;
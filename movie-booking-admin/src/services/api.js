import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Use the local IP of your machine (192.168.1.7) for both emulator and physical device
// 🌐 CONFIGURATION
const LOCAL_IP = "10.165.5.122"; // ⚠️ Update this if your machine IP changes (Check with 'ipconfig')
const PUBLIC_URL = "";           // 🚀 Use this for "Any Network" access (e.g., https://xyz.ngrok-free.app)

const getBaseUrl = () => {
    if (PUBLIC_URL) return `${PUBLIC_URL}/api`;
    
    // For Web development
    if (Platform.OS === 'web') return `http://localhost:5000/api`;
    
    // For Android/iOS - Use machine IP
    // Note: If using Android Emulator, 10.0.2.2 also works for localhost
    return `http://${LOCAL_IP}:5000/api`;
};

const API_BASE = getBaseUrl();

console.log("📡 API BASE URL:", API_BASE);
console.log("📱 PLATFORM:", Platform.OS);

const api = axios.create({
    baseURL: API_BASE,
    timeout: 10000,
    headers: { "Content-Type": "application/json" }
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
    api.post("/auth/login", { email, password });

export const getMe = () => api.get("/auth/me");

export default api;
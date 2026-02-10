import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const API_BASE =
    Platform.OS === "android"
        ? "http://10.0.2.2:5000/api"
        : "http://192.168.1.13:5000/api";

console.log("📡 API BASE URL:", API_BASE);

const api = axios.create({
    baseURL: API_BASE,
    timeout: 10000,
    headers: { "Content-Type": "application/json" }
});

// ⭐ INTERCEPTOR 1 — DEBUG LOG
api.interceptors.request.use(async (config) => {
    const token = await AsyncStorage.getItem("token");

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    console.log("➡️ REQUEST:", config.method.toUpperCase(), config.url);
    console.log("📤 BODY:", config.data);

    return config;
});

// ⭐ INTERCEPTOR 2 — TOKEN LOGGER
api.interceptors.request.use(
    async (config) => {
        const token = await AsyncStorage.getItem("token");

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
            console.log("🔑 TOKEN SENT:", token);
        } else {
            console.log("❌ NO TOKEN FOUND");
        }

        return config;
    },
    (error) => Promise.reject(error)
);

// AUTH
export const login = (email, password) =>
    api.post("/auth/login", { email, password });

export const getMe = () => api.get("/auth/me");

export default api;

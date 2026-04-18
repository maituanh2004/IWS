import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import * as NavigationService from '../navigation/NavigationService';

<<<<<<< Updated upstream
const API_BASE =
    Platform.OS === "android"
        ? "http://10.0.2.2:5000/api"
        : "http://192.168.1.13:5000/api";
=======
const LOCAL_IP = "192.168.1.17";
const PUBLIC_URL = "";

const getBaseUrl = () => {
    if (PUBLIC_URL) return `${PUBLIC_URL}/api`;

    if (Platform.OS === 'web') return `http://localhost:5000/api`;

    return `http://${LOCAL_IP}:5000/api`;
};

const API_BASE = getBaseUrl();
>>>>>>> Stashed changes

console.log("📡 API BASE URL:", API_BASE);

const api = axios.create({
    baseURL: API_BASE,
    timeout: 10000,
    headers: { "Content-Type": "application/json" }
});

<<<<<<< Updated upstream
// ⭐ INTERCEPTOR 1 — DEBUG LOG
=======
>>>>>>> Stashed changes
api.interceptors.request.use(async (config) => {
    const token = await AsyncStorage.getItem("token");

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    console.log("➡️ REQUEST:", config.method.toUpperCase(), config.url);
    console.log("📤 BODY:", config.data);

    return config;
});

<<<<<<< Updated upstream
// ⭐ INTERCEPTOR 2 — TOKEN LOGGER
api.interceptors.request.use(
    async (config) => {
        const token = await AsyncStorage.getItem("token");

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
            console.log("🔑 TOKEN SENT:", token);
        } else {
            console.log("❌ NO TOKEN FOUND");
=======
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
            NavigationService.navigate('SystemError', { errorType: 'generic' });
>>>>>>> Stashed changes
        }

        return config;
    },
    (error) => Promise.reject(error)
);

export const login = (email, password) =>
    api.post("/auth/login", { email, password });

export const getMe = () => api.get("/auth/me");

export default api;

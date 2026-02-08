import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// API Configuration
// For Android Emulator: use 10.0.2.2
// For iOS Simulator: use localhost
// For Physical Device: use your computer's IP address (192.168.1.13)
import { Platform } from 'react-native';

const getApiUrl = () => {
    // If running on Android emulator
    if (Platform.OS === 'android') {
        return 'http://10.0.2.2:5000/api';
    }
    // For iOS simulator or web
    return 'http://localhost:5000/api';

    // For physical device, uncomment below and comment above:
    return 'http://192.168.1.7:5000/api';
};

const API_URL = getApiUrl();

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add token to requests
api.interceptors.request.use(
    async (config) => {
        const token = await AsyncStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Auth APIs
export const login = (email, password) =>
    api.post('/auth/login', { email, password });

export const getMe = () => api.get('/auth/me');

// Movie APIs
export const getMovies = () => api.get('/movies');

export const createMovie = (movieData) => api.post('/movies', movieData);

export const updateMovie = (id, movieData) => api.put(`/movies/${id}`, movieData);

export const deleteMovie = (id) => api.delete(`/movies/${id}`);

// Showtime APIs
export const getShowtimes = () => api.get('/showtimes');

export const getShowtimesByMovie = (movieId) =>
    api.get(`/showtimes/movie/${movieId}`);

export const createShowtime = (showtimeData) =>
    api.post('/showtimes', showtimeData);

export const updateShowtime = (id, showtimeData) =>
    api.put(`/showtimes/${id}`, showtimeData);

export const deleteShowtime = (id) => api.delete(`/showtimes/${id}`);

export default api;

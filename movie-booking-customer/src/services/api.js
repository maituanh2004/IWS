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

    // For physical device OR web where localhost might not work
    // return 'http://192.168.1.7:5000/api';

    // Default for iOS simulator or web localhost
    return 'http://localhost:5000/api';
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
export const register = (name, email, password) =>
    api.post('/auth/register', { name, email, password, role: 'customer' });

export const login = (email, password) =>
    api.post('/auth/login', { email, password });

export const getMe = () => api.get('/auth/me');

// Movie APIs
export const getMovies = () => api.get('/movies');

export const getMovie = (id) => api.get(`/movies/${id}`);

// Showtime APIs
export const getShowtimes = () => api.get('/showtimes');

export const getShowtimesByMovie = (movieId) =>
    api.get(`/showtimes/movie/${movieId}`);

export const getShowtime = (id) =>
    api.get(`/showtimes/${id}`);

export const getAvailableSeats = (showtimeId) =>
    api.get(`/showtimes/${showtimeId}/seats`);

// Booking APIs
export const createBooking = (showtimeId, seats) =>
    api.post('/bookings', { showtimeId, seats });

export const getUserBookings = (userId) =>
    api.get(`/bookings/user/${userId}`);

// Discount APIs
export const getDiscounts = () => api.get('/discounts');

export default api;

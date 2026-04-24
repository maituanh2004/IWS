import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// ⚙️  Update LOCAL_IP to your machine's current IP whenever it changes.
// Run `ipconfig` (Windows) or `ifconfig` (Mac/Linux) to find it.
const LOCAL_IP = '192.168.1.4';

const getApiUrl = () => {
    if (Platform.OS === 'web') return 'http://localhost:5000/api';

    if (Platform.OS === 'android') {
        // Use LAN IP if set, otherwise fall back to Android emulator loopback
        return LOCAL_IP ? `http://${LOCAL_IP}:5000/api` : 'http://10.0.2.2:5000/api';
    }

    // iOS simulator / other
    return `http://${LOCAL_IP || 'localhost'}:5000/api`;
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

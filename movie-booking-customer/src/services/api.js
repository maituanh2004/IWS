import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// ⚙️  Update LOCAL_IP to your machine's current IP whenever it changes.
// Run `ipconfig` (Windows) or `ifconfig` (Mac/Linux) to find it.
const LOCAL_IP = '192.168.1.5';

const getApiUrl = () => {
    // Use ngrok for all platforms so both emulator and phone work
    return `${NGROK_URL}/api`;
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
    api.get(`/movies/${movieId}/showtimes`);

export const getShowtime = (id) =>
    api.get(`/showtimes/${id}`);

export const getAvailableSeats = (showtimeId) =>
    api.get(`/showtimes/${showtimeId}/seats`);

// Booking APIs
export const createBooking = (showtimeId, seats, discountCode) =>
    api.post('/bookings', { showtimeId, seats, discountCode });

export const getMyBookings = () =>
    api.get('/bookings/me');

export const getUserBookingsAdmin = (userId) =>
    api.get(`/bookings/user/${userId}`);

export const getBookingByGroupId = (groupId) =>
    api.get(`/bookings/group/${groupId}`);

// Discount APIs
export const getDiscounts = () => api.get('/discounts');

// Payment APIs
export const createPayment = (bookingGroupId) =>
    api.post('/payments', { bookingGroupId });

export default api;

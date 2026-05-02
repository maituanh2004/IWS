import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

// ⚙️  Update LOCAL_IP to your machine's current IP whenever it changes.
// Run `ipconfig` (Windows) or `ifconfig` (Mac/Linux) to find it.
const LOCAL_IP = '192.168.1.5';

const getApiUrl = () => {
    if (Platform.OS === 'web') {
        return 'http://localhost:5000/api';
    }

    // 🔥 LẤY IP TỪ EXPO
    const hostUri =
        Constants.expoConfig?.hostUri ||
        Constants.manifest?.debuggerHost;

    if (!hostUri) {
        console.log('⚠️ Cannot detect host, fallback localhost');
        return 'http://localhost:5000/api';
    }

    const host = hostUri.split(':')[0];

    return `http://${host}:5000/api`;
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

export const updatePassword = (currentPassword, newPassword) =>
  api.put('/auth/updatepassword', {
    currentPassword,
    newPassword,
  });

export const updateDetails = (name, email) =>
  api.put('/auth/updatedetails', {
    name,
    email,
  });

// Movie APIs
export const getMovies = () => api.get('/movies');

export const getMovie = (movieId) => api.get(`/movies/${ movieId }`);

export const getShowtimesByMovie = (movieId) =>
    api.get(`/movies/${movieId}/showtimes`);

// Showtime APIs
export const getShowtimes = () => api.get('/showtimes');

export const getShowtime = (showtimeId) =>
    api.get(`/showtimes/${showtimeId}`);

export const getAvailableSeats = (showtimeId) =>
    api.get(`/showtimes/${showtimeId}/seats`);

// Booking APIs
export const previewBooking = ({ showtimeId, seats, discountCode }) =>
  api.post('/bookings/preview', {
    showtimeId,
    seats,
    ...(discountCode ? { discountCode } : {}),
  });

export const createBooking = ({ showtimeId, seats, discountCode }) =>
  api.post('/bookings', {
    showtimeId,
    seats,
    ...(discountCode ? { discountCode } : {}),
  });

export const getMyBookings = () =>
    api.get('/bookings/me');

export const getUserBookingsAdmin = (userId) =>
    api.get(`/bookings/user/${userId}`);

export const getBookingByGroupId = (bookingGroupId) => {
  return api.get(`/bookings/group/${bookingGroupId}`);
};

// Payment APIs
export const createPayment = ({ bookingGroupId }) =>
  api.post('/payments', {
    bookingGroupId,
  });

// Discount APIs
export const getDiscounts = () => api.get('/discounts');

export const getDiscount = (discountId) =>
  api.get(`/discounts/${discountId}`);

export default api;

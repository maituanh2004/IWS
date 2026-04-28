import api from "./api";

export const getBookings = () => api.get("bookings");
export const getBookingsByShowtime = (showtimeId) => api.get(`bookings/showtime/${showtimeId}`);

import api from "./api";

export const getShowtimes = () => api.get("showtimes");
export const getShowtime = (id) => api.get(`showtimes/${id}`);
export const createShowtime = (data) => api.post("showtimes", data);
export const updateShowtime = (id, data) => api.put(`showtimes/${id}`, data);
export const deleteShowtime = (id) => api.delete(`showtimes/${id}`);

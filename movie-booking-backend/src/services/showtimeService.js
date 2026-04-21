const Showtime = require('../models/Showtime');
const Booking = require('../models/Booking');
const { generateSeats } = require('../utils/seatUtils');

// =============================
// GET ALL SHOWTIMES
// =============================
const getAllShowtimes = async () => {
  return await Showtime.find().populate('movie');
};

// =============================
// CREATE SHOWTIME
// =============================
const createShowtime = async (data) => {
  return await Showtime.create(data);
};

// =============================
// GET SHOWTIMES BY MOVIE
// =============================
const getShowtimesByMovie = async (movieId) => {
  return await Showtime.find({ movie: movieId }).populate('movie');
};

// =============================
// GET SEAT AVAILABILITY
// =============================
const getSeatAvailability = async (showtimeId) => {
  // 1. Check showtime
  const showtime = await Showtime.findById(showtimeId);
  if (!showtime) {
    throw new Error('Showtime not found');
  }

  // 2. Generate seats
  const allSeats = generateSeats();

  // 3. Get booked seats (CONFIRMED only)
  const bookings = await Booking.find({
    showtime: showtimeId,
    status: 'CONFIRMED',
  });

  const bookedSeats = bookings.flatMap((b) => b.seats);

  // 4. Available seats
  const availableSeats = allSeats.filter(
    (seat) => !bookedSeats.includes(seat)
  );

  return {
    totalSeats: allSeats.length,
    bookedSeats,
    availableSeats,
  };
};

module.exports = {
  getAllShowtimes,
  createShowtime,
  getShowtimesByMovie,
  getSeatAvailability,
};
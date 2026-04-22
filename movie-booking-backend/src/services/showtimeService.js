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
// =============================
// CREATE SHOWTIME (with validation)
// =============================
const createShowtime = async (data) => {
  const { movieId, roomId, startTime, endTime, basePrice } = data;

  // 1. Check movie exists
  const movie = await Movie.findById(movieId);
  if (!movie) {
    throw new Error('Movie not found');
  }

  // 2. Check time logic
  if (new Date(startTime) >= new Date(endTime)) {
    throw new Error('Invalid time range');
  }

  // 3. Check overlapping showtime in same room
  const overlap = await Showtime.findOne({
    roomId,
    $or: [
      {
        startTime: { $lt: endTime },
        endTime: { $gt: startTime }
      }
    ]
  });

  if (overlap) {
    throw new Error('Showtime overlaps in same room');
  }

  // 4. Create showtime
  const showtime = await Showtime.create({
    movie: movieId,
    roomId,
    startTime,
    endTime,
    basePrice
  });

  return showtime;
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
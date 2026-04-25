const Showtime = require('../models/Showtime');
const Booking = require('../models/Booking');
const Movie = require('../models/Movie');
const { generateSeats } = require('../utils/seatUtils');

// GET ALL
const getAllShowtimes = async () => {
  return await Showtime.find().populate('movie');
};

// GET ONE
const getShowtimeById = async (id) => {
  const showtime = await Showtime.findById(id).populate('movie');
  if (!showtime) throw new Error('Showtime not found');
  return showtime;
};

// CREATE
const createShowtime = async (data) => {
  const { movieId, roomId, totalSeats, startTime, endTime, basePrice } = data;

  const movie = await Movie.findById(movieId);
  if (!movie) throw new Error('Movie not found');

  if (new Date(startTime) >= new Date(endTime)) {
    throw new Error('Invalid time range');
  }

  const overlap = await Showtime.findOne({
    roomId,
    startTime: { $lt: endTime },
    endTime: { $gt: startTime }
  });

  if (overlap) throw new Error('Showtime overlaps in same room');

  return await Showtime.create({
    movie: movieId,
    room: roomId,
    totalSeats,
    startTime,
    endTime,
    basePrice
  });
};

// UPDATE
const updateShowtime = async (id, data) => {
  const showtime = await Showtime.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true
  });

  if (!showtime) throw new Error('Showtime not found');
  return showtime;
};

// DELETE
const deleteShowtime = async (id) => {
  const showtime = await Showtime.findByIdAndDelete(id);
  if (!showtime) throw new Error('Showtime not found');
  return true;
};

// GET BY MOVIE
const getShowtimesByMovie = async (movieId) => {
  return await Showtime.find({ movie: movieId }).populate('movie');
};

// GET SEATS
const getSeatAvailability = async (showtimeId) => {
  const showtime = await Showtime.findById(showtimeId);
  if (!showtime) throw new Error('Showtime not found');

  const allSeats = generateSeats();

  const bookings = await Booking.find({
    showtime: showtimeId,
    status: 'CONFIRMED',
  });

  const bookedSeats = bookings.flatMap((b) => b.seats);

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
  getShowtimeById,
  createShowtime,
  updateShowtime,
  deleteShowtime,
  getShowtimesByMovie,
  getSeatAvailability,
};
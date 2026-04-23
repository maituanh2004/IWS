const Booking = require('../models/Booking');
const Showtime = require('../models/Showtime');
const { validateSeats } = require('../utils/seatUtils');

// =============================
// VALIDATE SHOWTIME
// =============================
const validateShowtime = async (showtimeId) => {
  const showtime = await Showtime.findById(showtimeId);

  if (!showtime) throw new Error('Showtime not found');

  if (new Date() >= new Date(showtime.startTime)) {
    throw new Error('Showtime already started');
  }

  return showtime;
};

// =============================
// VALIDATE SEATS INPUT
// =============================
const validateSeatInput = (seats) => {
  if (!Array.isArray(seats) || seats.length === 0) {
    throw new Error('Seats are required');
  }

  const uniqueSeats = new Set(seats);
  if (uniqueSeats.size !== seats.length) {
    throw new Error('Duplicate seats not allowed');
  }

  if (!validateSeats(seats)) {
    throw new Error('Invalid seat format');
  }
};

// =============================
// CHECK AVAILABILITY (optimized)
// =============================
const checkSeatAvailability = async (showtimeId, seats) => {
  const bookedSeats = await Booking.distinct('seats', {
    showtime: showtimeId,
    status: 'CONFIRMED',
  });

  const conflictSeat = seats.find(seat =>
    bookedSeats.includes(seat)
  );

  if (conflictSeat) {
    throw new Error(`Seat ${conflictSeat} already booked`);
  }
};

// =============================
// FINAL DB CHECK (anti-race)
// =============================
const checkSeatConflictInDB = async (showtimeId, seats) => {
  const existing = await Booking.findOne({
    showtime: showtimeId,
    seats: { $in: seats },
    status: 'CONFIRMED'
  });

  if (existing) {
    throw new Error('One or more seats already booked');
  }
};

// =============================
// CALCULATE PRICE
// =============================
const calculatePrice = (seats, showtime) => {
  const VIP_ROWS = ['C', 'D', 'E', 'F'];

  return seats.reduce((total, seat) => {
    const row = seat[0];
    return total + (VIP_ROWS.includes(row)
      ? showtime.basePrice + 5000
      : showtime.basePrice);
  }, 0);
};

// =============================
// CREATE BOOKING
// =============================
const createBooking = async (userId, showtimeId, seats) => {
  const showtime = await validateShowtime(showtimeId);

  validateSeatInput(seats);

  await checkSeatAvailability(showtimeId, seats);

  await checkSeatConflictInDB(showtimeId, seats);

  const totalPrice = calculatePrice(seats, showtime);

  return await Booking.create({
    user: userId,
    showtime: showtimeId,
    seats,
    totalPrice,
    status: 'CONFIRMED',
    paymentStatus: 'SUCCESS',
  });
};

// =============================
// GET MY BOOKINGS
// =============================
const getMyBookings = async (userId) => {
  return await Booking.find({ user: userId })
    .populate({
      path: 'showtime',
      populate: { path: 'movie' },
    })
    .sort('-createdAt')
    .lean();
};

// =============================
// GET BOOKING BY ID
// =============================
const getBookingById = async (bookingId) => {
  return await Booking.findById(bookingId)
    .populate('user', 'name email')
    .populate({
      path: 'showtime',
      populate: { path: 'movie' },
    })
    .lean();
};

module.exports = {
  createBooking,
  getMyBookings,
  getBookingById,
};
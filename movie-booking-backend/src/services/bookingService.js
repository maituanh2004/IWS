const Booking = require('../models/Booking');
const Showtime = require('../models/Showtime');
const { validateSeats } = require('../utils/seatUtils');

// =============================
// 1. VALIDATE SHOWTIME
// =============================
const validateShowtime = async (showtimeId) => {
  const showtime = await Showtime.findById(showtimeId);

  if (!showtime) {
    throw new Error('Showtime not found');
  }

  if (new Date() >= new Date(showtime.startTime)) {
    throw new Error('Showtime already started');
  }

  return showtime;
};

// =============================
// 2. VALIDATE SEATS INPUT
// =============================
const validateSeatInput = (seats) => {
  if (!seats || seats.length === 0) {
    throw new Error('Seats are required');
  }

  // check duplicate
  const uniqueSeats = new Set(seats);
  if (uniqueSeats.size !== seats.length) {
    throw new Error('Duplicate seats not allowed');
  }

  // check format
  if (!validateSeats(seats)) {
    throw new Error('Invalid seat format');
  }
};

// =============================
// 3. CHECK AVAILABILITY
// =============================
const checkSeatAvailability = async (showtimeId, seats) => {
  const bookings = await Booking.find({
    showtime: showtimeId,
    status: 'CONFIRMED', // IMPORTANT
  });

  const bookedSeats = bookings.flatMap((b) => b.seats);

  const conflictSeat = seats.find((seat) =>
    bookedSeats.includes(seat)
  );

  if (conflictSeat) {
    throw new Error(`Seat ${conflictSeat} already booked`);
  }
};

// =============================
// 4. CALCULATE PRICE -- VIP LOGIC
// =============================
const calculatePrice = (seats, showtime) => {
  const VIP_ROWS = ['C', 'D', 'E', 'F'];

  let total = 0;

  for (let seat of seats) {
    const row = seat.charAt(0);

    if (VIP_ROWS.includes(row)) {
      total += showtime.basePrice + 5000;
    } else {
      total += showtime.basePrice;
    }
  }

  return total;
};
// =============================
// 5. CREATE BOOKING
// =============================
const createBooking = async (userId, showtimeId, seats) => {
  const showtime = await validateShowtime(showtimeId);

  validateSeatInput(seats);

  await checkSeatAvailability(showtimeId, seats);

  const totalPrice = calculatePrice(seats, showtime);

  const booking = await Booking.create({
    user: userId,
    showtime: showtimeId,
    seats,
    totalPrice,
    status: 'CONFIRMED',
    paymentStatus: 'SUCCESS',
  });

  return booking;
};

// =============================
// 6. GET MY BOOKINGS
// =============================
const getMyBookings = async (userId) => {
  return await Booking.find({ user: userId })
    .populate({
      path: 'showtime',
      populate: { path: 'movie' },
    })
    .sort('-createdAt');
};

// =============================
// 7. GET BOOKING BY ID
// =============================
const getBookingById = async (bookingId) => {
  return await Booking.findById(bookingId)
    .populate('user', 'name email')
    .populate({
      path: 'showtime',
      populate: { path: 'movie' },
    });
};

// =============================
// EXPORT
// =============================
module.exports = {
  createBooking,
  getMyBookings,
  getBookingById,
};
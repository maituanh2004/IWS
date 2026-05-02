const mongoose = require('mongoose');
const Booking = require('../models/Booking');
const Showtime = require('../models/Showtime');
const Discount = require('../models/Discount');
const { validateSeats, validateAndExpandSeats, getFixedSeats } = require('../utils/seatUtils');

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
const validateSeatInput = (seats, totalSeats) => {
  if (!seats) {
    throw new Error('Seats field is required');
  }

  if (!Array.isArray(seats)) {
    throw new Error('Seats must be an array');
  }

  if (seats.length === 0) {
    throw new Error('Seats cannot be empty');
  }

  const uniqueSeats = new Set(seats);
  if (uniqueSeats.size !== seats.length) {
    throw new Error('Duplicate seats not allowed');
  }

  if (!validateSeats(seats, totalSeats)) {
    throw new Error('Invalid seat format');
  }
};

const checkSeatAvailability = async (showtimeId, seats, bookingGroupId) => {
  const now = new Date();

  const existing = await Booking.find({
    showtime: showtimeId,
    seat: { $in: seats },
    $or: [
      { status: 'CONFIRMED' },
      {
        status: 'PENDING',
        expiresAt: { $gt: now }
      }
    ]
  });
  
  if (bookingGroupId) {
    query.bookingGroupId = { $ne: bookingGroupId };
  }

  if (existing.length > 0) {
    const takenSeats = existing.map(b => b.seat);
    throw new Error(`Seats already booked: ${takenSeats.join(', ')}`);
  }
};

// // =============================
// // FINAL DB CHECK (anti-race)
// // =============================
// const checkSeatConflictInDB = async (showtimeId, seats) => {
//   const existing = await Booking.findOne({
//     showtime: showtimeId,
//     seats: { $in: seats },
//     status: 'CONFIRMED'
//   });

//   if (existing) {
//     throw new Error('One or more seats already booked');
//   }
// };

// =============================
// CALCULATE PRICE
// =============================
const calculatePrice = (seats, showtime) => {
  const seatMap = new Map(
    getFixedSeats(showtime.totalSeats).map(s => [s.code, s])
  );

  return seats.reduce((total, seat) => {
    const seatInfo = seatMap.get(seat);

    if (seatInfo.type === 'VIP') {
      return total + showtime.basePrice + 5000;
    }

    if (seatInfo.type === 'COUPLE') {
      return total + showtime.basePrice + 20000;
    }

    return total + showtime.basePrice;
  }, 0);
};

// =============================
// CREATE BOOKING
// =============================
const createBooking = async (userId, showtimeId, seats, discountCode) => {
  const bookingGroupId = new mongoose.Types.ObjectId();

  const showtime = await validateShowtime(showtimeId);

  validateSeatInput(seats, showtime.totalSeats);

  const expandedSeats = validateAndExpandSeats(
    seats,
    showtime.totalSeats
  );

  const { originalPrice, finalPrice } = await previewBooking(
    showtimeId,
    expandedSeats,
    discountCode
  );
  // const { originalPrice, finalPrice } = await previewBooking(
  //   showtimeId,
  //   seats,
  //   discountCode
  // );

  // use floor + distribute remainder
  const basePrice = Math.floor(finalPrice / expandedSeats.length);
  let remainder = finalPrice - basePrice * expandedSeats.length;

  const baseOriginal = Math.floor(originalPrice / expandedSeats.length);
  let originalRemainder = originalPrice - baseOriginal * expandedSeats.length;

  const bookings = expandedSeats.map(seat => {
    const extra = remainder > 0 ? 1 : 0;
    if (remainder > 0) remainder--;

    const originalExtra = originalRemainder > 0 ? 1 : 0;
    if (originalRemainder > 0) originalRemainder--;

    return {
      user: userId,
      showtime: showtimeId,
      seat,
      bookingGroupId,
      totalPrice: basePrice + extra,
      originalPrice: baseOriginal + originalExtra,
      discountCode: discountCode?.trim()?.toUpperCase() || null,
      status: 'PENDING',
      paymentStatus: 'PENDING',
      expiresAt: new Date(Date.now() + 5 * 60 * 1000)
    };
  });

  try {
    await Booking.insertMany(bookings, { ordered: true });
  } catch (err) {
    if (err.code === 11000) {
      throw new Error('Some selected seats are no longer available');
    }
    throw err;
  }

  return {
    bookingGroupId,
    totalPrice: finalPrice,
    originalPrice,
    status: 'PENDING',
    paymentStatus: 'PENDING'
  };
};

// Preview booking page
const previewBooking = async (showtimeId, seats, discountCode) => {
  const showtime = await validateShowtime(showtimeId);

  validateSeatInput(seats, showtime.totalSeats);

  const expandedSeats = validateAndExpandSeats(
    seats,
    showtime.totalSeats
  );

  await checkSeatAvailability(showtimeId, expandedSeats);

  let totalPrice = calculatePrice(expandedSeats, showtime);

  // // 🔥 FIX 1: thêm totalSeats
  // validateSeatInput(seats, showtime.totalSeats);

  // // 🔥 FIX 2: check ghế đã bị giữ
  // await checkSeatAvailability(showtimeId, seats);
  // let totalPrice = calculatePrice(seats, showtime);  
  let finalPrice = totalPrice;
  let appliedDiscount = null;

  const code = discountCode?.trim();

  if (code) {
    const discount = await Discount.findOne({
      code: code.toUpperCase()
    });

    if (!discount) throw new Error('Invalid discount');

    if (new Date() > new Date(discount.expiryDate)) {
      throw new Error('Discount expired');
    }

    if (totalPrice < discount.minPrice) {
      throw new Error(`Min price is ${discount.minPrice}`);
    }

    finalPrice = Math.round(
      totalPrice - (totalPrice * discount.percentage) / 100
    );

    appliedDiscount = {
      code: discount.code,
      percentage: discount.percentage
    };
  }

  return {
    originalPrice: totalPrice,
    finalPrice,
    discount: appliedDiscount
  };
};

module.exports = {
  createBooking,
  previewBooking
};
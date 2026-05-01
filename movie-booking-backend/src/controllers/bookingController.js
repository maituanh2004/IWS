const bookingService = require('../services/bookingService');
const Booking = require('../models/Booking');
const { groupBookings } = require('../utils/bookingUtils');

// CREATE BOOKING
exports.createBooking = async (req, res) => {
  try {
    const { showtimeId, seats, discountCode } = req.body;

    if (!showtimeId || !seats) {
      return res.status(400).json({
        success: false,
        message: 'showtimeId and seats are required'
      });
    }

    const result = await bookingService.createBooking(
      req.user._id,
      showtimeId,
      seats,
      discountCode,
    );

    res.status(201).json({
      success: true,
      data: result
    });

  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// GET MY BOOKINGS
exports.getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate({
        path: 'showtime',
        populate: { path: 'movie' },
      })
      .lean();

    const grouped = groupBookings(bookings);

    res.status(200).json({
      success: true,
      data: grouped
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// GET BOOKING DETAIL
exports.getBookingsByUserId = async (req, res) => {
  try {
    const { userId } = req.params;
    const bookings = await Booking.find({ user: userId })
      .populate({
        path: 'showtime',
        populate: { path: 'movie' },
      })
      .sort({ createdAt: -1 })
      .lean();

    const grouped = groupBookings(bookings);

    res.status(200).json({
      success: true,
      data: grouped
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// Preview booking page
exports.previewBooking = async (req, res) => {
  try {
    const { showtimeId, seats, discountCode } = req.body;

    if (!showtimeId || !seats) {
      return res.status(400).json({
        success: false,
        message: 'showtimeId and seats are required'
      });
    }

    const result = await bookingService.previewBooking(
      showtimeId,
      seats,
      discountCode
    );

    res.json({
      success: true,
      data: result
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
};

// GET BOOKING BY GROUP ID
exports.getBookingByGroupId = async (req, res) => {
  try {
    const { groupId } = req.params;
    const bookings = await Booking.find({ bookingGroupId: groupId })
      .populate({
        path: 'showtime',
        populate: { path: 'movie' },
      })
      .lean();

    if (!bookings || bookings.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    const grouped = groupBookings(bookings);

    res.status(200).json({
      success: true,
      data: grouped[0] // Return the single group
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// GET BOOKINGS BY SHOWTIME ID
exports.getBookingsByShowtime = async (req, res) => {
  console.log('DEBUG: getBookingsByShowtime hit with ID:', req.params.showtimeId);
  try {
    const { showtimeId } = req.params;
    const bookings = await Booking.find({ showtime: showtimeId })
      .populate('user', 'name email')
      .lean();

    const grouped = groupBookings(bookings);

    res.status(200).json({
      success: true,
      data: grouped
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};
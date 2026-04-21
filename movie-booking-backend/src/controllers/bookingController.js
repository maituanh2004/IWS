const bookingService = require('../services/bookingService');

// CREATE BOOKING
exports.createBooking = async (req, res) => {
  try {
    const { showtimeId, seats } = req.body;

    const booking = await bookingService.createBooking(
      req.user._id,
      showtimeId,
      seats
    );

    res.status(201).json({
      success: true,
      data: booking,
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
    const bookings = await bookingService.getMyBookings(req.user._id);

    res.status(200).json({
      success: true,
      data: bookings,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET BOOKING DETAIL
exports.getBookingById = async (req, res) => {
  try {
    const booking = await bookingService.getBookingById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }

    // ownership check
    if (
      req.user.role !== 'admin' &&
      booking.user._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized',
      });
    }

    res.status(200).json({
      success: true,
      data: booking,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
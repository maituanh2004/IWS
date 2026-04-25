<<<<<<< HEAD
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
=======
const Booking = require('../models/Booking');
const Showtime = require('../models/Showtime');
const Discount = require('../models/Discount');
const { generateSeats } = require('../utils/seatUtils');

exports.createBooking = async (req, res) => {
    try {
        const {showtimeId, seats, discountCode} = req.body;

        if (!seats || seats.length === 0){
            return res.status(400).json({message: 'No seats seleted'});
        }

        const showtime = await Showtime.findById(showtimeId).populate('movie');
        if (!showtime) {
            return res.status(404).json({ message: 'Showtime not found' });
        }

        const allSeats = generateSeats();

        
        //Validate seats exist
        const invalidSeats = seats.filter(seat => !allSeats.includes(seat));
        if (invalidSeats.length > 0){
            return res.status(400).json({ message: 'Invalid seats', invalidSeats});
        }
        
        //Duplicate check
        const uniqueSeats = [...new Set(seats)];
        if (uniqueSeats.length !== seats.length) {
            return res.status(400).json({message: 'Duplicate seats in request'});
        }

        //Get booked seats
        const bookings = await Booking.find({
            showtime: showtimeId,
            status: 'CONFIRMED'
        });

        const bookedSeats = bookings.flatMap(b => b.seats);

        //Check conflict
        const conflict = seats.filter(seat => bookedSeats.includes(seat));
        if (conflict.length > 0){
            return res.status(400).json({
                message: 'Seats already booked',
                conflict
            });
        }

        const originalPrice = seats.length * showtime.price;
        let totalPrice = originalPrice;
        let appliedDiscountCode = null;

        if (discountCode && discountCode !== 'none') {
            const discount = await Discount.findOne({ code: discountCode.toUpperCase() });
            
            if (!discount) {
                return res.status(404).json({ message: 'Discount code not found' });
            }

            // Check if expired
            if (new Date(discount.expiryDate) < new Date()) {
                return res.status(400).json({ message: 'Discount code has expired' });
            }

            // Check if available for this movie
            const movieVouchers = showtime.movie.availableVouchers || [];
            if (!movieVouchers.includes(discount.code)) {
                return res.status(400).json({ message: 'Discount code is not applicable for this movie' });
            }

            // Check min price
            if (originalPrice < discount.minPrice) {
                return res.status(400).json({ message: `Minimum price for this voucher is ${discount.minPrice}` });
            }

            // Apply discount
            totalPrice = Math.floor(originalPrice * (1 - discount.percentage / 100));
            appliedDiscountCode = discount.code;
        }

        const booking = await Booking.create ({
            user: req.user.id,
            showtime: showtimeId,
            seats,
            originalPrice,
            totalPrice,
            discountCode: appliedDiscountCode,
            status: 'CONFIRMED'
        });

        const populatedBooking = await Booking.findById(booking._id)
            .populate({
                path: 'showtime',
                populate: { path: 'movie' }
            });

        res.status(201).json(populatedBooking);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getMyBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({ user: req.user.id })
            .populate({
                path: 'showtime',
                populate: {
                    path: 'movie'
                }
            });

        res.json(bookings);

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getBookingsByUserId = async (req, res) => {
    try {
        const { userId } = req.params;

        const bookings = await Booking.find({ user: userId })
            .populate('showtime');

        res.json(bookings);

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.cancelBooking = async (req, res) => {
    try {
        const { bookingId } = req.params;

        const booking = await Booking.findById(bookingId);

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        // check permission
        if (
            req.user.role !== 'admin' &&
            booking.user.toString() !== req.user.id
        ) {
            return res.status(403).json({ message: 'Forbidden' });
        }

        if (booking.status === 'CANCELLED') {
            return res.status(400).json({ message: 'Booking already cancelled' });
        }

        booking.status = 'CANCELLED';
        await booking.save();

        res.json({
            message: 'Booking cancelled successfully',
            booking
        });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
>>>>>>> 60dd4911ff6d926d796ba6c51247757237b08935
};
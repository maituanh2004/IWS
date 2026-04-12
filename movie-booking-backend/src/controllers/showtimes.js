const Showtime = require('../models/Showtime');
const Booking = require('../models/Booking');

// @desc    Get all showtimes
// @route   GET /api/showtimes
// @access  Public
exports.getShowtimes = async (req, res, next) => {
    try {
        const showtimes = await Showtime.find().populate('movie');
        res.status(200).json({ success: true, count: showtimes.length, data: showtimes });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Create showtime
// @route   POST /api/showtimes
// @access  Private/Admin
exports.createShowtime = async (req, res, next) => {
    try {
        const showtime = await Showtime.create(req.body);
        res.status(201).json({ success: true, data: showtime });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

exports.getSeats = async (req, res) => {
    try {
        const { showtimeId } = req.params;

        const rows = 'ABCDEFGH';
        const allSeats = [];

        for (let i = 0; i < rows.length; i++) {
            for (let j = 1; j <= 10; j++) {
                allSeats.push(`${rows[i]}${j}`);
            }
        }

        const bookings = await Booking.find({
            showtime: showtimeId,
            status: 'CONFIRMED'
        });

        const bookedSeats = bookings.flatMap(b => b.seats);

        const availableSeats = allSeats.filter(
            seat => !bookedSeats.includes(seat)
        );

        res.json({
            totalSeats: allSeats.length,
            bookedSeats,
            availableSeats,
            allSeats
        });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
const Showtime = require('../models/Showtime');

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

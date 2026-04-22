const Showtime = require('../models/Showtime');
const Movie = require('../models/Movie');
// @desc    Get all showtimes
// @route   GET /api/showtimes
// @access  Public
exports.getShowtimes = async (req, res, next) => {
    try {
        const showtimes = await Showtime.find().populate('movie');
        res.status(200).json({
            success: true,
            count: showtimes.length,
            data: showtimes
        });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Get single showtime
// @route   GET /api/showtimes/:id
// @access  Public
exports.getShowtime = async (req, res) => {
    try {
        const showtime = await Showtime.findById(req.params.id).populate('movie');

        if (!showtime) {
            return res.status(404).json({
                success: false,
                error: 'Showtime not found'
            });
        }

        res.status(200).json({
            success: true,
            data: showtime
        });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Create showtime
// @route   POST /api/showtimes
// @access  Private/Admin
exports.createShowtime = async (req, res, next) => {
    try {
        const { movie, startTime, endTime, room, totalSeats, price } = req.body;

        const movieExists = await Movie.findById(movie);
        if (!movieExists) {
            return res.status(404).json({
                success: false,
                error: 'Movie not found'
            });
        }

        const showtime = await Showtime.create({
            movie,
            startTime,
            endTime,
            room,
            totalSeats,
            price
        });

        const populatedShowtime = await Showtime.findById(showtime._id).populate('movie');

        res.status(201).json({
            success: true,
            data: populatedShowtime
        });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};
// @desc    Update showtime
// @route   PUT /api/showtimes/:id
// @access  Private/Admin
exports.updateShowtime = async (req, res) => {
    try {
        if (req.body.movie) {
            const movieExists = await Movie.findById(req.body.movie);
            if (!movieExists) {
                return res.status(404).json({
                    success: false,
                    error: 'Movie not found'
                });
            }
        }

        const showtime = await Showtime.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        }).populate('movie');

        if (!showtime) {
            return res.status(404).json({
                success: false,
                error: 'Showtime not found'
            });
        }

        res.status(200).json({
            success: true,
            data: showtime
        });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Delete showtime
// @route   DELETE /api/showtimes/:id
// @access  Private/Admin
exports.deleteShowtime = async (req, res) => {
    try {
        const showtime = await Showtime.findByIdAndDelete(req.params.id);

        if (!showtime) {
            return res.status(404).json({
                success: false,
                error: 'Showtime not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Showtime deleted'
        });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

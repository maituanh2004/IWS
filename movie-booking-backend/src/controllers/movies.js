const Movie = require('../models/Movie');

// @desc    Get all movies
// @route   GET /api/movies
// @access  Public
exports.getMovies = async (req, res, next) => {
    try {
        const movies = await Movie.find();
        res.status(200).json({ success: true, count: movies.length, data: movies });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Get single movie
// @route   GET /api/movies/:id
// @access  Public
exports.getMovie = async (req, res, next) => {
    try {
        const movie = await Movie.findById(req.params.id);
        if (!movie) {
            return res.status(404).json({ success: false, error: 'Movie not found' });
        }
        res.status(200).json({ success: true, data: movie });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Create movie
// @route   POST /api/movies
// @access  Private/Admin
exports.createMovie = async (req, res, next) => {
    try {
        const movie = await Movie.create(req.body);
        res.status(201).json({ success: true, data: movie });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

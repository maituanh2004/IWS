const express = require('express');
const {
    getMovies,
    getMovie,
    createMovie,
    deleteMovie,
    updateMovie,
    getShowtimesByMovie
} = require('../controllers/movieController');

const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.route('/')
    .get(getMovies)
    .post(protect, authorize('admin'), createMovie); // only admin can create movie

router.route('/:id')
    .get(getMovie)
    .put(protect, authorize('admin'), updateMovie)
    .delete(protect, authorize('admin'), deleteMovie);

// Get showtimes of a movie
router.get('/:id/showtimes', getShowtimesByMovie);

module.exports = router;

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
    .put(updateMovie)
    .delete(deleteMovie);

router.get('/:id/showtimes', getShowtimesByMovie);

module.exports = router;

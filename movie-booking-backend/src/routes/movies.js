const express = require('express');
const {
    getMovies,
    getMovie,
    createMovie,
    deleteMovie,
    updateMovie
} = require('../controllers/movies');

const { protect, authorize } = require('../middleware/auth');
const router = express.Router();
router.route('/')
    .get(getMovies)
    .post(protect, authorize('admin'), createMovie);
router.route('/:id')
    .get(getMovie)
    .put(protect, authorize('admin'), updateMovie)
    .delete(protect, authorize('admin'), deleteMovie);

module.exports = router;
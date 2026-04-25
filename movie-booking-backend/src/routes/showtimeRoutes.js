const express = require('express');
const {
    getShowtimes,
    getShowtime,
    createShowtime,
    updateShowtime,
    deleteShowtime,
    getShowtimesByMovie,
    getSeats
} = require('../controllers/showtimeController');

const { protect, authorize } = require('../middleware/auth');
const router = express.Router();

router.route('/')
    .get(getShowtimes)
    .post(protect, authorize('admin'), createShowtime);

// Specific named paths BEFORE the generic /:id param to avoid Express matching 'movie' as an id
// router.get('/movie/:movieId', getShowtimesByMovie); --- Đã có bên movieRoutes rồi, xoá đi

router.route('/:id')
    .get(getShowtime)
    .put(protect, authorize('admin'), updateShowtime)
    .delete(protect, authorize('admin'), deleteShowtime);

router.get('/:showtimeId/seats', getSeats);

module.exports = router;

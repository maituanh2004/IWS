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
    .post(createShowtime);

// Specific named paths BEFORE the generic /:id param to avoid Express matching 'movie' as an id
router.get('/movie/:movieId', getShowtimesByMovie);

router.route('/:id')
    .get(getShowtime)
    .put(updateShowtime)
    .delete(deleteShowtime);

router.get('/:id/seats', getSeats);

module.exports = router;

const express = require('express');
const { getShowtimes, createShowtime, getShowtimesByMovie, getSeats } = require('../controllers/showtimes');

const router = express.Router();

router.route('/')
    .get(getShowtimes)
    .post(createShowtime);
router.get('/movie/:movieId', getShowtimesByMovie);
router.get('/:showtimeId/seats', getSeats);

module.exports = router;

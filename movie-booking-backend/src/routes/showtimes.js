const express = require('express');
const {
    getShowtimes,
    getShowtime,
    createShowtime,
    updateShowtime,
    deleteShowtime
} = require('../controllers/showtimes');
const { getShowtimes, createShowtime, getShowtimesByMovie, getSeats } = require('../controllers/showtimes');

const { protect, authorize } = require('../middleware/auth');
const router = express.Router();

router.route('/')
    .get(getShowtimes)
    .post(createShowtime);

module.exports = router;

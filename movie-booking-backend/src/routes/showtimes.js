const express = require('express');
const { getShowtimes, createShowtime } = require('../controllers/showtimes');

const router = express.Router();

router.route('/')
    .get(getShowtimes)
    .post(createShowtime);

module.exports = router;

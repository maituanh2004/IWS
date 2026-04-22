const express = require('express');
const { getShowtimes, createShowtime, getShowtimesByMovie, getSeats } = require('../controllers/showtimeController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/', getShowtimes);
router.post('/', protect, authorize('admin'), createShowtime);
router.get('/:showtimeId/seats', getSeats);

module.exports = router;

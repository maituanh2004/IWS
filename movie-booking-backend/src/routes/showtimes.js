const express = require('express');
const {
    getShowtimes,
    getShowtime,
    createShowtime,
    updateShowtime,
    deleteShowtime
} = require('../controllers/showtimes');

const { protect, authorize } = require('../middleware/auth');
const router = express.Router();

router.route('/')
    .get(getShowtimes)
    .post(protect, authorize('admin'), createShowtime);

router.route('/:id')
    .get(getShowtime)
    .put(protect, authorize('admin'), updateShowtime)
    .delete(protect, authorize('admin'), deleteShowtime);

module.exports = router;

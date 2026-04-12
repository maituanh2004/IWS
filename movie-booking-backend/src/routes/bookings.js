const express = require('express');
const router = express.Router();
const { createBooking, getMyBookings } = require('../controllers/bookings');
const { protect } = require('../middleware/auth');

router.post('/', protect, createBooking);
router.get('/me', protect, getMyBookings);

module.exports = router;
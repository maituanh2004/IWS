const express = require('express');
const router = express.Router();
const { createBooking, getMyBookings, getBookingsByUserId, cancelBooking } = require('../controllers/bookings');
const { protect } = require('../middleware/auth');

router.post('/', protect, createBooking);
router.get('/me', protect, getMyBookings);
router.get('/user/:userId', protect, getBookingsByUserId);
router.put('/:bookingId/cancel', protect, cancelBooking);

module.exports = router;
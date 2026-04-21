const express = require('express');
const router = express.Router();

const {
  createBooking,
  getMyBookings,
  getBookingById,
} = require('../controllers/bookingController');

const { protect } = require('../middleware/auth');

router.post('/', protect, createBooking);
router.get('/me', protect, getMyBookings);
router.get('/:id', protect, getBookingById);

module.exports = router;
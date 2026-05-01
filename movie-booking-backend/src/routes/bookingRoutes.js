const express = require('express');
const router = express.Router();

const {
  createBooking,
  previewBooking,
  getMyBookings,
  getBookingsByUserId,
  getBookingByGroupId
} = require('../controllers/bookingController');

const { 
  protect,
  authorize
} = require('../middleware/auth');
const { validateBooking } = require('../middleware/validateBooking');

router.post('/preview', protect, previewBooking);

router.post('/', protect, validateBooking, createBooking);

router.get('/me', protect, getMyBookings);

router.get('/group/:bookingGroupId', protect, getBookingByGroupId);

// admin xem user khác
router.get('/user/:userId', protect, authorize('admin'), getBookingsByUserId);

module.exports = router;
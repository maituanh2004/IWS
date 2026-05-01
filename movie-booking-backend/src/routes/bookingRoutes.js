const express = require('express');
const router = express.Router();

const {
  createBooking,
  previewBooking,
  getMyBookings,
  getBookingsByUserId,
  getBookingByGroupId,
  getBookingsByShowtime
} = require('../controllers/bookingController');

const { 
  protect,
  authorize
} = require('../middleware/auth');
const { validateBooking } = require('../middleware/validateBooking');

router.use('/showtime/:showtimeId', (req, res, next) => {
  console.log('DEBUG: Booking Route matched /showtime/:showtimeId');
  next();
});

router.get('/showtime/:showtimeId', protect, getBookingsByShowtime);

router.post('/preview', protect, previewBooking);

router.post('/', protect, validateBooking, createBooking);

router.get('/me', protect, getMyBookings);

// admin xem user khác
router.get('/user/:userId', protect, authorize('admin'), getBookingsByUserId);

router.get('/group/:groupId', protect, getBookingByGroupId);

module.exports = router;
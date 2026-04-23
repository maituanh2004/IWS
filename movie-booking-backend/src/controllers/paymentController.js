const Booking = require('../models/Booking');
const { createPaymentUrl } = require('../services/paymentService');

exports.createPayment = async (req, res) => {
  const { bookingId } = req.body;

  const booking = await Booking.findById(bookingId);

  if (!booking) {
    return res.status(404).json({ message: 'Booking not found' });
  }

  const paymentUrl = createPaymentUrl(booking, req.ip);

  res.json({
    success: true,
    paymentUrl
  });
};
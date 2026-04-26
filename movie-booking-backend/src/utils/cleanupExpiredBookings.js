const Booking = require('../models/Booking');

const cleanupExpiredBookings = async () => {
  try {
    const now = new Date();

    const result = await Booking.deleteMany({
      status: 'PENDING',
      paymentStatus: 'PENDING',
      expiresAt: { $lte: now }
    });

    if (result.deletedCount > 0) {
      console.log(`🧹 Cleaned ${result.deletedCount} expired bookings`);
    }

  } catch (err) {
    console.error('❌ Cleanup error:', err.message);
  }
};

module.exports = cleanupExpiredBookings;
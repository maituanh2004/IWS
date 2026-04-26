const Booking = require("../models/Booking");
const { createPaymentUrl } = require("../services/paymentService");

exports.createPayment = async (req, res) => {
  try {
    const { bookingGroupId } = req.body;

    // 👉 get ALL seats in this booking
    const bookings = await Booking.find({ bookingGroupId });

    if (!bookings.length) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    // 👉 calculate total price
    const totalPrice = bookings.reduce(
      (sum, b) => sum + b.totalPrice,
      0
    );

    const paymentUrl = await createPaymentUrl(
      {
        bookingGroupId,
        totalPrice,
      },
      req.ip
    );

    res.json({
      success: true,
      paymentUrl,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

exports.vnpayReturn = async (req, res) => {
  try {
    const { vnp_ResponseCode, vnp_TxnRef } = req.query;

    console.log("VNPay Return:", req.query);

    const bookingGroupId = vnp_TxnRef;

    // 👉 find all bookings in group
    const bookings = await Booking.find({ bookingGroupId });

    if (!bookings.length) {
      return res.send("Booking not found");
    }

    const now = new Date();

    // 👉 check expired BEFORE processing payment
    if (bookings[0].expiresAt && bookings[0].expiresAt <= now) {
      // 🔥 booking hết hạn → xoá luôn để release ghế
      await Booking.deleteMany({ bookingGroupId });

      return res.send("Booking expired ⏰");
    }

    // =============================
    // PAYMENT SUCCESS
    // =============================
    if (vnp_ResponseCode === "00") {
      await Booking.updateMany(
        { bookingGroupId },
        {
          status: "CONFIRMED",
          paymentStatus: "SUCCESS",
          expiresAt: null // 🔥 clear expiry
        }
      );

      return res.send("Payment success ✅");
    }

    // =============================
    // PAYMENT FAILED
    // =============================
    else {
      // 🔥 IMPORTANT: delete to free seats
      await Booking.deleteMany({ bookingGroupId });

      return res.send("Payment failed ❌ (Seats released)");
    }

  } catch (err) {
    console.error(err);
    res.send("Error processing payment");
  }
};
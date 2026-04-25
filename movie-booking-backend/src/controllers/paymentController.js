const Booking = require("../models/Booking");
const { createPaymentUrl } = require("../services/paymentService");

exports.createPayment = async (req, res) => {
  try {
    const { bookingId } = req.body;

    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    const paymentUrl = await createPaymentUrl(booking, req.ip);

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

    console.log(req.query); // 👈 DEBUG

    const booking = await Booking.findById(vnp_TxnRef);

    if (!booking) {
      return res.send("Booking not found");
    }

    if (vnp_ResponseCode === "00") {
      booking.status = "CONFIRMED";
      booking.paymentStatus = "SUCCESS";
    } else {
      booking.paymentStatus = "FAILED";
    }

    await booking.save();

    res.send("Payment processed");
  } catch (err) {
    res.send("Error");
  }
};
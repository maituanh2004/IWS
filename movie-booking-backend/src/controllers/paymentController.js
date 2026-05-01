const Booking = require("../models/Booking");
const { createPaymentUrl } = require("../services/paymentService");

function getSuccessHTML() {
  return `
    <html>
      <body style="text-align:center;margin-top:80px;font-family:sans-serif">
        <h1 style="color:green">Thanh toán thành công 🎉</h1>
        <p>Vui lòng quay lại app để xem vé</p>
      </body>
    </html>
  `;
}
function getFailHTML(message) {
  return `
    <html>
      <body style="text-align:center;margin-top:80px;font-family:sans-serif">
        <h1 style="color:red">${message}</h1>
        <p>Vui lòng quay lại app để thử lại</p>
      </body>
    </html>
  `;
}

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

    const bookings = await Booking.find({ bookingGroupId });

    if (!bookings.length) {
      return res.send(getFailHTML("Không tìm thấy booking"));
    }

    const booking = bookings[0];

    // ✅ nếu đã SUCCESS → không làm gì nữa
    if (booking.paymentStatus === "SUCCESS") {
      console.log("Already SUCCESS → skip update");
      return res.send(getSuccessHTML());
    }

    // ❗ chưa có responseCode → chờ
    if (!vnp_ResponseCode) {
      return res.send(`
        <html>
          <body style="text-align:center;margin-top:80px">
            <h2>Đang xử lý...</h2>
          </body>
        </html>
      `);
    }

    const now = new Date();

    if (booking.expiresAt && booking.expiresAt <= now) {
      await Booking.updateMany(
        { bookingGroupId },
        { status: "FAILED", paymentStatus: "FAILED" }
      );
      return res.send(getFailHTML("Booking đã hết hạn ⏰"));
    }

    // ✅ SUCCESS
    if (vnp_ResponseCode === "00") {
      await Booking.updateMany(
        { bookingGroupId },
        {
          status: "CONFIRMED",
          paymentStatus: "SUCCESS",
          expiresAt: null,
        }
      );

      return res.send(getSuccessHTML());
    }

    // ❗ thêm check này
    if (booking.paymentStatus !== "SUCCESS") {
      await Booking.updateMany(
        { bookingGroupId },
        {
          status: "FAILED",
          paymentStatus: "FAILED"
        }
      );
    }

    return res.send(getFailHTML("Thanh toán thất bại ❌"));

  } catch (err) {
    console.error(err);
    return res.send(getFailHTML("Lỗi hệ thống"));
  }
};
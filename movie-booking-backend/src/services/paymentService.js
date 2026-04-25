import { VNPay, ignoreLogger } from "vnpay";

const vnpay = new VNPay({
  tmnCode: process.env.VNP_TMNCODE,
  secureSecret: process.env.VNP_HASHSECRET,
  vnpayHost: "https://sandbox.vnpayment.vn",
  testMode: true,
  hashAlgorithm: "SHA512",
  loggerFn: ignoreLogger,
});

export const createPaymentUrl = async (booking, ipAddr) => {
  console.log("PAYMENT INPUT:", {
    amount: booking.totalPrice,
    txnRef: booking._id.toString(),
    ip: ipAddr,
    returnUrl: process.env.VNP_RETURN_URL,
    tmnCode: process.env.VNP_TMNCODE
  });

  return vnpay.buildPaymentUrl({
    vnp_Amount: booking.totalPrice,
    vnp_IpAddr: ipAddr || "127.0.0.1",
    vnp_TxnRef: booking._id.toString(),
    vnp_OrderInfo: `Payment for booking ${booking._id}`,
    vnp_OrderType: "other",
    vnp_ReturnUrl: process.env.VNP_RETURN_URL,
  });
};
import { VNPay, ignoreLogger } from "vnpay";

const vnpay = new VNPay({
  tmnCode: process.env.VNP_TMNCODE,
  secureSecret: process.env.VNP_HASHSECRET,
  vnpayHost: "https://sandbox.vnpayment.vn",
  testMode: true,
  hashAlgorithm: "SHA512",
  loggerFn: ignoreLogger,
});

export const createPaymentUrl = async (bookingGroup, ipAddr) => {
  console.log("PAYMENT INPUT:", {
    amount: bookingGroup.totalPrice,
    txnRef: bookingGroup.bookingGroupId,
    ip: ipAddr,
  });

  return vnpay.buildPaymentUrl({
    vnp_Amount: bookingGroup.totalPrice, // ✅ total
    vnp_IpAddr: ipAddr || "127.0.0.1",
    vnp_TxnRef: bookingGroup.bookingGroupId.toString(), // ✅ group id
    vnp_OrderInfo: `Payment for booking ${bookingGroup.bookingGroupId}`,
    vnp_OrderType: "other",
    vnp_ReturnUrl: process.env.VNP_RETURN_URL,
  });
};
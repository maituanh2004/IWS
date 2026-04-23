const crypto = require('crypto');
const qs = require('qs');

const createPaymentUrl = (booking, ipAddr) => {
  const tmnCode = process.env.VNP_TMNCODE;
  const secretKey = process.env.VNP_HASHSECRET;
  const vnpUrl = process.env.VNP_URL;
  const returnUrl = process.env.VNP_RETURN_URL;

  const date = new Date();
  const createDate = date.toISOString().replace(/[-:TZ.]/g, '').slice(0, 14);

  let vnp_Params = {
    vnp_Version: '2.1.0',
    vnp_Command: 'pay',
    vnp_TmnCode: tmnCode,
    vnp_Amount: booking.totalPrice * 100, // VNPAY uses x100
    vnp_CreateDate: createDate,
    vnp_CurrCode: 'VND',
    vnp_IpAddr: ipAddr,
    vnp_Locale: 'vn',
    vnp_OrderInfo: `Booking ${booking._id}`,
    vnp_OrderType: 'other',
    vnp_ReturnUrl: returnUrl,
    vnp_TxnRef: booking._id.toString(),
  };

  // sort params
  vnp_Params = Object.fromEntries(Object.entries(vnp_Params).sort());

  const signData = qs.stringify(vnp_Params, { encode: false });
  const hmac = crypto.createHmac('sha512', secretKey);
  const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

  vnp_Params.vnp_SecureHash = signed;

  return vnpUrl + '?' + qs.stringify(vnp_Params, { encode: true });
};

module.exports = { createPaymentUrl };
const express = require('express');
const router = express.Router();

const {
  createPayment,
  vnpayReturn
} = require('../controllers/paymentController');

const { protect } = require('../middleware/auth');

// Create payment (user must login)
router.post('/', protect, createPayment);

// VNPAY redirect (no protect!)
router.get('/vnpay-return', vnpayReturn);

module.exports = router;
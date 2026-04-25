const express = require('express');
<<<<<<<< HEAD:movie-booking-backend/src/routes/authRoute.js
const { register, login, getMe } = require('../controllers/authController');
========
const { register, login, getMe, updateDetails, updatePassword } = require('../controllers/authController');
>>>>>>>> 60dd4911ff6d926d796ba6c51247757237b08935:movie-booking-backend/src/routes/authRouter.js
const { protect } = require('../middleware/auth');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.put('/updatedetails', protect, updateDetails);
router.put('/updatepassword', protect, updatePassword);

module.exports = router;

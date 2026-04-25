const express = require('express');
const cors = require('cors');

const app = express();

// Body parser
app.use(express.json());

// Enable CORS
app.use(cors());

// Request logger
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});

// Route files
<<<<<<< HEAD
const authRoutes = require('./routes/authRoute');

const movieRoutes = require('./routes/movieRoute');

const showtimeRoutes = require('./routes/showtimeRoute');

const bookingRoutes = require('./routes/bookingRoute');

// Mount routers
app.use('/api/auth', authRoutes);
app.use('/api/movies', movieRoutes);
app.use('/api/showtimes', showtimeRoutes);
app.use('/api/bookings', bookingRoutes);
=======
const auth = require('./routes/authRouter');

const movies = require('./routes/movieRouter');

const showtimes = require('./routes/showtimeRouter');

const bookingRoutes = require('./routes/bookingRouter');
const discounts = require('./routes/discountRouter');

// Mount routers
app.use('/api/auth', auth);
app.use('/api/movies', movies);
app.use('/api/showtimes', showtimes);
app.use('/api/discounts', discounts);
>>>>>>> 60dd4911ff6d926d796ba6c51247757237b08935

app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Movie Booking API',
        version: '1.0.0'
    });
});

module.exports = app;

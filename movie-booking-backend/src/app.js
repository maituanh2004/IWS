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

const authRoutes = require('./routes/authRoutes');

const movieRoutes = require('./routes/movieRoutes');

const showtimeRoutes = require('./routes/showtimeRoutes');

const bookingRoutes = require('./routes/bookingRoutes');

const discounts = require('./routes/discountRoutes');

// Mount routers
app.use('/api/auth', authRoutes);
app.use('/api/movies', movieRoutes);
app.use('/api/showtimes', showtimeRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/discounts', discounts);

app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Movie Booking API',
        version: '1.0.0'
    });
});

module.exports = app;

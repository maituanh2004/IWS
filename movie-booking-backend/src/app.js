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
const authRoutes = require('./routes/authRoute');

const movieRoutes = require('./routes/movieRoute');

const showtimeRoutes = require('./routes/showtimeRoute');

const bookingRoutes = require('./routes/bookingRoute');

// Mount routers
app.use('/api/auth', authRoutes);
app.use('/api/movies', movieRoutes);
app.use('/api/showtimes', showtimeRoutes);
app.use('/api/bookings', bookingRoutes);

app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Movie Booking API',
        version: '1.0.0'
    });
});

module.exports = app;

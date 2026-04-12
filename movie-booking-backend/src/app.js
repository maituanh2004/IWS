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
const auth = require('./routes/auth');

const movies = require('./routes/movies');

const showtimes = require('./routes/showtimes');

const bookingRoutes = require('./routes/bookings');

// Mount routers
app.use('/api/auth', auth);
app.use('/api/movies', movies);
app.use('/api/showtimes', showtimes);
app.use('/api/bookings', bookingRoutes);

app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Movie Booking API',
        version: '1.0.0'
    });
});

module.exports = app;

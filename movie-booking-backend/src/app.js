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

app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Movie Booking API',
        version: '1.0.0'
    });
});

module.exports = app;

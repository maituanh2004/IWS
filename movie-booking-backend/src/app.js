const express = require('express');
const cors = require('cors');

const app = express();

// Body parser
app.use(express.json());

// Enable CORS
app.use(cors());

// Route files
const auth = require('./routes/auth');
const movies = require('./routes/movies');
const showtimes = require('./routes/showtimes');

// Mount routers
app.use('/api/auth', auth);
app.use('/api/movies', movies);
app.use('/api/showtimes', showtimes);

app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Movie Booking API',
        version: '1.0.0'
    });
});

module.exports = app;

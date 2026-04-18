const express = require('express');
const cors = require('cors');

const app = express();

app.use(express.json());
app.use(cors());

app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});

const auth = require('./routes/auth');
const movies = require('./routes/movies');
const showtimes = require('./routes/showtimes');
const discounts = require('./routes/discounts');

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
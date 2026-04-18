const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please add a title'],
        trim: true
    },
    description: {
        type: String,
        required: [true, 'Please add a description']
    },
    poster: {
        type: String,
        default: 'no-photo.jpg'
    },
    duration: {
        type: Number,
        required: [true, 'Please add duration in minutes']
    },
    genre: {
        type: String,
        required: [true, 'Please add genre']
    },
    releaseDate: {
        type: Date,
        required: [true, 'Please add release date']
    },
    price: {
        type: Number,
        required: [true, 'Please add base price']
    },
    voucherCode: {
        type: String,
        default: 'none'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Movie', movieSchema);
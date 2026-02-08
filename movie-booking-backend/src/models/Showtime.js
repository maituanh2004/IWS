const mongoose = require('mongoose');

const showtimeSchema = new mongoose.Schema({
    movie: {
        type: mongoose.Schema.ObjectId,
        ref: 'Movie',
        required: true
    },
    startTime: {
        type: Date,
        required: [true, 'Please add a start time']
    },
    endTime: {
        type: Date,
        required: [true, 'Please add an end time']
    },
    room: {
        type: String,
        required: [true, 'Please add a room number']
    },
    totalSeats: {
        type: Number,
        required: [true, 'Please add total seats']
    },
    price: {
        type: Number,
        required: [true, 'Please add a price']
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Showtime', showtimeSchema);

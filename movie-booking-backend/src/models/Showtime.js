const mongoose = require('mongoose');

// Showtime schema definition for storing movie showtime information
const showtimeSchema = new mongoose.Schema({
    // Reference to the Movie model, required
    movie: {
        type: mongoose.Schema.ObjectId,
        ref: 'Movie',
        required: true
    },
    // Start time of the showtime, required
    startTime: {
        type: Date,
        required: [true, 'Please add a start time']
    },
    // End time of the showtime, required
    endTime: {
        type: Date,
        required: [true, 'Please add an end time']
    },
    // Room number where the showtime is held, required
    room: {
        type: String,
        required: [true, 'Please add a room number']
    },
    // Total number of seats available, required
    totalSeats: {
        type: Number,
        required: [true, 'Please add total seats']
    },
    // Price per ticket, required
    price: {
        type: Number,
        required: [true, 'Please add a price']
    },
    // Timestamp when the showtime was created, defaults to current date
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Export the Showtime model
module.exports = mongoose.model('Showtime', showtimeSchema);

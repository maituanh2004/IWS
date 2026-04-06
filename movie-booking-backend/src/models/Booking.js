const mongoose = require('mongoose');

// Booking schema definition for storing movie ticket bookings
const bookingSchema = new mongoose.Schema({
    // Reference to the User model who made the booking, required
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    // Reference to the Showtime model for which the booking is made, required
    showtime: {
        type: mongoose.Schema.ObjectId,
        ref: 'Showtime',
        required: true
    },
    // Array of selected seat numbers, required
    selectedSeats: [{
        type: String,
        required: true
    }],
    // Total price for the booking, required
    totalPrice: {
        type: Number,
        required: [true, 'Please add total price']
    },
    // Status of the booking, defaults to 'confirmed'
    status: {
        type: String,
        enum: ['confirmed', 'cancelled'],
        default: 'confirmed'
    },
    // Timestamp when the booking was made, defaults to current date
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Export the Booking model
module.exports = mongoose.model('Booking', bookingSchema);
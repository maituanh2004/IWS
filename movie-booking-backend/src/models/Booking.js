const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },

    showtime: {
        type: mongoose.Schema.ObjectId,
        ref: 'Showtime',
        required: true
    },

    seats: {
        type: [String],
        required: true
    },

    totalPrice: {
        type: Number,
        required: true
    },

    originalPrice: {
        type: Number
    },

    discountCode: {
        type: String
    },

    status: {
        type: String,
        enum: ['CONFIRMED', 'CANCELLED'],
        default: 'CONFIRMED'
    },

    paymentStatus: {
        type: String,
        enum: ['PENDING', 'SUCCESS'],
        default: 'SUCCESS'
    },
    
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Booking', bookingSchema);
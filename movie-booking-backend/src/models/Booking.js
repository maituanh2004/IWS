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

    seat: { //change from seats -> seat
        type: String,
        required: true
    },

    bookingGroupId: {
        type: mongoose.Schema.ObjectId,
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
        enum: ['CONFIRMED', 'PENDING'],
        default: 'PENDING'
    },

    paymentStatus: {
        type: String,
        enum: ['PENDING', 'SUCCESS', "FAILED"],
        default: 'PENDING'
    },
    
    createdAt: {
        type: Date,
        default: Date.now
    },

    expiresAt: {
    type: Date,
    default: null
    }
});

// prevent duplicate seats - 1 seat belongs to 1 showtime and booking only
bookingSchema.index(
  { showtime: 1, seat: 1 },
  { unique: true }
);

bookingSchema.index({ bookingGroupId: 1 });

module.exports = mongoose.model('Booking', bookingSchema);
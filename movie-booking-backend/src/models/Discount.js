const mongoose = require('mongoose');

const discountSchema = new mongoose.Schema({
    code: {
        type: String,
        required: [true, 'Please add discount code'],
        unique: true,
        trim: true,
        uppercase: true
    },
    percentage: {
        type: Number,
        required: [true, 'Please add discount percentage'],
        min: 1,
        max: 100
    },
    minPrice: {
        type: Number,
        default: 0
    },
    type: {
        type: String,
        enum: ['silver', 'gold', 'custom'],
        default: 'custom'
    },
    expiryDate: {
        type: Date,
        required: [true, 'Please add expiry date']
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Discount', discountSchema);
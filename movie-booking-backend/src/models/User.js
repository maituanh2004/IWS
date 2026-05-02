const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// User schema definition for storing user information
const userSchema = new mongoose.Schema({
    // Name of the user, required
    name: {
        type: String,
        required: [true, 'Please add a name']
    },
    // Email of the user, required, unique, and must match email regex
    email: {
        type: String,
        required: [true, 'Please add an email'],
        unique: true,
        lowercase: true,
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Please add a valid email'
        ]
    },
    // Password of the user, required, min length 6, not selected by default for security
    password: {
        type: String,
        required: [true, 'Please add a password'],
        minlength: 6,
        select: false
    },
    // Role of the user, either 'customer' or 'admin', defaults to 'customer'
    role: {
        type: String,
        enum: ['customer', 'admin'],
        default: 'customer'
    },
    // Timestamp when the user was created, defaults to current date
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Pre-save middleware to encrypt password using bcrypt before saving
userSchema.pre('save', async function (next) {
    // Only hash if password is modified
    if (!this.isModified('password')) {
        return next();
    }
    // Generate salt and hash password
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Instance method to match entered password with hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Export the User model
module.exports = mongoose.model('User', userSchema);

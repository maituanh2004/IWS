const mongoose = require('mongoose');

// Movie schema definition for storing movie information
const movieSchema = new mongoose.Schema({
    // Title of the movie, required and trimmed
    title: {
        type: String,
        required: [true, 'Please add a title'],
        trim: true
    },
    // Description of the movie, required
    description: {
        type: String,
        required: [true, 'Please add a description']
    },
    // Poster image URL, defaults to 'no-photo.jpg' if not provided
    poster: {
        type: String,
        default: 'no-photo.jpg'
    },
    // Duration in minutes, required
    duration: {
        type: Number,
        required: [true, 'Please add duration in minutes']
    },
    // Genre of the movie, required
    genre: {
        type: String,
        required: [true, 'Please add genre']
    },
    // Release date of the movie, required
    releaseDate: {
        type: Date,
        required: [true, 'Please add release date']
    },
    // Timestamp when the movie was created, defaults to current date
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Export the Movie model
module.exports = mongoose.model('Movie', movieSchema);

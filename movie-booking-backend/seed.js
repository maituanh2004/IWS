const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const mongoose = require('mongoose');
const User = require('./src/models/User');
const Movie = require('./src/models/Movie');
const Showtime = require('./src/models/Showtime');
const connectDB = require('./src/config/database');
const Discount = require('./src/models/Discount');
const seedData = async () => {
    try {
        await connectDB();

        // Clear existing data
        console.log('Clearing existing data...');
        await User.deleteMany({});
        await Movie.deleteMany({});
        await Showtime.deleteMany({});
        await Discount.deleteMany({});

        // =============================
        // USERS
        // =============================
        console.log('Creating users...');
        await User.create({
            name: 'Admin',
            email: 'admin@example.com',
            password: 'admin123',
            role: 'admin'
        });

        await User.create({
            name: 'John Doe',
            email: 'customer@example.com',
            password: 'customer123',
            role: 'customer'
        });

        console.log('✅ Users created');

        // =============================
        // MOVIES
        // =============================
        console.log('Creating movies...');

        const movies = await Movie.create([
            {
                title: 'Avengers: Endgame',
                description: 'Avengers assemble to undo Thanos.',
                poster: 'https://image.tmdb.org/t/p/w500/or06FN3Dka5tukK1e9sl16pB3iy.jpg',
                duration: 181,
                genre: 'Action, Adventure, Sci-Fi',
                releaseDate: new Date('2019-04-26')
            },
            {
                title: 'The Shawshank Redemption',
                description: 'Two prisoners find redemption.',
                poster: 'https://image.tmdb.org/t/p/w500/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg',
                duration: 142,
                genre: 'Drama',
                releaseDate: new Date('1994-09-23')
            },
            {
                title: 'Inception',
                description: 'Dream invasion mission.',
                poster: 'https://image.tmdb.org/t/p/w500/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg',
                duration: 148,
                genre: 'Action, Sci-Fi, Thriller',
                releaseDate: new Date('2010-07-16')
            }
        ]);

        console.log(`✅ Created ${movies.length} movies`);

        // =============================
        // ONLY ADD SHOWTIMES FOR INCEPTION
        // =============================
        console.log('Creating showtimes (May)...');

        const avengers = movies.find(m => m.title === 'Avengers: Endgame');
        const shawshank = movies.find(m => m.title === 'The Shawshank Redemption');
        const inception = movies.find(m => m.title === 'Inception');

        const showtimes = [

            // =====================
            // AVENGERS
            // =====================
            {
                movie: avengers._id,
                startTime: new Date('2026-05-01T10:00:00'),
                endTime: new Date('2026-05-01T13:00:00'),
                room: '1',
                totalSeats: 80,
                basePrice: 100000
            },
            {
                movie: avengers._id,
                startTime: new Date('2026-05-01T14:00:00'),
                endTime: new Date('2026-05-01T17:00:00'),
                room: '1',
                totalSeats: 80,
                basePrice: 110000
            },
            {
                movie: avengers._id,
                startTime: new Date('2026-05-01T19:30:00'),
                endTime: new Date('2026-05-01T22:30:00'),
                room: '2',
                totalSeats: 80,
                basePrice: 130000
            },
            {
                movie: avengers._id,
                startTime: new Date('2026-05-02T10:00:00'),
                endTime: new Date('2026-05-02T13:00:00'),
                room: '1',
                totalSeats: 80,
                basePrice: 100000
            },
            {
                movie: avengers._id,
                startTime: new Date('2026-05-02T14:00:00'),
                endTime: new Date('2026-05-02T17:00:00'),
                room: '1',
                totalSeats: 80,
                basePrice: 110000
            },
            {
                movie: avengers._id,
                startTime: new Date('2026-05-02T19:30:00'),
                endTime: new Date('2026-05-02T22:30:00'),
                room: '2',
                totalSeats: 80,
                basePrice: 130000
            },

            // =====================
            // SHAWSHANK
            // =====================
            {
                movie: shawshank._id,
                startTime: new Date('2026-05-01T10:00:00'),
                endTime: new Date('2026-05-01T12:30:00'),
                room: '1',
                totalSeats: 80,
                basePrice: 90000
            },
            {
                movie: shawshank._id,
                startTime: new Date('2026-05-01T14:00:00'),
                endTime: new Date('2026-05-01T16:30:00'),
                room: '1',
                totalSeats: 80,
                basePrice: 100000
            },
            {
                movie: shawshank._id,
                startTime: new Date('2026-05-01T19:30:00'),
                endTime: new Date('2026-05-01T22:00:00'),
                room: '2',
                totalSeats: 80,
                basePrice: 110000
            },
            {
                movie: shawshank._id,
                startTime: new Date('2026-05-02T10:00:00'),
                endTime: new Date('2026-05-02T12:30:00'),
                room: '1',
                totalSeats: 80,
                basePrice: 90000
            },
            {
                movie: shawshank._id,
                startTime: new Date('2026-05-02T14:00:00'),
                endTime: new Date('2026-05-02T16:30:00'),
                room: '1',
                totalSeats: 80,
                basePrice: 100000
            },
            {
                movie: shawshank._id,
                startTime: new Date('2026-05-02T19:30:00'),
                endTime: new Date('2026-05-02T22:00:00'),
                room: '2',
                totalSeats: 80,
                basePrice: 110000
            },

            // =====================
            // INCEPTION
            // =====================
            {
                movie: inception._id,
                startTime: new Date('2026-05-01T10:00:00'),
                endTime: new Date('2026-05-01T12:30:00'),
                room: '1',
                totalSeats: 80,
                basePrice: 90000
            },
            {
                movie: inception._id,
                startTime: new Date('2026-05-01T14:00:00'),
                endTime: new Date('2026-05-01T16:30:00'),
                room: '1',
                totalSeats: 80,
                basePrice: 100000
            },
            {
                movie: inception._id,
                startTime: new Date('2026-05-01T19:30:00'),
                endTime: new Date('2026-05-01T22:00:00'),
                room: '2',
                totalSeats: 80,
                basePrice: 120000
            },
            {
                movie: inception._id,
                startTime: new Date('2026-05-02T10:00:00'),
                endTime: new Date('2026-05-02T12:30:00'),
                room: '1',
                totalSeats: 80,
                basePrice: 90000
            },
            {
                movie: inception._id,
                startTime: new Date('2026-05-02T14:00:00'),
                endTime: new Date('2026-05-02T16:30:00'),
                room: '1',
                totalSeats: 80,
                basePrice: 100000
            },
            {
                movie: inception._id,
                startTime: new Date('2026-05-02T19:30:00'),
                endTime: new Date('2026-05-02T22:00:00'),
                room: '2',
                totalSeats: 80,
                basePrice: 120000
            }
        ];

        await Showtime.create(showtimes);

        await Showtime.create(showtimes);

        console.log(`✅ Created ${showtimes.length} showtimes`);

        console.log('\n🎉 Database seeded successfully!');
        console.log('\n📋 Login Credentials:');
        console.log('   Admin: admin@example.com / admin123');
        console.log('   Customer: customer@example.com / customer123');

        process.exit(0);

    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
};

seedData();